import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('http://localhost:3000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      // Sempre mostramos sucesso por segurança
      setSuccess(true);
    } catch (error) {
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', background: '#f9fafb', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', padding: '50px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <div style={{ background: '#000', color: '#fff', padding: '15px', borderRadius: '12px' }}>
            <ShoppingBag size={32} />
          </div>
        </div>
    <br />
        <h1 style={{color: '#555', margin: '0 0 10px', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>Esqueceu a senha?</h1>
        <br />
        {success ? (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', color: '#10b981' }}>
              <CheckCircle2 size={48} />
            </div>
            <p style={{ color: '#555', fontSize: '15px', lineHeight: 1.6, marginBottom: '30px' }}>
              Se o e-mail <strong>{email}</strong> estiver cadastrado, enviamos um link seguro para você redefinir sua senha. Verifique sua caixa de entrada e spam.
            </p>
            <Link to="/login" style={{ display: 'inline-block', background: '#000', color: '#fff', textDecoration: 'none', padding: '16px 30px', borderRadius: '50px', fontWeight: 700, fontSize: '14px' }}>Voltar para o Login</Link>
          </div>
        ) : (
          <>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '30px' }}>
              Digite o e-mail cadastrado na sua loja. Enviaremos um link seguro para você criar uma nova senha.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input 
                type="email" required placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{color:'#000', width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
              <button type="submit" disabled={loading} style={{ background: '#000', color: '#fff', border: 'none', padding: '18px', borderRadius: '50px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {loading ? 'Enviando...' : 'Receber Link'}
              </button>
            </form>

            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '30px', color: '#64748b', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
              <ArrowLeft size={16} /> Voltar para o Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}