const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../database');
const OrderTemplate = require('../templates/OrderEmailTemplate');
const EmailService = require('../services/emailService');
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

module.exports = {
  // ==============================================================
  // 1. CRIA A INTENÇÃO DE PAGAMENTO (Venda de Produtos da Loja)
  // ==============================================================
  async createPaymentIntent(req, res) {
    const { order_id, total_amount, customer } = req.body;

    try {
      const order = await db('orders').where({ id: order_id }).first();
      const store = await db('stores').where({ id: order.store_id }).first();

      if (!store || !store.stripe_account_id) {
        return res.status(400).json({ error: 'Esta loja ainda não configurou os recebimentos.' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total_amount * 100),
        currency: 'brl',
        payment_method_types: ['card', 'boleto'],
        transfer_data: {
          destination: store.stripe_account_id, // O dinheiro vai pro lojista
        },
        metadata: {
          order_id: order_id.toString(),
          customer_email: customer.email
        }
      });

      return res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Erro no Stripe:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // ==============================================================
  // 2. WEBHOOK PRINCIPAL (Mensalidades e Vendas de Produtos)
  // Escuta a porta: /api/webhooks/stripe
  // ==============================================================
  async webhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('❌ Erro de Assinatura no Webhook Principal:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`\n🔔 NOVO EVENTO RECEBIDO (Webhook Principal): ${event.type}`);

    // ---> FLUXO A: PAGAMENTO DE PRODUTO (Venda na Vitrine)
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.order_id;

      if (!orderId) {
        console.log('🔄 [Ignorado] Não é um produto da vitrine.');
      } else {
        try {
          await db('orders').where({ id: orderId }).update({ payment_status: 'pago', status: 'pago' });
          const order = await db('orders').where({ id: orderId }).first();
          const customer = await db('customers').where({ id: order.customer_id }).first();
          const store = await db('stores').where({ id: order.store_id }).first();
          const items = await db('order_items').where({ order_id: orderId })
            .join('products', 'order_items.product_id', 'products.id')
            .select('order_items.*', 'products.name as product_name');

          if (store && customer) {
            const emailHtml = OrderTemplate(order, customer, store, items);
            await EmailService.sendOrderConfirmation(customer.email, emailHtml);
          }
          console.log(`✅ SUCESSO: Pedido #${orderId} da vitrine foi pago!`);
        } catch (dbError) {
          console.error('❌ Erro ao processar banco (Produtos):', dbError);
        }
      }
    }

    // ---> FLUXO B: ASSINATURA CRIADA (O lojista acabou de pagar o checkout)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (session.mode === 'subscription') {
        const storeId = session.client_reference_id;

        console.log(`\n--- 🔍 ATIVANDO NOVA ASSINATURA ---`);
        console.log(`ID da Loja: ${storeId}`);
        console.log(`ID do Cliente Stripe: ${session.customer}`);

        if (storeId) {
          try {
            await db('stores').where({ id: storeId }).update({
              subscription_status: 'active',
              stripe_customer_id: session.customer,
              subscription_id: session.subscription
            });
            console.log(`🚀 [SaaS] Loja ID ${storeId} ATIVADA com sucesso no banco!`);
          } catch (err) {
            console.error('❌ Erro no MySQL ao ativar assinatura:', err);
          }
        }
      }
    }

    // ---> FLUXO C: RENOVAÇÃO / ATRASO DE PAGAMENTO
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;

      console.log(`\n--- 🔄 ATUALIZAÇÃO DE STATUS DA ASSINATURA ---`);
      console.log(`Novo Status: ${subscription.status}`);

      try {
        await db('stores')
          .where({ stripe_customer_id: subscription.customer })
          .update({ subscription_status: subscription.status });
        console.log(`🚀 [SaaS] Status atualizado para: ${subscription.status.toUpperCase()}`);
      } catch (err) {
        console.error('❌ Erro ao atualizar status de renovação:', err);
      }
    }

    // ---> FLUXO D: CANCELAMENTO DE ASSINATURA
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      try {
        await db('stores')
          .where({ stripe_customer_id: subscription.customer })
          .update({ subscription_status: 'canceled' });
        console.log(`💀 [SaaS] Assinatura cancelada definitivamente para o cliente: ${subscription.customer}`);
      } catch (err) {
        console.error('❌ Erro ao cancelar assinatura no MySQL:', err);
      }
    }

    res.json({ received: true });
  },

  // ==============================================================
  // 2.5 WEBHOOK CONNECT (Exclusivo para os Lojistas / Subcontas)
  // Escuta a porta: /api/webhooks/stripe-connect
  // ==============================================================
  async webhookConnect(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // ⚠️ ATENÇÃO: USA A SENHA DO NOVO WEBHOOK DO CONNECT!
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET_CONNECT);
      // Dentro do seu webhookConnect, logo após o event = stripe.webhooks.constructEvent...

      console.log('--------------------------------------------');
      console.log('📩 EVENTO RECEBIDO:', event.type);
      const account = event.data.object;
      console.log('🆔 ID DA CONTA NO WEBHOOK:', account.id);
      console.log('📝 DADOS SUBMETIDOS (details_submitted):', account.details_submitted);

      if (event.type === 'account.updated') {
        // Verifique se o seu IF está exatamente assim:
        if (account.details_submitted) {
          try {
            const rowsAffected = await db('stores')
              .where({ stripe_account_id: account.id })
              .update({ onboarded: 1 });

            console.log('🔢 LINHAS AFETADAS NO BANCO:', rowsAffected);

            if (rowsAffected === 0) {
              console.log('⚠️ AVISO: Nenhuma loja encontrada com esse stripe_account_id no banco!');
            } else {
              console.log('✅ SUCESSO: Banco atualizado!');
            }
          } catch (error) {
            console.error('❌ ERRO NO UPDATE:', error);
          }
        } else {
          console.log('ℹ️ A conta foi atualizada, mas os detalhes ainda não foram totalmente submetidos.');
        }
      }
      console.log('--------------------------------------------');
    } catch (err) {
      console.error('❌ Erro de Assinatura no Webhook Connect:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`\n🔗 NOVO EVENTO DO CONNECT RECEBIDO: ${event.type}`);

    // ---> FLUXO E: FINALIZAÇÃO DA CONTA BANCÁRIA
    if (event.type === 'account.updated') {
      const account = event.data.object;

      console.log(`\n--- 🏦 ANALISANDO CONTA CONNECT ---`);
      console.log(`ID da Conta: ${account.id}`);
      console.log(`Detalhes submetidos? ${account.details_submitted}`);
      console.log(`Cobranças ativadas? ${account.charges_enabled}`);

      // Liberamos o onboarded se ele submeteu os detalhes OU se o Stripe já ativou as cobranças
      if (account.details_submitted || account.charges_enabled) {
        try {
          await db('stores')
            .where({ stripe_account_id: account.id })
            .update({ onboarded: 1 });
          console.log(`✅ [SaaS] O Lojista terminou de configurar a conta bancária! Banco atualizado para 1.`);
        } catch (err) {
          console.error('❌ Erro ao atualizar onboarded no banco:', err);
        }
      } else {
        console.log(`⚠️ A conta conectou, mas o cadastro no Stripe ainda está incompleto.`);
      }
    }

    res.json({ received: true });
  },

  // ==============================================================
  // 3. GERAR LINK DO CONNECT (Para o lojista configurar a conta bancária)
  // ==============================================================
  async createConnectAccount(req, res) {
    const { store_id } = req.body;

    try {
      const store = await db('stores').where({ id: store_id }).first();
      if (!store) return res.status(404).json({ error: 'Loja não encontrada.' });

      let accountId = store.stripe_account_id;

      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'BR',
          email: store.email,
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
      console.error("❌ Erro Connect:", error);
      return res.status(500).json({ error: 'Erro ao iniciar integração financeira.' });
    }
  },

  // ==============================================================
  // 4. CRIAR CHECKOUT DE ASSINATURA (Para o lojista pagar VOCÊ)
  // ==============================================================
  async createSubscription(req, res) {
    const { store_id } = req.body;

    try {
      const store = await db('stores').where({ id: store_id }).first();
      if (!store) return res.status(404).json({ error: 'Loja não encontrada.' });

      let stripeCustomerId = store.stripe_customer_id;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: store.email,
          name: store.name,
          metadata: { store_id: store.id }
        });
        stripeCustomerId = customer.id;
        await db('stores').where({ id: store_id }).update({ stripe_customer_id: stripeCustomerId });
      }

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
        client_reference_id: store_id.toString(),
      });

      return res.json({ url: session.url });
    } catch (error) {
      console.error("Erro Assinatura:", error);
      return res.status(500).json({ error: 'Erro ao gerar checkout de assinatura.' });
    }
  },

  // ==============================================================
  // 5. PORTAL DO CLIENTE (Para o lojista gerenciar cartão/cancelar)
  // ==============================================================
  async createPortalSession(req, res) {
    const { store_id } = req.body;
    try {
      const store = await db('stores').where({ id: store_id }).first();
      const session = await stripe.billingPortal.sessions.create({
        customer: store.stripe_customer_id,
        return_url: `${frontendUrl}/admin/configuracoes`,
      });
      return res.json({ url: session.url });
    } catch (error) {
      console.error("Erro Portal Billing:", error);
      return res.status(500).json({ error: 'Erro ao acessar portal de assinatura.' });
    }
  },

  // ==============================================================
  // 6. DASHBOARD CONNECT (Para o lojista ver extrato e mudar banco)
  // ==============================================================
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