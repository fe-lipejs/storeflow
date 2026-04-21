const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../database');
const OrderTemplate = require('../templates/OrderEmailTemplate');
const EmailService = require('../services/emailService');

module.exports = {
  // 1. CRIA A INTENÇÃO DE PAGAMENTO (Para o Checkout Transparente)
  async createPaymentIntent(req, res) {
    const { order_id, total_amount, customer } = req.body;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total_amount * 100), // Stripe trabalha com centavos
        currency: 'brl',
        //futuramento so colocar pix ...
        payment_method_types: ['card', 'boleto'], 
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
          .select('order_items.*', 'products.name as product_name'); // Garante que o nome do produto vá para o template

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

    // Retorna status 200 pro Stripe saber que recebemos o recado
    res.json({ received: true });
  }
};