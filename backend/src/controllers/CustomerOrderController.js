const db = require('../database');
const jwt = require('jsonwebtoken');

module.exports = {
  async listOrders(req, res) {
    // 1. Pegar o token do cabeçalho
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // 2. Descriptografar o token para descobrir quem é o cliente
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      const customerId = decoded.id;
      const storeId = decoded.store_id;

      // 3. Buscar os pedidos no banco (ordenados do mais novo pro mais velho)
      const orders = await db('orders')
        .where({ customer_id: customerId, store_id: storeId })
        .orderBy('created_at', 'desc');

      // Se não tiver nenhum pedido, já retorna vazio
      if (orders.length === 0) {
        return res.json([]);
      }

      // 4. Buscar os itens de TODOS esses pedidos
      const orderIds = orders.map(o => o.id);
      const orderItems = await db('order_items')
        .whereIn('order_id', orderIds);

      // 5. Montar o "Pacote Completo" (Pedido + Itens) para o Frontend
      const ordersWithItems = orders.map(order => {
        return {
          ...order,
          items: orderItems.filter(item => item.order_id === order.id)
        };
      });

      return res.json(ordersWithItems);

    } catch (error) {
      console.error('Erro ao buscar pedidos do cliente:', error);
      return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
    }
  }
};