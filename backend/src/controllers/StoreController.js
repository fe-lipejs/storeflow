const db = require('../database');

module.exports = {
  // ==========================================
  // BUSCAR A VITRINE PÚBLICA (Sem precisar de login)
  // ==========================================
  async show(req, res) {
    try {
      const store = await db('stores').where({ slug: req.params.slug }).first();
      
      if (!store) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      const products = await db('products')
        .select('products.*', 'categories.name as category_name')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .where({ 'products.store_id': store.id });

      return res.json({ store, products });
    } catch (error) {
      console.error('Erro ao buscar vitrine:', error);
      return res.status(500).json({ error: 'Erro ao carregar a loja' });
    }
  },

  // ==========================================
  // ATUALIZAR APARÊNCIA (Requer login)
  // ==========================================
  async updateAppearance(req, res) {
    try {
      const { theme_color, logo_url, banner_url } = req.body;
      const slug = req.params.slug;

      // Atualiza os campos no banco de dados
      await db('stores').where({ slug }).update({
        theme_color: theme_color || '#000000',
        logo_url: logo_url || null,
        banner_url: banner_url || null
      });

      return res.json({ message: 'Aparência atualizada com sucesso!' });
    } catch (error) {
      console.error('Erro ao atualizar aparência:', error);
      return res.status(500).json({ error: 'Erro ao salvar as configurações' });
    }
  }
};  