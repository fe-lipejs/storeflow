import { useEffect, useState } from 'react';
import { CreditCard, Wallet, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export default function ConfiguracoesFinanceiras() {
    const [loadingConnect, setLoadingConnect] = useState(false);
    const [loadingSubscribe, setLoadingSubscribe] = useState(false);

    const [storeData, setStoreData] = useState({});

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('@SaaS:store') || '{}');
        setStoreData(data);
    }, []);

    const syncStoreData = async (currentStore) => {
        try {
            const token = localStorage.getItem('@SaaS:token');
            const res = await fetch(`http://localhost:3000/api/stores/${currentStore.id}/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const updatedDataFromDB = await res.json();
                const newStoreData = { ...currentStore, ...updatedDataFromDB };
                localStorage.setItem('@SaaS:store', JSON.stringify(newStoreData));
                setStoreData(newStoreData);
            }
        } catch (error) {
            console.error("Erro ao sincronizar:", error);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const connectSuccess = urlParams.get('connect');
        const paymentStatus = urlParams.get('payment');
        const currentStore = JSON.parse(localStorage.getItem('@SaaS:store') || '{}');

        if (connectSuccess === 'success') {
            alert("🎉 Conta Bancária conectada com sucesso!");
            syncStoreData(currentStore);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (paymentStatus === 'success') {
            alert("🚀 Pagamento aprovado! Seu Plano Profissional está ativo.");
            syncStoreData(currentStore);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (paymentStatus === 'cancel') {
            alert("⚠️ O pagamento foi cancelado. Você precisa assinar para manter a loja ativa.");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleManageSubscription = async () => {
        setLoadingSubscribe(true);
        try {
            const token = localStorage.getItem('@SaaS:token');
            const res = await fetch('http://localhost:3000/api/stripe/create-portal-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ store_id: storeData.id })
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (error) {
            alert("Erro ao carregar portal de pagamentos.");
        } finally {
            setLoadingSubscribe(false);
        }
    };

    const handleEditBankDetails = async () => {
        setLoadingConnect(true);
        try {
            const token = localStorage.getItem('@SaaS:token');
            const res = await fetch('http://localhost:3000/api/stripe/create-connect-login-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ store_id: storeData.id })
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (error) {
            alert("Erro ao carregar painel financeiro.");
        } finally {
            setLoadingConnect(false);
        }
    };

    const handleConnectStripe = async () => {
        setLoadingConnect(true);
        const token = localStorage.getItem('@SaaS:token');

        try {
            const res = await fetch('http://localhost:3000/api/stripe/create-connect-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ store_id: storeData.id })
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (error) {
            console.error("Erro Connect:", error);
            alert("Erro ao acessar integração financeira.");
        } finally {
            setLoadingConnect(false);
        }
    };

    const handleSubscribe = async () => {
        setLoadingSubscribe(true);
        const token = localStorage.getItem('@SaaS:token');

        try {
            const res = await fetch('http://localhost:3000/api/stripe/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ store_id: storeData.id })
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (error) {
            console.error("Erro Assinatura:", error);
            alert("Erro ao gerar checkout.");
        } finally {
            setLoadingSubscribe(false);
        }
    };

    return (
        <div className="admin-layout">
            <Sidebar />

            <main className="admin-main">
                <div className="admin-content-wrapper">
                    
                    {/* Limitador de largura para não esticar demais e margin 0 auto para centralizar */}
                    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0' }}>
                        
                        {/* CABEÇALHO CENTRALIZADO */}
                        <header style={{ marginBottom: '50px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h1 style={{ fontSize: '32px', letterSpacing: '-1px', marginBottom: '8px', fontWeight: 900 }}>Configurações</h1>
                            <p style={{ color: '#666', margin: 0, fontWeight: 500, fontSize: '15px' }}>Gerencie as finanças e a assinatura da sua plataforma.</p>
                        </header>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>

                            {/* CARD 1: RECEBIMENTOS (CONNECT) */}
                            <div className="admin-card" style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%' }}>
                                
                                <div style={{ background: '#eff6ff', color: '#2563eb', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
                                    <Wallet size={32} />
                                </div>
                                
                                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 5px' }}>Receber Pagamentos</h2>
                                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 25px' }}>Configuração da sua conta bancária</p>

                                <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', marginBottom: '35px', maxWidth: '320px' }}>
                                    Conecte sua conta via Stripe para receber o valor das suas vendas automaticamente. Sem essa configuração, seus clientes não conseguirão finalizar compras por cartão ou PIX.
                                </p>

                                <div style={{ marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {storeData.stripe_account_id ? (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#16a34a', fontWeight: 700, fontSize: '14px', background: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
                                                <CheckCircle size={20} /> Conta Bancária Conectada
                                            </div>
                                            <button onClick={handleEditBankDetails} className="admin-btn" style={{ width: '100%', background: '#eee', color: '#000', justifyContent: 'center' }}>
                                                Alterar Dados Bancários <ExternalLink size={16} style={{ marginLeft: '8px' }} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleConnectStripe}
                                            disabled={loadingConnect}
                                            className="admin-btn"
                                            style={{ width: '100%', justifyContent: 'center', gap: '10px', padding: '16px' }}
                                        >
                                            {loadingConnect ? 'Processando...' : 'Configurar Recebimentos'} <ArrowRight size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* CARD 2: ASSINATURA (BILLING) */}
                            <div className="admin-card" style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', border: storeData.subscription_status?.trim().toLowerCase() === 'active' ? '1px solid #eee' : '2px solid #000' }}>
                                
                                <div style={{ background: '#f8fafc', color: '#000', padding: '16px', borderRadius: '16px', border: '1px solid #eee', marginBottom: '20px' }}>
                                    <CreditCard size={32} />
                                </div>
                                
                                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 5px' }}>Plano MeuSaaS</h2>
                                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 25px' }}>Mensalidade da sua loja virtual</p>

                                <div style={{ marginBottom: '35px' }}>
                                    <div style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>R$ 49,00 <span style={{ fontSize: '14px', color: '#999', fontWeight: 500 }}>/mês</span></div>
                                    <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', margin: '0 auto', maxWidth: '280px' }}>
                                        Acesso ilimitado à vitrine, gestão de pedidos e suporte.
                                    </p>
                                </div>

                                <div style={{ marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {(storeData.subscription_status?.trim().toLowerCase() === 'active') ? (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#000', fontWeight: 700, fontSize: '14px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                                <CheckCircle size={20} /> Plano Profissional Ativo
                                            </div>
                                            <button onClick={handleManageSubscription} className="admin-btn" style={{ width: '100%', background: '#eee', color: '#000', justifyContent: 'center' }}>
                                                Gerenciar Assinatura <ExternalLink size={16} style={{ marginLeft: '8px' }} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleSubscribe}
                                            disabled={loadingSubscribe}
                                            className="admin-btn admin-btn-black"
                                            style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
                                        >
                                            {loadingSubscribe ? 'Carregando...' : (storeData.subscription_status === 'past_due' ? 'Regularizar Pendência' : 'ATIVAR PLANO PROFISSIONAL')}
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}