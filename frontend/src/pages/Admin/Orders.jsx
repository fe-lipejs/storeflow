import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { ShoppingBag, Search, Eye, MapPin, MessageCircle, Truck, X } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados de Edição do Pedido
  const [status, setStatus] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  const storeData = JSON.parse(localStorage.getItem('@SaaS:store') || '{}');
  const token = localStorage.getItem('@SaaS:token');

  const fetchOrders = async () => {
    if (!storeData.id) return;
    try {
      const res = await fetch(`http://localhost:3000/api/stores/${storeData.id}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) { console.error("Erro ao buscar pedidos"); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const openOrderDetails = async (order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setTrackingCode(order.tracking_code || '');
    
    // Busca os itens comprados neste pedido
    try {
      const res = await fetch(`http://localhost:3000/api/orders/${order.id}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrderItems(await res.json());
    } catch (error) { console.error("Erro ao buscar itens"); }
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, tracking_code: trackingCode })
      });
      if (res.ok) {
        alert("Pedido atualizado com sucesso!");
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error) { alert("Erro ao atualizar"); }
    finally { setLoading(false); }
  };

  // Função para traduzir o status do banco de dados para português
  const getStatusBadge = (statusStr) => {
    switch (statusStr) {
      case 'pending': return <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Pendente</span>;
      case 'paid': return <span style={{ background: '#d1fae5', color: '#059669', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Pago</span>;
      case 'shipped': return <span style={{ background: '#dbeafe', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Enviado</span>;
      case 'delivered': return <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Entregue</span>;
      default: return <span>{statusStr}</span>;
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', margin: 0, color: '#1e293b' }}>
            <ShoppingBag size={28} /> Gestão de Pedidos
          </h1>
        </header>

        <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
          {orders.length === 0 ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>Nenhum pedido recebido ainda.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '15px 20px', color: '#475569' }}>Pedido</th>
                  <th style={{ padding: '15px 20px', color: '#475569' }}>Data</th>
                  <th style={{ padding: '15px 20px', color: '#475569' }}>Cliente</th>
                  <th style={{ padding: '15px 20px', color: '#475569' }}>Status</th>
                  <th style={{ padding: '15px 20px', color: '#475569' }}>Total</th>
                  <th style={{ padding: '15px 20px', color: '#475569', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>#{o.id}</td>
                    <td style={{ padding: '15px 20px', color: '#64748b' }}>{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '15px 20px' }}>{o.customer_name}</td>
                    <td style={{ padding: '15px 20px' }}>{getStatusBadge(o.status)}</td>
                    <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>R$ {o.total_amount}</td>
                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                      <button onClick={() => openOrderDetails(o)} className="admin-btn" style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }}>
                        <Eye size={16} /> Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL DE DETALHES DO PEDIDO */}
        {selectedOrder && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', padding: '30px', position: 'relative' }}>
              <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#64748b" /></button>
              
              <h2 style={{ margin: '0 0 5px', fontSize: '22px' }}>Pedido #{selectedOrder.id}</h2>
              <p style={{ color: '#64748b', margin: '0 0 25px' }}>Realizado em: {new Date(selectedOrder.created_at).toLocaleString('pt-BR')}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {/* Info do Cliente */}
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 15px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} /> Dados de Entrega</h3>
                  <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{selectedOrder.customer_name}</p>
                  <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#475569' }}>{selectedOrder.customer_email}</p>
                  <p style={{ margin: '0 0 15px', fontSize: '14px', color: '#475569' }}>{selectedOrder.address || 'Endereço não informado'}</p>
                  
                  {/* Link mágico pro WhatsApp do Cliente */}
                  <a href={`https://wa.me/55${selectedOrder.phone?.replace(/\D/g, '')}?text=Olá ${selectedOrder.customer_name}, sou da loja ${storeData.name} e estou entrando em contato sobre o seu pedido #${selectedOrder.id}.`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', padding: '8px 15px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                    <MessageCircle size={16} /> Falar no WhatsApp
                  </a>
                </div>

                {/* Status e Rastreio */}
                <form onSubmit={handleUpdateOrder} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 15px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={18} /> Atualizar Pedido</h3>
                  
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Status da Compra</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="admin-input" style={{ marginBottom: '15px' }}>
                    <option value="pending">Aguardando Pagamento</option>
                    <option value="paid">Pagamento Aprovado</option>
                    <option value="shipped">Pedido Enviado (Em trânsito)</option>
                    <option value="delivered">Pedido Entregue</option>
                  </select>

                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Código de Rastreamento (Opcional)</label>
                  <input type="text" value={trackingCode} onChange={e => setTrackingCode(e.target.value)} placeholder="Ex: BR123456789BR" className="admin-input" style={{ marginBottom: '15px' }} />

                  <button type="submit" disabled={loading} className="admin-btn" style={{ padding: '12px' }}>
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </form>
              </div>

              {/* Lista de Itens */}
              <h3 style={{ fontSize: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Itens Comprados</h3>
              <div style={{ marginBottom: '20px' }}>
                {orderItems.map(item => {
                  // Pega a primeira foto ou usa fallback
                  const imgUrl = item.image_url ? (item.image_url.startsWith('[') ? JSON.parse(item.image_url)[0] : item.image_url) : null;
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      {imgUrl ? <img src={imgUrl} style={{ width: 50, height: 50, borderRadius: '6px', objectFit: 'cover' }} /> : <div style={{ width: 50, height: 50, background: '#e2e8f0', borderRadius: '6px' }} />}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 5px', fontWeight: 'bold', fontSize: '14px' }}>{item.name}</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{item.quantity}x de R$ {item.price}</p>
                      </div>
                      <div style={{ fontWeight: 'bold' }}>
                        R$ {(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: 'right', fontSize: '20px' }}>
                Total do Pedido: <strong style={{ color: '#10b981' }}>R$ {selectedOrder.total_amount}</strong>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}