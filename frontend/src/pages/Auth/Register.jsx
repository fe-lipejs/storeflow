import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // NOVO: Estado específico para guardar os erros de cada input
  const [fieldErrors, setFieldErrors] = useState({ email: '', storeName: '' });
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    storeName: ''
  });

  const generateSlug = (name) => {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const currentSlug = generateSlug(form.storeName);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToastMessage(null);
    setFieldErrors({ email: '', storeName: '' }); // Limpa os erros ao tentar de novo

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          store_name: form.storeName
        })
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login', { state: { message: 'Conta criada com sucesso! Faça seu login.' } });
      } else {
        const errorMsg = data.error || 'Erro ao criar conta.';
        
        // A MÁGICA DA VALIDAÇÃO INLINE:
        // Se o erro do backend falar de e-mail, jogamos o erro pro input de e-mail.
        if (errorMsg.toLowerCase().includes('e-mail')) {
          setFieldErrors(prev => ({ ...prev, email: errorMsg }));
        } 
        // Se o erro falar do nome da loja, jogamos pro input da loja.
        else if (errorMsg.toLowerCase().includes('nome de loja')) {
          setFieldErrors(prev => ({ ...prev, storeName: errorMsg }));
        } 
        // Se for outro erro bizarro, aí sim usamos o Toast genérico.
        else {
          showToast(errorMsg);
        }
      }
    } catch (err) {
      showToast('Falha de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar o erro do campo assim que o usuário começar a digitar de novo
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: '' });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        
        body, html { margin: 0; padding: 0; font-family: 'Montserrat', sans-serif; background: #fff; color: #000; }
        .auth-container { display: flex; min-height: 100vh; }
        .auth-left { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 40px; max-width: 550px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .auth-header { margin-bottom: 40px; }
        .brand-logo { font-size: 20px; font-weight: 900; color: #000; text-decoration: none; letter-spacing: 1px; text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin-bottom: 50px; }
        .auth-title { font-size: 32px; font-weight: 800; letter-spacing: -1px; margin: 0 0 10px; color: #000; }
        .auth-subtitle { color: #666; font-size: 15px; line-height: 1.5; margin: 0; }
        .auth-form { display: flex; flex-direction: column; gap: 20px; }
        
        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .input-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #000; letter-spacing: 0.5px; }
        
        .auth-input { width: 100%; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; background: #f9fafb; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 500; color: #000; box-sizing: border-box; transition: 0.2s; outline: none; }
        .auth-input:focus { border-color: #000; background: #fff; box-shadow: 0 0 0 4px rgba(0,0,0,0.05); }
        
        /* NOVO: Estilos para quando o campo dá erro */
        .auth-input.input-error { border-color: #ef4444; background: #fef2f2; }
        .auth-input.input-error:focus { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
        .field-error-msg { color: #ef4444; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 2px; animation: fadeIn 0.3s; }
        
        .slug-preview { font-size: 12px; color: #666; font-weight: 500; background: #f3f4f6; padding: 10px; border-radius: 6px; display: inline-block; margin-top: -10px; }
        .slug-preview span { color: #000; font-weight: 700; }
        .btn-submit { background: #000; color: #fff; border: none; padding: 18px; border-radius: 50px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: 0.3s; display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 10px; }
        .btn-submit:hover { background: #333; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .btn-submit:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }
        .auth-footer { margin-top: 40px; text-align: center; font-size: 14px; color: #666; font-weight: 500; }
        .auth-footer a { color: #000; font-weight: 700; text-decoration: none; margin-left: 5px; }
        .auth-footer a:hover { text-decoration: underline; }
        .auth-right { flex: 1; background: #000; position: relative; overflow: hidden; display: none; flex-direction: column; justify-content: space-between; padding: 60px; color: #fff; }
        .auth-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.4; mix-blend-mode: overlay; }
        .trust-badge { position: relative; z-index: 10; display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
        .quote-box { position: relative; z-index: 10; max-width: 450px; }
        .quote-text { font-size: 32px; font-weight: 800; line-height: 1.3; margin: 0 0 20px; letter-spacing: -1px; }
        .quote-author { font-size: 14px; color: #a1a1aa; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

        .toast-notification { position: fixed; top: 40px; right: 20px; background: #000; color: white; padding: 15px 20px; font-weight: 600; font-size: 13px; text-transform: uppercase; z-index: 300; display: flex; align-items: center; justify-content: space-between; gap: 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); animation: fadeIn 0.3s; min-width: 250px; }
        .toast-close { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .toast-close:hover { color: #fff; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @media (min-width: 900px) { .auth-right { display: flex; } }
      `}</style>

      {toastMessage && (
        <div className="toast-notification">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} color="#ef4444" /> {toastMessage}
          </div>
          <button className="toast-close" onClick={() => setToastMessage(null)}>
            <X size={18} />
          </button>
        </div>
      )}

      <div className="auth-container">
        <div className="auth-left">
          <Link to="/" className="brand-logo">
            <ShoppingBag size={24} /> MEUSAAS
          </Link>
          <br />
          <div className="auth-header">
            <h1 className="auth-title">Crie sua loja grátis.</h1>
            <br />
            <p className="auth-subtitle">Comece a vender no piloto automático hoje mesmo. Não pedimos cartão de crédito para testar.</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="input-group">
              <label className="input-label">Seu Nome Completo</label>
              <input 
                type="text" 
                required 
                placeholder="Ex: João Silva" 
                className="auth-input"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">E-mail de Acesso</label>
              <input 
                type="email" 
                required 
                placeholder="seu@email.com" 
                className={`auth-input ${fieldErrors.email ? 'input-error' : ''}`}
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
              />
              {/* O AVISO VERMELHO APARECE AQUI SE O E-MAIL ESTIVER DUPLICADO */}
              {fieldErrors.email && (
                <span className="field-error-msg"><AlertCircle size={12} /> {fieldErrors.email}</span>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Nome da sua Loja</label>
              <input 
                type="text" 
                required 
                placeholder="Ex: Loja do João" 
                className={`auth-input ${fieldErrors.storeName ? 'input-error' : ''}`}
                value={form.storeName}
                onChange={e => handleChange('storeName', e.target.value)}
              />
              {/* O AVISO VERMELHO APARECE AQUI SE O NOME DA LOJA (SLUG) JÁ EXISTIR */}
              {fieldErrors.storeName && (
                <span className="field-error-msg"><AlertCircle size={12} /> {fieldErrors.storeName}</span>
              )}
            </div>
            
            {form.storeName && !fieldErrors.storeName && (
              <div className="slug-preview">
                Sua vitrine será: <span>meusaas.com/{currentSlug}</span>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Senha Segura</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                className="auth-input"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Criando império...' : 'Criar Minha Loja'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer">
            Já tem uma loja? <Link to="/login">Faça Login</Link>
          </div>
        </div>

        <div className="auth-right">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop" alt="E-commerce Lifestyle" className="auth-image" />
          
          <div className="trust-badge">
            <CheckCircle2 size={20} color="#10b981" />
            +500 Lojas Ativas
          </div>

          <div className="quote-box">
            <p className="quote-text">"A melhor decisão que tomei para a minha marca foi sair da bagunça do WhatsApp e ter uma vitrine de verdade."</p>
            <div className="quote-author">Empreendedores Inteligentes</div>
          </div>
        </div>

      </div>
    </>
  );
}