import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Pega o token gigante da URL
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      
      const data = await response.json();

      if (response.ok) {
        alert("Senha alterada com sucesso! Faça login.");
        navigate('/login');
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Montserrat' }}>Link inválido. O Token está faltando.</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Montserrat, sans-serif', background: '#f9fafb', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', padding: '50px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        
        <Lock size={48} color="#000" style={{ marginBottom: '20px' }} />
        <h1 style={{ margin: '0 0 10px', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>Nova Senha</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>Crie uma nova senha segura para sua loja.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input 
            type="password" required placeholder="Nova Senha (mínimo 6 caracteres)" minLength="6" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
          />
          <button type="submit" disabled={loading} style={{ background: '#000', color: '#fff', border: 'none', padding: '18px', borderRadius: '50px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}>
            {loading ? 'Salvando...' : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}