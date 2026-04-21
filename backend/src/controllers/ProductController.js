const db = require('../database');

module.exports = {
  // ==========================================
  // CADASTRAR NOVO PRODUTO
  // ==========================================
  async store(req, res) {
    const { 
      store_id, 
      name, 
      description, 
      price, 
      promo_price, 
      category_id, 
      images, 
      variations, 
      is_featured 
    } = req.body;

    try {
      // Insere os dados do produto na tabela 'products'
      const [id] = await db('products').insert({
        store_id,
        name,
        description,
        price,
        promotional_price: promo_price || null,
        category_id: category_id || null,
        // O banco de dados salva as fotos como um Texto (JSON String)
        images: images && images.length > 0 ? JSON.stringify(images) : null,
        variations: variations || null,
        is_featured: is_featured || false
      });

      return res.status(201).json({ id, message: 'Produto cadastrado com sucesso!' });
      
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      return res.status(500).json({ error: 'Erro interno ao salvar o produto.' });
    }
  }
};