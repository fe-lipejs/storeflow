import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, AlertCircle, TrendingUp, Package, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    revenue: 0, pending_orders: 0, lost_money: 0, total_sales: 0
  });
  const [loading, setLoading] = useState(true);
  
  const storeData = JSON.parse(localStorage.getItem('@SaaS:store') || '{}');

  useEffect(() => {
    // Simula a busca na API que criamos no passo anterior
    // Na vida real, o fetch usaria o Token JWT no header
    setTimeout(() => {
      setMetrics({
        revenue: 4590.50, // Mockado para você ver o visual enquanto não tem venda real no banco
        pending_orders: 12,
        lost_money: 850.00,
        total_sales: 48
      });
      setLoading(false);
    }, 800);
  }, [storeData.id]);

  return (
    <div className="admin-layout">
      <Sidebar />
      
      <main className="admin-main">
        <div className="admin-content-wrapper">
          
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '28px', letterSpacing: '-1px', marginBottom: '5px' }}>Visão Geral</h1>
              <p style={{ color: '#666', margin: 0, fontWeight: 500 }}>Acompanhe o desempenho da loja <strong>{storeData.name}</strong></p>
            </div>
            
            {/* O Botão para o lojista ver a própria vitrine dele online */}
            <a href={`/${storeData.slug || 'demo'}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', color: '#000', padding: '10px 20px', borderRadius: '6px', border: '1px solid #eee', textDecoration: 'none', fontWeight: 600, fontSize: '13px', transition: '0.2s' }}>
              Ver Minha Loja <ExternalLink size={16} />
            </a>
          </header>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>Carregando métricas...</div>
          ) : (
            <>
              {/* GRID DE MÉTRICAS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                
                {/* Card Faturamento */}
                <div className="admin-card" style={{ padding: '30px', margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px', borderRadius: '8px' }}>
                      <DollarSign size={24} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 8px', borderRadius: '4px' }}>+12% este mês</span>
                  </div>
                  <h3 style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 5px' }}>Faturamento Total</h3>
                  <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>
                    R$ {metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Card Vendas */}
                <div className="admin-card" style={{ padding: '30px', margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ background: '#eff6ff', color: '#2563eb', padding: '10px', borderRadius: '8px' }}>
                      <TrendingUp size={24} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 5px' }}>Vendas Concluídas</h3>
                  <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>
                    {metrics.total_sales}
                  </div>
                </div>

                {/* Card Pedidos Pendentes */}
                <div className="admin-card" style={{ padding: '30px', margin: 0, border: metrics.pending_orders > 0 ? '1px solid #fef08a' : '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ background: '#fefce8', color: '#ca8a04', padding: '10px', borderRadius: '8px' }}>
                      <Package size={24} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 5px' }}>Aguardando Envio</h3>
                  <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>
                    {metrics.pending_orders}
                  </div>
                  {metrics.pending_orders > 0 && (
                    <Link to="/admin/pedidos" style={{ display: 'inline-block', marginTop: '15px', fontSize: '12px', fontWeight: 700, color: '#ca8a04', textDecoration: 'none' }}>
                      DESPACHAR AGORA →
                    </Link>
                  )}
                </div>

                {/* Card Carrinho Abandonado (O "Susto") */}
                <div className="admin-card" style={{ padding: '30px', margin: 0, border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px' }}>
                      <AlertCircle size={24} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 5px' }}>Dinheiro Perdido (Abandonos)</h3>
                  <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', color: '#dc2626' }}>
                    R$ {metrics.lost_money.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <button style={{ marginTop: '15px', background: 'none', border: 'none', color: '#dc2626', fontWeight: 700, fontSize: '12px', padding: 0, cursor: 'pointer' }}>
                    RECUPERAR VENDAS →
                  </button>
                </div>
                
              </div>

              {/* AVISO DE ASSINATURA (Passo 4 UI) */}
              <div style={{ background: '#000', color: '#fff', padding: '30px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 800 }}>Assinatura MeuSaaS</h3>
                  <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>Sua loja está em período de testes. Assine o Plano Profissional para manter sua loja no ar e continuar vendendo.</p>
                </div>
                <button className="admin-btn" style={{ background: '#fff', color: '#000' }}>
                  Ativar Plano - R$ 49/mês
                </button>
              </div>

            </>
          )}

        </div>
      </main>
    </div>
  );
}