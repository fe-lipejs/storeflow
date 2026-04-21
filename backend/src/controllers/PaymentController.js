const db = require('../database');
const axios = require('axios');

const MP_TOKEN = process.env.MP_ACCESS_TOKEN;

module.exports = {
  // 1. GERA O PAGAMENTO (CHECKOUT DA VITRINE)
  async createPayment(req, res) {
    const { 
      order_id, 
      payment_method, 
      customer, 
      card_token, 
      installments, 
      issuer_id, 
      doc_number 
    } = req.body;

    try {
      const order = await db('orders').where({ id: order_id }).first();
      if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

      let paymentPayload = {
        transaction_amount: Number(order.total_amount),
        description: `Pedido #${order.id} - MeuSaaS`,
        payment_method_id: payment_method, 
        notification_url: 'https://seu-dominio.com/api/webhooks/mercadopago',
        payer: {
          email: customer.email,
          first_name: customer.name.split(' ')[0],
          last_name: customer.name.split(' ').slice(1).join(' ') || ' ',
          identification: { type: 'CPF', number: doc_number }
        }
      };

      if (payment_method === 'pix') {
        paymentPayload.payment_method_id = 'pix';
      } else if (payment_method === 'boleto') {
        paymentPayload.payment_method_id = 'bolbradesco';
      } else {
        paymentPayload.token = card_token;
        paymentPayload.installments = Number(installments);
        paymentPayload.issuer_id = issuer_id;
      }

      const response = await axios.post(
        'https://api.mercadopago.com/v1/payments',
        paymentPayload,
        {
          headers: {
            'Authorization': `Bearer ${MP_TOKEN}`,
            'X-Idempotency-Key': `order_${order_id}`
          }
        }
      );

      const mp = response.data;

      await db('orders').where({ id: order_id }).update({ transaction_id: mp.id });

      return res.json({
        id: mp.id,
        status: mp.status,
        status_detail: mp.status_detail,
        qr_code: mp.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: mp.point_of_interaction?.transaction_data?.qr_code_base64,
        boleto_url: mp.transaction_details?.external_resource_url,
        barcode: mp.barcode?.content
      });

    } catch (error) {
      console.error('ERRO MP:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Erro ao processar com o banco.' });
    }
  },

  // 2. O WEBHOOK (Avisa quando foi pago)
  async webhook(req, res) {
    const { action, data } = req.body;
    if (action === 'payment.updated' || action === 'payment.created') {
      const paymentInfo = await axios.get(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: { 'Authorization': `Bearer ${MP_TOKEN}` }
      });

      if (paymentInfo.data.status === 'approved') {
        await db('orders').where({ transaction_id: data.id }).update({ status: 'paid' });
      }
    }
    return res.status(200).send('OK');
  },

  // 3. ASSINATURA DA PLATAFORMA (Cobrar o Lojista mensalmente)
  async createSubscription(req, res) {
    // No mundo real, pegamos o e-mail do lojista logado através do req.userId
    // const storeAdminEmail = req.user.email; 

    try {
      const response = await axios.post(
        'https://api.mercadopago.com/preapproval',
        {
          reason: 'MeuSaaS - Plano Profissional Completo',
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: 49.00,
            currency_id: 'BRL'
          },
          back_url: 'http://localhost:5173/admin', // Para onde ele volta depois de assinar
          status: 'pending'
        },
        {
          headers: {
            'Authorization': `Bearer ${MP_TOKEN}`
          }
        }
      );

      // Retorna o link mágico para o Frontend redirecionar o lojista
      return res.json({ init_point: response.data.init_point });

    } catch (error) {
      console.error('Erro ao gerar assinatura:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Falha ao criar plano de assinatura.' });
    }
  }
};