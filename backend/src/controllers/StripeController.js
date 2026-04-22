const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../database');
const OrderTemplate = require('../templates/OrderEmailTemplate');
const EmailService = require('../services/emailService');
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

module.exports = {
  // 1. CRIA A INTENÇÃO DE PAGAMENTO (Para o Checkout Transparente)
  async createPaymentIntent(req, res) {
    const { order_id, total_amount, customer } = req.body;

    try {
      // NOVO: Precisamos buscar a loja no banco para descobrir a conta Stripe dela!
      const order = await db('orders').where({ id: order_id }).first();
      const store = await db('stores').where({ id: order.store_id }).first();

      // TRAVA DE SEGURANÇA: O lojista não pode vender se não plugar a conta bancária antes
      if (!store || !store.stripe_account_id) {
        return res.status(400).json({
          error: 'Esta loja ainda não configurou os recebimentos.'
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total_amount * 100), // Stripe trabalha com centavos
        currency: 'brl',
        payment_method_types: ['card', 'boleto'],

        // ==============================================================
        // O SEGREDO DO STRIPE CONNECT: Direciona o dinheiro pro Lojista
        // ==============================================================
        transfer_data: {
          destination: store.stripe_account_id,
        },
        // Opcional: Se você quiser cobrar taxa de 2%, descomente a linha abaixo:
        // application_fee_amount: Math.round(total_amount * 0.02 * 100),

        metadata: {
          order_id: order_id.toString(), // Stripe prefere formato de texto
          customer_email: customer.email
        }
      });

      return res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Erro no Stripe:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // 2. OUVINTE DE SUCESSO (O Webhook que o Stripe chama nos bastidores)
  async webhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // Verifica se a mensagem veio mesmo do Stripe
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('❌ Erro de Assinatura no Webhook:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Como é checkout transparente, escutamos o sucesso do Payment Intent
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.order_id;

      try {
        // 1. Atualiza o status no banco para 'pago'
        await db('orders').where({ id: orderId }).update({ payment_status: 'pago', status: 'pago' });

        // 2. Busca os dados para montar o e-mail
        const order = await db('orders').where({ id: orderId }).first();
        const customer = await db('customers').where({ id: order.customer_id }).first();
        const store = await db('stores').where({ id: order.store_id }).first();
        const items = await db('order_items').where({ order_id: orderId })
          .join('products', 'order_items.product_id', 'products.id')
          .select('order_items.*', 'products.name as product_name'); // Garante que o nome vá para o template

        // 3. Dispara o E-mail Premium (O ÚNICO que deve sair!)
        if (store && customer) {
          const emailHtml = OrderTemplate(order, customer, store, items);
          await EmailService.sendOrderConfirmation(customer.email, emailHtml);
        }

        console.log(`✅ SUCESSO: Pedido #${orderId} pago com sucesso via Stripe!`);
      } catch (dbError) {
        console.error('❌ Erro ao processar banco de dados no Webhook:', dbError);
      }
    }

    // 1. Quando ele assina pela primeira vez ou o status muda (ex: de active para past_due)
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customerId = subscription.customer; // ID do cliente no Stripe
      const status = subscription.status; // 'active', 'past_due', 'canceled', etc.

      try {
        await db('stores')
          .where({ stripe_customer_id: customerId })
          .update({
            subscription_status: status,
            subscription_id: subscription.id
          });
        console.log(`🔄 [SaaS] Status da loja atualizado para: ${status}`);
      } catch (err) {
        console.error('Erro ao atualizar status da assinatura:', err);
      }
    }

    // 2. Quando a assinatura é cancelada (pelo lojista ou por falta de pagamento crônica)
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      try {
        await db('stores')
          .where({ stripe_customer_id: subscription.customer })
          .update({ subscription_status: 'canceled' });
        console.log(`❌ [SaaS] Assinatura cancelada definitivamente.`);
      } catch (err) {
        console.error('Erro ao cancelar assinatura:', err);
      }
    }

    // Retorna status 200 pro Stripe saber que recebemos o recado
    res.json({ received: true });
  },

  // 3. GERA O LINK DE INTEGRAÇÃO (O Lojista clica para conectar a conta dele)
  async createConnectAccount(req, res) {
    const { store_id } = req.body;

    try {
      const store = await db('stores').where({ id: store_id }).first();

      if (!store) {
        return res.status(404).json({ error: 'Loja não encontrada.' });
      }

      let accountId = store.stripe_account_id;

      // Se ele não tem conta no Stripe ainda, criamos uma "Express"
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'BR', // Garante que o Stripe saiba que é do Brasil
          email: store.email, // Já manda o e-mail preenchido pra facilitar pro lojista
        });
        accountId = account.id;
        await db('stores').where({ id: store_id }).update({ stripe_account_id: accountId });
      }


      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${frontendUrl}/admin/configuracoes`,
        return_url: `${frontendUrl}/admin/configuracoes?connect=success`,
        type: 'account_onboarding',
      });

      return res.json({ url: accountLink.url });
    } catch (error) {
      // O SEU TERMINAL VAI GRITAR O ERRO EXATO AQUI:
      console.error("❌ Erro Connect:", error);
      return res.status(500).json({ error: 'Erro ao iniciar integração financeira.' });
    }
  },

  //4. CRIAR ASSINATURA DO LOJISTA (Para ele pagar a Raffros Tecnologia)
  async createSubscription(req, res) {
    const { store_id } = req.body;

    try {
      // 1. Busca APENAS a loja (o e-mail já está aqui dentro!)
      const store = await db('stores').where({ id: store_id }).first();

      if (!store) {
        return res.status(404).json({ error: 'Loja não encontrada.' });
      }

      // 2. Criamos um "Cliente" no Stripe se ele ainda não tiver um ID
      let stripeCustomerId = store.stripe_customer_id;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: store.email, // Lendo direto da loja!
          name: store.name,   // Lendo direto da loja!
          metadata: { store_id: store.id }
        });
        stripeCustomerId = customer.id;
        await db('stores').where({ id: store_id }).update({ stripe_customer_id: stripeCustomerId });
      }


      // 3. Criamos uma sessão de checkout para Assinatura (Recorrente)
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{
          price: process.env.STRIPE_SUBSCRIPTION_PRICE_START,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${frontendUrl}/admin/configuracoes?payment=success`,
        cancel_url: `${frontendUrl}/admin/configuracoes?payment=cancel`,

      });

      return res.json({ url: session.url });
    } catch (error) {
      console.error("Erro Assinatura:", error);
      return res.status(500).json({ error: 'Erro ao gerar checkout de assinatura.' });
    }
  },

  // 5. PORTAL DE ASSINATURA (Para ele cancelar ou mudar o cartão)
  async createPortalSession(req, res) {
    const { store_id } = req.body;
    try {
      const store = await db('stores').where({ id: store_id }).first();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      const session = await stripe.billingPortal.sessions.create({
        customer: store.stripe_customer_id, // O ID do cliente que o Stripe criou na assinatura
        return_url: `${frontendUrl}/admin/configuracoes`,
      });

      return res.json({ url: session.url });
    } catch (error) {
      console.error("Erro Portal Billing:", error);
      return res.status(500).json({ error: 'Erro ao acessar portal de assinatura.' });
    }
  },

  // 6. DASHBOARD CONNECT (Para ele mudar a conta bancária de recebimento)
  async createConnectLoginLink(req, res) {
    const { store_id } = req.body;
    try {
      const store = await db('stores').where({ id: store_id }).first();

      const loginLink = await stripe.accounts.createLoginLink(store.stripe_account_id);

      return res.json({ url: loginLink.url });
    } catch (error) {
      console.error("Erro Login Link Connect:", error);
      return res.status(500).json({ error: 'Erro ao acessar painel financeiro.' });
    }
  }

};