import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function CustomerLogin() {
  const { slug } = useParams(); // Pega o nome da loja na URL
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Pede E-mail, 2 = Pede Código
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Pede o código para o Backend
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/customer/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, store_slug: slug })
      });
      
      const data = await response.json();

      if (response.ok) {
        setStep(2); // Avança para a tela de digitar o código
      } else {
        setError(data.error || 'Erro ao buscar seu cadastro.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Envia o código para validar
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/customer/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otp, store_slug: slug })
      });
      
      const data = await response.json();

      if (response.ok) {
        // Salva o token do cliente (usamos um nome diferente para não deslogar o Lojista Admin)
        localStorage.setItem('@SaaS:customer_token', data.token);
        localStorage.setItem('@SaaS:customer_data', JSON.stringify(data.customer));
        
        // Joga pro painel de pedidos!
        navigate(`/${slug}/painel`);
      } else {
        setError(data.error || 'Código inválido ou expirado.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .customer-auth-wrap { display: flex; min-height: 100vh; align-items: center; justify-content: center; background: #f9fafb; font-family: 'Montserrat', sans-serif; padding: 20px; }
        .customer-card { background: #fff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); width: 100%; max-width: 400px; text-align: center; }
        
        .customer-icon-wrap { width: 60px; height: 60px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #000; }
        .customer-title { font-size: 22px; font-weight: 800; margin: 0 0 10px; letter-spacing: -0.5px; }
        .customer-subtitle { font-size: 14px; color: #64748b; margin: 0 0 30px; line-height: 1.5; }

        .customer-input { width: 100%; padding: 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 500; color: #000; box-sizing: border-box; outline: none; transition: 0.2s; text-align: center; }
        .customer-input:focus { border-color: #000; background: #fff; }
        
        /* Estilo especial para o campo do Código de 6 dígitos */
        .otp-input { letter-spacing: 8px; font-size: 24px; font-weight: 700; text-transform: uppercase; }

        .customer-btn { width: 100%; background: #000; color: #fff; border: none; padding: 18px; border-radius: 50px; font-weight: 800; font-family: 'Montserrat', sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; transition: 0.2s; }
        .customer-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .customer-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }

        .customer-error { background: #fef2f2; color: #dc2626; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 20px; border: 1px solid #fecaca; }
        
        .back-link { display: inline-flex; align-items: center; gap: 5px; color: #64748b; text-decoration: none; font-size: 13px; font-weight: 600; margin-top: 30px; transition: 0.2s; }
        .back-link:hover { color: #000; }
      `}</style>

      <div className="customer-auth-wrap">
        <div className="customer-card">
          
          {step === 1 ? (
            // PASSO 1: INFORMAR E-MAIL
            <>
              <div className="customer-icon-wrap"><Mail size={28} /></div>
              <h1 className="customer-title">Acompanhar Pedido</h1>
              <p className="customer-subtitle">Digite o e-mail usado na compra para acessar sua área do cliente.</p>
              
              {error && <div className="customer-error">{error}</div>}

              <form onSubmit={handleRequestOtp}>
                <input 
                  type="email" required placeholder="seu@email.com" 
                  className="customer-input" 
                  value={email} onChange={e => setEmail(e.target.value)} 
                />
                <button type="submit" disabled={loading} className="customer-btn">
                  {loading ? <Loader2 className="animate-spin" /> : 'Receber Código de Acesso'}
                </button>
              </form>
            </>
          ) : (
            // PASSO 2: DIGITAR O CÓDIGO (OTP)
            <>
              <div className="customer-icon-wrap"><KeyRound size={28} /></div>
              <h1 className="customer-title">Digite o código</h1>
              <p className="customer-subtitle">Enviamos um código de 6 dígitos para <strong>{email}</strong>.</p>
              
              {error && <div className="customer-error">{error}</div>}

              <form onSubmit={handleVerifyOtp}>
                <input 
                  type="text" required maxLength="6" placeholder="000000" 
                  className="customer-input otp-input" 
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} // Só aceita números
                />
                <button type="submit" disabled={loading || otp.length < 6} className="customer-btn">
                  {loading ? <Loader2 className="animate-spin" /> : <>Acessar Painel <ArrowRight size={18} /></>}
                </button>
              </form>
              
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: 600, marginTop: '20px', cursor: 'pointer', textDecoration: 'underline' }}>
                Tentar outro e-mail
              </button>
            </>
          )}

          <Link to={`/${slug}`} className="back-link">
            <ArrowLeft size={14} /> Voltar para a loja
          </Link>
        </div>
      </div>
    </>
  );
}