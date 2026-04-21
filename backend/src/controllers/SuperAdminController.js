const db = require('../database');

module.exports = {
    async getMasterDashboard(req, res) {
        try {

            if (!req.storeId) {
                return res.status(401).json({ error: 'Erro de autenticação. Faça login novamente.' });
            }
            // 1. Verifica se quem está acessando é realmente o "Administrador Rei"
            const user = await db('stores').where({ id: req.storeId }).first();

            if (!user || user.role !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado. Área restrita ao dono do SaaS.' });
            }

            // 2. Busca todas as lojas (ordenando pelo ID, que temos certeza que existe)
            const stores = await db('stores')
                .select('id', 'name', 'slug', 'email', 'subscription_status', 'role')
                .orderBy('id', 'desc');

            // 3. Busca as contagens de forma separada e segura
            const visits = await db('visits').select('store_id').count('id as total').groupBy('store_id');
            const products = await db('products').select('store_id').count('id as total').groupBy('store_id');

            // 4. Junta as informações magicamente
            const formattedStores = stores.map(store => {
                const storeVisits = visits.find(v => v.store_id === store.id);
                const storeProducts = products.find(p => p.store_id === store.id);
                return {
                    ...store,
                    total_visits: storeVisits ? storeVisits.total : 0,
                    total_products: storeProducts ? storeProducts.total : 0
                };
            });

            // 5. Calcula suas métricas globais
            const activeStores = stores.filter(s => s.subscription_status === 'active' && s.role !== 'admin').length;
            const inactiveStores = stores.filter(s => s.subscription_status !== 'active' && s.role !== 'admin').length;

            const monthlyPrice = 50; // Sua mensalidade
            const mrr = activeStores * monthlyPrice;

            return res.json({
                stores: formattedStores.filter(s => s.role !== 'admin'), // Retorna todos menos você mesmo
                metrics: { activeStores, inactiveStores, mrr }
            });

        } catch (error) {
            console.error("ERRO NO MASTER DASHBOARD:", error);
            return res.status(500).json({ error: 'Erro ao carregar o Painel Mestre.' });
        }
    }
};