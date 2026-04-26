const express = require('express');
const routes = express.Router();
const multer = require('multer');
const multerConfig = require('./config/multer');
const nodemailer = require('nodemailer');

const StripeController = require('./controllers/StripeController');
const CustomerOrderController = require('./controllers/CustomerOrderController');
const CustomerAuthController = require('./controllers/CustomerAuthController');
const AuthController = require('./controllers/AuthController');
const StoreController = require('./controllers/StoreController');
const ProductController = require('./controllers/ProductController');
const PaymentController = require('./controllers/PaymentController');
const SuperAdminController = require('./controllers/SuperAdminController');
const db = require('./database');

// Importando o Segurança (Middleware)
const authMiddleware = require('./middlewares/auth');

// ==========================================
// 🛡️ SISTEMA ANTI-CRASH (Evita o servidor cair)
// ==========================================
const safe = (fn) => {
  return (req, res, next) => {
    if (typeof fn === 'function') {
      return fn(req, res, next);
    } else {
      console.error("❌ AVISO: Uma rota foi chamada, mas a função não existe no Controlador.");
      return res.status(500).json({ error: "Rota em construção ou função não encontrada." });
    }
  };
};

// ==========================================
// CONFIGURAÇÃO DE E-MAIL (Simulação)
// ==========================================
const transporter = nodemailer.createTransport({
  streamTransport: true,
  newline: 'windows',
  logger: false
});

// ==========================================
// 🟢 ROTAS PÚBLICAS (NÃO PRECISAM DE LOGIN)
// ==========================================

routes.post('/register', safe(AuthController.register));
routes.post('/login', safe(AuthController.login));
routes.post('/forgot-password', safe(AuthController.forgotPassword));
routes.post('/reset-password', safe(AuthController.resetPassword));

routes.get('/:slug', safe(StoreController.show));

// Webhook do Mercado Pago
routes.post('/webhooks/mercadopago', safe(PaymentController.webhook));


// ==========================================
// 🛒 ROTAS DO CHECKOUT DA VITRINE
// ==========================================

// 1. Captura de Carrinho Abandonado (Lead)
routes.post('/checkout/abandoned', async (req, res) => {
  const { store_id, customer, cart } = req.body;
  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  try {
    const existing = await db('abandoned_carts')
      .where({ store_id, customer_email: customer.email, status: 'open' }).first();

    if (existing) {
      await db('abandoned_carts').where({ id: existing.id }).update({
        cart_data: JSON.stringify(cart), total_amount: totalAmount,
        customer_name: customer.name, customer_phone: customer.phone
      });
    } else {
      await db('abandoned_carts').insert({
        store_id, customer_name: customer.name, customer_email: customer.email,
        customer_phone: customer.phone, cart_data: JSON.stringify(cart),
        total_amount: totalAmount, status: 'open'
      });
    }
    res.json({ message: 'Lead capturado em background.' });
  } catch (error) {
    res.status(500).json({ error: 'Falha silenciosa' });
  }
});


