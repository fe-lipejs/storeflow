import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, User, MapPin, LogOut, ChevronDown, ArrowLeft, CreditCard } from 'lucide-react';

export default function CustomerDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('pedidos');
  const [customer, setCustomer] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('@SaaS:customer_token');
    const customerData = localStorage.getItem('@SaaS:customer_data');

    if (!token || !customerData) {
      navigate(`/${slug}/minha-conta`);
      return;
    }

    setCustomer(JSON.parse(customerData));

    // BUSCAR DADOS DO BANCO
    fetch('http://localhost:3000/api/customer/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setOrders(data);
      })
      .catch(err => console.error("Erro ao carregar pedidos"))
      .finally(() => setLoading(false));

  }, [slug, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('@SaaS:customer_token');
    localStorage.removeItem('@SaaS:customer_data');
    navigate(`/${slug}`);
  };

  const getStatusVisual = (status) => {
    switch(status?.toLowerCase()) {
      case 'pago': 
      case 'approved': return { text: 'Pagamento Aprovado', bg: '#d1fae5', color: '#10b981' }; // Verde
      case 'enviado': return { text: 'Enviado', bg: '#e0e7ff', color: '#4f46e5' }; // Azul
      case 'entregue': return { text: 'Entregue', bg: '#dcfce3', color: '#16a34a' }; // Verde Escuro
      case 'cancelado': return { text: 'Cancelado', bg: '#fee2e2', color: '#dc2626' }; // Vermelho
      default: return { text: 'Aguardando Pagamento', bg: '#fef3c7', color: '#f59e0b' }; // Amarelo Padrão
    }
  };

  if (!customer) return <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Montserrat' }}>Carregando...</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        
        body { background: #f9fafb; margin: 0; font-family: 'Montserrat', sans-serif; }
        
        .dash-header { background: #fff; padding: 20px 40px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
        .dash-logo { font-size: 20px; font-weight: 900; color: #000; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; }
        
        .dash-container { max-width: 1200px; margin: 40px auto; padding: 0 20px; display: grid; grid-template-columns: 280px 1fr; gap: 40px; align-items: start; }
        
        @media (max-width: 768px) {
          .dash-container { grid-template-columns: 1fr; gap: 20px; margin: 20px auto; }
        }

        /* SIDEBAR (Menu Esquerdo) */
        .dash-sidebar { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .dash-user-card { padding: 25px; border-bottom: 1px solid #e5e7eb; display: flex; gap: 15px; align-items: center; }
        .dash-avatar { width: 45px; height: 45px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #000; font-size: 18px; border: 1px solid #e2e8f0; }
        
        .dash-nav-btn { width: 100%; text-align: left; background: none; border: none; padding: 18px 25px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 15px; transition: 0.2s; border-bottom: 1px solid #f8fafc; }
        .dash-nav-btn:hover { background: #f8fafc; color: #000; }
        .dash-nav-btn.active { color: #000; font-weight: 700; border-left: 4px solid #000; background: #fafafa; }

        /* CONTEÚDO PRINCIPAL */
        .dash-content { background: transparent; }
        .content-title { font-size: 24px; font-weight: 800; margin: 0 0 25px; letter-spacing: -0.5px; }

        /* CARD DO PEDIDO */
        .order-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 20px; transition: 0.2s; }
        .order-card:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.03); border-color: #cbd5e1; }
        
        .order-header { padding: 20px; display: grid; grid-template-columns: 1fr 1fr 1.5fr 1fr 1fr auto; gap: 15px; align-items: center; cursor: pointer; }
        @media (max-width: 900px) {
          .order-header { grid-template-columns: 1fr; }
          .order-header > div { display: flex; justify-content: space-between; align-items: center; }
        }

        .info-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; display: block; }
        .info-value { font-size: 14px; font-weight: 600; color: #000; }
        
        .status-pill { padding: 6px 12px; border-radius: 50px; font-size: 12px; font-weight: 700; display: inline-block; white-space: nowrap; }
        
        .order-details { border-top: 1px solid #f1f5f9; padding: 20px; background: #fafafa; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; animation: fadeIn 0.3s; }
        .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e5e7eb; font-size: 13px; font-weight: 500; }
        .item-row:last-child { border-bottom: none; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* HEADER SUPERIOR */}
      <header className="dash-header">
        <Link to={`/${slug}`} className="dash-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowLeft size={20} color="#64748b" /> VOLTAR À LOJA
        </Link>
      </header>

      <div className="dash-container">
        
        {/* SIDEBAR (MENU ESQUERDO) */}
        <aside className="dash-sidebar">
          <div className="dash-user-card">
            <div className="dash-avatar">{customer.name.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Bem-vindo,</div>
              <div style={{ fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>{customer.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{customer.email}</div>
            </div>
          </div>

          <nav>
            <button className={`dash-nav-btn ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos')}>
              <Package size={18} /> Meus Pedidos
            </button>
            <button className={`dash-nav-btn ${activeTab === 'dados' ? 'active' : ''}`} onClick={() => setActiveTab('dados')}>
              <User size={18} /> Meus Dados
            </button>
            <button className={`dash-nav-btn ${activeTab === 'enderecos' ? 'active' : ''}`} onClick={() => setActiveTab('enderecos')}>
              <MapPin size={18} /> Meus Endereços
            </button>
            <button className="dash-nav-btn" onClick={handleLogout} style={{ color: '#dc2626' }}>
              <LogOut size={18} /> Sair
            </button>
          </nav>
        </aside>

        {/* ÁREA CENTRAL */}
        <main className="dash-content">
          
          {activeTab === 'pedidos' && (
            <>
              <h2 className="content-title">Meus Pedidos</h2>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Buscando seus pedidos...</div>
              ) : orders.length === 0 ? (
                <div className="order-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <Package size={48} style={{ margin: '0 auto 15px', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600 }}>Você ainda não fez nenhum pedido.</p>
                  <Link to={`/${slug}`} style={{ color: '#000', fontWeight: 700, marginTop: '10px', display: 'inline-block' }}>Ir às compras</Link>
                </div>
              ) : (
                orders.map(order => {
                  const visual = getStatusVisual(order.payment_status);
                  
                  return (
                    <div key={order.id} className="order-card">
                      
                      {/* CABEÇALHO DO PEDIDO */}
                      <div className="order-header" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                        <div>
                          <span className="info-label">Número do Pedido</span>
                          <span className="info-value">#{order.id}</span>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                            {new Date(order.created_at).toLocaleDateString('pt-BR')} - {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        
                        <div>
                          <span className="info-label">Pagamento</span>
                          <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'capitalize' }}>
                            <CreditCard size={14} color="#64748b" /> {order.payment_method?.replace('_', ' ') || 'Processando'}
                          </span>
                        </div>

                        <div>
                          <span className="info-label">Status</span>
                          <span className="status-pill" style={{ background: visual.bg, color: visual.color }}>
                            {visual.text}
                          </span>
                        </div>

                        <div>
                          <span className="info-label">Valor Total</span>
                          <span className="info-value" style={{ fontWeight: 800 }}>R$ {parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>

                        <div>
                          <span className="info-label">Rastreio</span>
                          <span className="info-value" style={{ fontSize: '13px' }}>{order.tracking_code || 'Ainda não enviado'}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '10px' }}>
                          <ChevronDown size={20} color="#94a3b8" style={{ transform: expandedOrder === order.id ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                        </div>
                      </div>

                      {/* DETALHES DO PEDIDO (Expansível) */}
                      {expandedOrder === order.id && (
                        <div className="order-details">
                          <h4 style={{ margin: '0 0 15px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b' }}>Itens do Pedido</h4>
                          {order.items && order.items.map((item, idx) => (
                            <div key={item.id || idx} className="item-row">
                              <span>{item.quantity}x {item.product_name || item.name || 'Produto'}</span>
                              <span style={{ fontWeight: 700 }}>R$ {parseFloat(item.price).toFixed(2)}</span>
                            </div>
                          ))}
                          
                          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button style={{ background: 'transparent', color: '#dc2626', border: '1px solid #dc2626', padding: '10px 20px', borderRadius: '5px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>
                              Solicitar Cancelamento / Ajuda
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'dados' && (
            <>
              <h2 className="content-title">Meus Dados</h2>
              <div className="order-card" style={{ padding: '30px' }}>
                <p>Configurações de conta em breve.</p>
              </div>
            </>
          )}

          {activeTab === 'enderecos' && (
            <>
              <h2 className="content-title">Meus Endereços</h2>
              <div className="order-card" style={{ padding: '30px' }}>
                <p>Gerenciamento de endereços em breve.</p>
              </div>
            </>
          )}

        </main>
      </div>
    </>
  );
}