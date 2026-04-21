const db = require('../database');

module.exports = {
  // Recebe os dados da Vitrine e cria o pedido oficial
  async checkout(req, res) {
    const { store_id, customer, cart, shipping_method } = req.body;

    try {
      // 1. Verifica se esse comprador já existe na loja usando o e-mail
      let customerRecord = await db('customers').where({ email: customer.email, store_id }).first();

      // Se não existe, cria um cadastro novo para ele automaticamente!
      if (!customerRecord) {
        const [newCustomerId] = await db('customers').insert({
          store_id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: JSON.stringify(customer.address) // Salva CEP, Rua, etc
        });
        customerRecord = { id: newCustomerId };
      }

      // 2. Calcula o valor total do carrinho por segurança (evita fraudes no front)
      const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      // 3. Cria o "Cabeçalho" do Pedido no banco
      const [orderId] = await db('orders').insert({
        store_id,
        customer_id: customerRecord.id,
        total_amount: totalAmount,
        shipping_method,
        status: 'pending' // Pedido criado, aguardando o cliente pagar
      });

      // 4. Salva todos os produtos que estavam no carrinho dentro deste pedido
      const orderItems = cart.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      await db('order_items').insert(orderItems);

      // AQUI NÃO TEM MAIS E-MAIL! O fluxo para aqui e avança para o Stripe.

      return res.status(201).json({
        order_id: orderId,
        message: 'Pedido gerado com sucesso!'
      });

    } catch (error) {
      console.error("ERRO NO CHECKOUT:", error);
      return res.status(500).json({ error: 'Erro ao processar o seu pedido.' });
    }
  }
};