// 2. Finalização da Compra (Cria Pedido e Envia E-mails)
routes.post('/checkout/order', async (req, res) => {
  const { store_id, customer, cart, shipping_method } = req.body;
  const trx = await db.transaction();

  try {
    let [customerId] = await trx('customers').insert({
      store_id, name: customer.name, email: customer.email,
      phone: customer.phone, address: customer.address
    });

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const [orderId] = await trx('orders').insert({
      store_id, customer_id: customerId, total_amount: totalAmount,
      status: 'pending', shipping_method: shipping_method || 'correios'
    });

    for (let item of cart) {
      await trx('order_items').insert({
        order_id: orderId, product_id: item.id,
        quantity: item.quantity, price: item.price
      });
    }

    await trx('abandoned_carts')
      .where({ store_id, customer_email: customer.email, status: 'open' })
      .update({ status: 'recovered' });

    await trx.commit();

    const storeInfo = await db('stores').where({ id: store_id }).first();

    if (storeInfo) {
      transporter.sendMail({
        from: `"${storeInfo.name}" <nao-responda@meusaas.com>`,
        to: customer.email,
        subject: `Pedido #${orderId} Confirmado! 🎉`,
        text: `Olá ${customer.name}!\n\nSeu pedido no valor de R$ ${totalAmount.toFixed(2)} foi recebido com sucesso na loja ${storeInfo.name}.`
      }, (err, info) => { if (info) console.log('\n📧 --- E-MAIL PARA O CLIENTE ENVIADO --- 📧\n'); });

      transporter.sendMail({
        from: `"MeuSaaS Admin" <sistema@meusaas.com>`,
        to: storeInfo.email,
        subject: `🤑 Nova Venda Realizada! (Pedido #${orderId})`,
        text: `Parabéns!\n\nNova venda no valor de R$ ${totalAmount.toFixed(2)}.\nCliente: ${customer.name}`
      }, (err, info) => { if (info) console.log('\n💰 --- E-MAIL PARA O LOJISTA ENVIADO --- 💰\n'); });
    }

    res.status(201).json({ order_id: orderId, message: 'Pedido finalizado!' });

  } catch (error) {
    await trx.rollback();
    res.status(500).json({ error: 'Erro ao processar pedido' });
  }
});

// 3. Comunicação com o Mercado Pago
routes.post('/checkout/pay', safe(PaymentController.createPayment));

//Cliente Conta
routes.post('/customer/request-otp', safe(CustomerAuthController.requestOtp));
routes.post('/customer/verify-otp', safe(CustomerAuthController.verifyOtp));
routes.get('/customer/orders', safe(CustomerOrderController.listOrders));

routes.post('/checkout/create-payment-intent', safe(StripeController.createPaymentIntent));


// ==========================================
// 🛑 O SEGURANÇA NA PORTA (Exige Login JWT)
// ==========================================
routes.use(authMiddleware);


// ==========================================
// 🔴 ROTAS PRIVADAS (SÓ PARA O DONO DA LOJA LOGADO)
// ==========================================

