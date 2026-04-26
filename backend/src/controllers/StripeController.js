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
  // 2. WEBHOOK (Onde o Stripe avisa que o dinheiro caiu)
  // ==============================================================
  async webhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('❌ Erro de Assinatura no Webhook:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ---> FLUXO A: PAGAMENTO DE PRODUTO (O cliente da loja pagou)
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.order_id;

      // Trava: Se não tem orderId, é a assinatura do lojista, então ignora esse bloco.
      if (!orderId) {
        console.log('🔄 [SaaS] Pagamento de assinatura detectado no fluxo de produtos. Ignorando...');
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
          console.log(`✅ SUCESSO: Pedido #${orderId} pago com sucesso! E-mail enviado.`);
        } catch (dbError) {
          console.error('❌ Erro ao processar banco de dados no Webhook (Produtos):', dbError);
        }
      }
    }

    // ---> FLUXO B: ASSINATURA DO LOJISTA (O lojista pagou a sua mensalidade)
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customerId = subscription.customer; 
      const status = subscription.status; // 'active', 'past_due', etc.

      try {
        await db('stores')
          .where({ stripe_customer_id: customerId })
          .update({
            subscription_status: status,
            subscription_id: subscription.id
          });
        console.log(`🚀 [SaaS] Assinatura da Loja atualizada para: ${status.toUpperCase()}`);
      } catch (err) {
        console.error('❌ Erro ao atualizar status da assinatura:', err);
      }
    }

    // ---> FLUXO C: CANCELAMENTO DE ASSINATURA
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      try {
        await db('stores')
          .where({ stripe_customer_id: subscription.customer })
          .update({ subscription_status: 'canceled' });
        console.log(`💀 [SaaS] Assinatura cancelada definitivamente.`);
      } catch (err) {
        console.error('❌ Erro ao cancelar assinatura:', err);
      }
    }

    res.json({ received: true });
  },

  // ==============================================================
  // 3. GERAR LINK DO CONNECT (Para o lojista configurar a conta bancária dele)
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
        // Garante que o Stripe saiba qual loja está pagando
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