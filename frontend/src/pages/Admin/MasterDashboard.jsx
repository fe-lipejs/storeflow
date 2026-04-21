import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Crown, TrendingUp, Users, AlertCircle, ExternalLink, MessageCircle } from 'lucide-react';

export default function MasterDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/master/dashboard', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('@SaaS:token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Sem permissão');
        return res.json();
      })
      .then(result => setData(result))
      .catch(() => setError(true));
  }, []);

  if (error) return <div className="admin-layout"><Sidebar /><main className="admin-main"><h2>Acesso Negado</h2><p>Você não é o administrador do sistema.</p></main></div>;
  if (!data) return <div className="admin-layout"><Sidebar /><main className="admin-main">Carregando métricas globais...</main></div>;

  const handleChargeClient = (store) => {
    const text = `Olá, dono(a) da loja *${store.name}*! Sua mensalidade do sistema está pendente e sua loja encontra-se suspensa. Acesse seu painel para regularizar.`;
    window.open(`https://wa.me/?text=${encodeURI(text)}`, '_blank');
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', margin: 0, color: '#1e293b' }}>
            <Crown size={32} color="#f59e0b" /> Master Dashboard
          </h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Visão global do seu império SaaS.</p>
        </header>

        {/* MÉTRICAS GLOBAIS (MRR) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="admin-card" style={{ marginBottom: 0, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <TrendingUp size={36} color="#d1fae5" />
              <div>
                <p style={{ margin: '0 0 5px', color: '#d1fae5', fontWeight: 'bold' }}>Receita Recorrente (MRR)</p>
                <h2 style={{ margin: 0, fontSize: '32px' }}>R$ {data.metrics.mrr.toFixed(2)}</h2>
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '12px' }}><Users color="#3b82f6" size={28} /></div>
              <div>
                <p style={{ margin: '0 0 5px', color: '#64748b', fontWeight: 'bold' }}>Lojas Ativas</p>
                <h2 style={{ margin: 0, fontSize: '28px', color: '#1e293b' }}>{data.metrics.activeStores}</h2>
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '12px' }}><AlertCircle color="#ef4444" size={28} /></div>
              <div>
                <p style={{ margin: '0 0 5px', color: '#64748b', fontWeight: 'bold' }}>Lojas Inativas/Bloqueadas</p>
                <h2 style={{ margin: 0, fontSize: '28px', color: '#1e293b' }}>{data.metrics.inactiveStores}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* LISTA DE CLIENTES E LOJAS */}
        <h3 style={{ color: '#1e293b', marginBottom: '15px' }}>Seus Clientes ({data.stores.length})</h3>
        <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '15px 20px', color: '#475569' }}>Loja</th>
                <th style={{ padding: '15px 20px', color: '#475569' }}>Contato</th>
                <th style={{ padding: '15px 20px', color: '#475569' }}>Métricas</th>
                <th style={{ padding: '15px 20px', color: '#475569' }}>Status</th>
                <th style={{ padding: '15px 20px', color: '#475569', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.stores.map(store => (
                <tr key={store.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ fontWeight: 'bold', color: '#1e293b', display: 'block' }}>{store.name}</span>
                    <a href={`http://localhost:5173/${store.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      /{store.slug} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td style={{ padding: '15px 20px', color: '#64748b', fontSize: '14px' }}>{store.email}</td>
                  <td style={{ padding: '15px 20px', fontSize: '14px' }}>
                    <div style={{ color: '#10b981', fontWeight: 'bold' }}>{store.total_visits} Visitas</div>
                    <div style={{ color: '#64748b' }}>{store.total_products} Produtos</div>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    {store.subscription_status === 'active' 
                      ? <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Ativo</span>
                      : <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Inativo</span>
                    }
                  </td>
                  <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                    {store.subscription_status !== 'active' && (
                      <button onClick={() => handleChargeClient(store)} style={{ background: '#25D366', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '13px' }}>
                        <MessageCircle size={14} /> Cobrar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}