routes.post('/upload', multer(multerConfig).single('file'), (req, res) => {
  const fileUrl = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`;
  return res.json({ url: fileUrl });
});

// Assinatura do Lojista
routes.post('/checkout', safe(PaymentController.createSubscription));

// Dashboard (Métricas Financeiras do Lojista)
routes.get('/stores/:storeId/dashboard', async (req, res) => {
  const { storeId } = req.params;

  // Segurança
  if (parseInt(storeId) !== req.storeId) return res.status(403).json({ error: 'Sem permissão' });

  try {
    // 1. Total Faturado (Pedidos com status 'paid')
    const revenueQuery = await db('orders')
      .where({ store_id: storeId, status: 'paid' })
      .sum('total_amount as total_revenue')
      .first();
    const totalRevenue = revenueQuery.total_revenue || 0;

    // 2. Pedidos Pendentes (Aguardando envio)
    const pendingOrdersQuery = await db('orders')
      .where({ store_id: storeId, status: 'paid' }) // Pago, mas não enviado
      .whereNull('tracking_code')
      .count('id as total_pending')
      .first();
    const pendingOrders = pendingOrdersQuery.total_pending || 0;

    // 3. Dinheiro na mesa (Carrinhos Abandonados Abertos)
    const abandonedQuery = await db('abandoned_carts')
      .where({ store_id: storeId, status: 'open' })
      .sum('total_amount as lost_money')
      .first();
    const lostMoney = abandonedQuery.lost_money || 0;

    // 4. Total de Vendas (Quantidade de pedidos pagos)
    const totalSalesQuery = await db('orders')
      .where({ store_id: storeId, status: 'paid' })
      .count('id as total_sales')
      .first();
    const totalSales = totalSalesQuery.total_sales || 0;

    const storeInfo = await db('stores').where({ id: storeId }).first();

    res.json({
      revenue: parseFloat(totalRevenue),
      pending_orders: parseInt(pendingOrders),
      lost_money: parseFloat(lostMoney),
      total_sales: parseInt(totalSales),
      subscription_status: storeInfo.subscription_status,
      stripe_account_id: storeInfo.stripe_account_id,
      onboarded: storeInfo.onboarded 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao carregar dashboard financeiro' });
  }
});

routes.put('/stores/:slug/appearance', safe(StoreController.updateAppearance));

// Categorias e Produtos
routes.get('/stores/:storeId/categories', async (req, res) => {
  const categories = await db('categories').where({ store_id: req.params.storeId });
  return res.json(categories);
});
routes.post('/categories', async (req, res) => {
  const [id] = await db('categories').insert({ store_id: req.body.store_id, name: req.body.name });
  return res.status(201).json({ id, name: req.body.name });
});
routes.delete('/categories/:id', async (req, res) => {
  await db('categories').where({ id: req.params.id }).del();
  res.json({ message: 'Apagada' });
});

routes.post('/products', safe(ProductController.store));

routes.get('/stores/:storeId/products', async (req, res) => {
  const products = await db('products')
    .select('products.*', 'categories.name as category_name')
    .leftJoin('categories', 'products.category_id', 'categories.id')
    .where({ 'products.store_id': req.params.storeId }).orderBy('products.id', 'desc');
  res.json(products);
});
routes.put('/products/:id', async (req, res) => {
  const { name, description, price, promo_price, category_id, images, variations, is_featured } = req.body;
  await db('products').where({ id: req.params.id }).update({
    name, description, price, promotional_price: promo_price || null, category_id: category_id || null,
    images: images ? JSON.stringify(images) : null, variations: variations || null, is_featured: is_featured || false
  });
  res.json({ message: 'Atualizado!' });
});
routes.delete('/products/:id', async (req, res) => {
  await db('products').where({ id: req.params.id }).del();
  res.json({ message: 'Apagado' });
});

// Pedidos
routes.get('/orders/:id/items', async (req, res) => {
  const items = await db('order_items').select('order_items.*', 'products.name', 'products.image_url')
    .leftJoin('products', 'order_items.product_id', 'products.id').where({ order_id: req.params.id });
  res.json(items);
});

// Buscar todos os pedidos de uma loja específica (Admin)
routes.get('/stores/:storeId/orders', async (req, res) => {
  const { storeId } = req.params;

  if (parseInt(storeId) !== req.storeId) return res.status(403).json({ error: 'Sem permissão' });

  try {
    const orders = await db('orders')
      .select('orders.*', 'customers.name as customer_name', 'customers.email as customer_email')
      .leftJoin('customers', 'orders.customer_id', 'customers.id')
      .where({ 'orders.store_id': storeId })
      .orderBy('orders.id', 'desc');

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

routes.put('/orders/:id', async (req, res) => {
  await db('orders').where({ id: req.params.id }).update({ status: req.body.status, tracking_code: req.body.tracking_code || null });
  res.json({ message: 'Atualizado' });
});

// Buscar todos os pedidos de uma loja
routes.get('/stores/:storeId/orders', async (req, res) => {
  const { storeId } = req.params;
  if (parseInt(storeId) !== req.storeId) return res.status(403).json({ error: 'Sem permissão' });

  try {
    const orders = await db('orders')
      .select('orders.*', 'customers.name as customer_name', 'customers.email as customer_email')
      .leftJoin('customers', 'orders.customer_id', 'customers.id')
      .where({ 'orders.store_id': storeId })
      .orderBy('orders.id', 'desc');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// Master
routes.get('/master/dashboard', safe(SuperAdminController.getMasterDashboard));

// ==========================================
// ROTAS FINANCEIRAS DO LOJISTA (STRIPE)
// ==========================================
routes.post('/stripe/create-subscription', safe(StripeController.createSubscription));
routes.post('/stripe/create-connect-account', safe(StripeController.createConnectAccount));
// PORTAIS DE AUTOATENDIMENTO
routes.post('/stripe/create-portal-session', safe(StripeController.createPortalSession));
routes.post('/stripe/create-connect-login-link',safe(StripeController.createConnectLoginLink));


module.exports = routes;