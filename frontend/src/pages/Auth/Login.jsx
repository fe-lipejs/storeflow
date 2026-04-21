import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Store, ShoppingBag, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const fromStore = location.state?.fromStore;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Mensagem de sucesso ao vir da tela de registro
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('@SaaS:token', data.token);
        localStorage.setItem('@SaaS:user', JSON.stringify(data.user));
        localStorage.setItem('@SaaS:store', JSON.stringify(data.store));
        navigate('/admin');
      } else {
        alert(data.error || 'E-mail ou senha incorretos.');
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        
        body, html { margin: 0; padding: 0; font-family: 'Montserrat', sans-serif; background-color: #f4f4f9; }
        
        .page-container { display: flex; flex-direction: column; min-height: 100vh; }
        
        /* HEADER LÁ EM CIMA */
        .top-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; background: transparent; }
        .brand-logo { font-size: 18px; font-weight: 900; color: #000; text-decoration: none; letter-spacing: 1px; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
        .nav-link { color: #64748b; font-weight: 600; font-size: 14px; text-decoration: none; transition: 0.2s; }
        .nav-link:hover { color: #000; }

        .auth-container { flex: 1; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .auth-card { background-color: #fff; padding: 50px 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); width: 100%; max-width: 420px; box-sizing: border-box; }
        
        .success-box { background: #f0fdf4; color: #16a34a; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; border: 1px solid #bbf7d0; text-align: center; }

        .saas-input { width: 100%; padding: 16px; border-radius: 8px; border: 1.5px solid #e2e8f0; background-color: #f8fafc; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 500; color: #000; box-sizing: border-box; transition: all 0.2s ease; outline: none; margin-bottom: 15px; }
        .saas-input:focus { border-color: #000; background-color: #fff; box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05); }
        .saas-input::placeholder { color: #94a3b8; }
        
        .password-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .forgot-link { font-size: 12px; font-weight: 600; color: #64748b; text-decoration: none; }
        .forgot-link:hover { color: #000; text-decoration: underline; }

        .saas-btn { width: 100%; background-color: #000; color: #fff; padding: 16px; border: none; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .saas-btn:hover { background-color: #333; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .saas-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }
      `}</style>
      
      <div className="page-container">
        
       {/* === MENU INTELIGENTE === */}
        <nav className="top-nav">
          {fromStore ? (
            // Se veio de uma loja, mostra a marca da loja e botão de voltar pra ela
            <>
              <Link to={`/${fromStore.slug}`} className="brand-logo">
                <Store size={20} /> {fromStore.name}
              </Link>
              <Link to={`/${fromStore.slug}`} className="nav-link">Voltar para a vitrine</Link>
            </>
          ) : (
            // Se veio do site principal, mostra o padrão do MeuSaaS
            <>
              <Link to="/" className="brand-logo">
                <ShoppingBag size={20} /> MEUSAAS
              </Link>
              <Link to="/cadastro" className="nav-link">Criar minha loja</Link>
            </>
          )}
        </nav>

        {/* === CONTEÚDO CENTRAL === */}
        <div className="auth-container">
          <div className="auth-card">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <Store size={40} color="#000" style={{ marginBottom: '15px' }} />
              <h2 style={{ margin: 0, color: '#000', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px' }}>Bem-vindo de volta</h2>
              <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '14px', fontWeight: 500 }}>Faça login para gerenciar sua loja</p>
            </div>
            
            {successMessage && (
              <div className="success-box">
                <CheckCircle2 size={16} /> {successMessage}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
              
              <input 
                type="email" 
                placeholder="Seu e-mail profissional" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="saas-input" 
              />
              
              {/* === O "ESQUECI A SENHA" NA MESMA LINHA DO LABEL === */}
              <div>
                <div className="password-header">
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#000' }}>Senha</span>
                  <Link to="/esqueci-senha" className="forgot-link">Esqueceu a senha?</Link>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="saas-input" 
                  style={{ marginBottom: 0 }}
                />
              </div>

              <button type="submit" disabled={loading} className="saas-btn">
                {loading ? 'Acessando...' : 'Acessar Painel'}
              </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
              Não tem uma loja? <Link to="/cadastro" style={{ color: '#000', fontWeight: 800, textDecoration: 'none' }}>Crie agora</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}