import { useState } from 'react';
import { LayoutDashboard, Package, Palette, Settings, LogOut, Menu, X, Tags, Crown, ShoppingBag } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const storeData = JSON.parse(localStorage.getItem('@SaaS:store') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('@SaaS:token');
    localStorage.removeItem('@SaaS:store');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        /* IMPORTANDO A FONTE DA VITRINE */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

        /* RESET E FUNDO CLEAN */
        body { margin: 0; background-color: #fafafa; }
        
        .admin-layout { 
          display: flex; 
          min-height: 100vh; 
          font-family: 'Montserrat', sans-serif; 
          color: #000; 
          -webkit-font-smoothing: antialiased; 
        }
        
        /* O "RESPIRO" PRINCIPAL ESTÁ AQUI */
        .admin-main { 
          flex: 1; 
          padding: 20px; 
          margin-top: 60px; /* Espaço para o header mobile */
          width: 100%; 
          box-sizing: border-box; 
        }
        
        /* CONTENT WRAPPER PARA NÃO ESTICAR INFINITO */
        .admin-content-wrapper {
          max-width: 1000px;
          margin: 0 auto; /* Centraliza o conteúdo na área principal */
        }
        
        /* HEADER MOBILE */
        .mobile-header { display: flex; justify-content: space-between; align-items: center; background-color: #fff; border-bottom: 1px solid #eee; padding: 15px 20px; position: fixed; top: 0; left: 0; width: 100%; z-index: 40; box-sizing: border-box; }
        
        /* SIDEBAR FIXA E CLEAN */
        .admin-sidebar { width: 260px; background-color: #fff; border-right: 1px solid #eee; display: flex; flex-direction: column; padding: 30px 20px; position: fixed; height: 100vh; top: 0; left: 0; z-index: 50; transition: transform 0.3s ease; box-sizing: border-box; }
        .admin-sidebar.closed { transform: translateX(-100%); }
        
        .admin-nav { display: flex; flex-direction: column; gap: 5px; flex: 1; margin-top: 40px; }
        
        .admin-link { color: #666; text-decoration: none; display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s; padding: 14px 18px; border-radius: 8px; }
        .admin-link:hover { background-color: #f9f9f9; color: #000; }
        .admin-link.active { background-color: #000; color: #fff; }
        
        .sidebar-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 45; animation: fadeIn 0.3s; }

        /* CARDS COM BASTANTE ESPAÇO INTERNO E BORDA SUTIL */
        .admin-card { background: #fff; padding: 40px; border-radius: 12px; border: 1px solid #eee; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 30px; width: 100%; box-sizing: border-box; }
        .admin-form-row { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 20px; }
        
        /* TÍTULOS E LABELS */
        h1, h2, h3 { color: #000; font-weight: 800; letter-spacing: -0.5px; margin-top: 0; }
        label { color: #000; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 10px; }

        /* INPUTS IGUAIS AOS DA VITRINE */
        .admin-input { width: 100%; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 500; color: #000; box-sizing: border-box; transition: all 0.2s; outline: none; }
        .admin-input:focus { border-color: #000; background-color: #fff; }
        .admin-input::placeholder { color: #9ca3af; }
        
        /* BOTÃO PRETO ABSOLUTO */
        .admin-btn { background: #000; color: #fff; border: none; padding: 16px 24px; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.2s; }
        .admin-btn:hover { background: #333; }
        .admin-btn:disabled { background: #ccc; cursor: not-allowed; }

        /* TABELAS ULTRA CLEAN */
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { padding: 15px 20px; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 1px solid #eee; }
        td { padding: 20px; border-bottom: 1px solid #f9f9f9; font-size: 14px; font-weight: 500; color: #000; }
        tr:hover td { background-color: #fafafa; }
        tr:last-child td { border-bottom: none; }

        /* A MÁGICA DO DESKTOP (AQUI ESTAVA O ERRO DE LAYOUT) */
        @media (min-width: 768px) {
          .mobile-header { display: none; }
          .admin-sidebar { position: fixed; transform: none !important; }
          .sidebar-overlay { display: none; }
          
          /* EMPURRA O CONTEÚDO PARA O LADO DO MENU E DÁ ESPAÇO */
          .admin-main { margin-left: 260px; padding: 50px 40px; margin-top: 0; }
          .admin-form-row { grid-template-columns: 1fr 1fr; gap: 30px; }
        }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="mobile-header">
        <button onClick={() => setIsOpen(true)} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', display: 'flex' }}>
          <Menu size={28} />
        </button>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Painel</h2>
        
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}

      <aside className={`admin-sidebar ${!isOpen ? 'closed' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#000' }}>Admin</h2>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{storeData.name}</span>
          </div>
          <button className="md:hidden" onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer' }}>
             <X size={24} style={{ display: window.innerWidth < 768 ? 'block' : 'none' }} />
          </button>
        </div>

        <nav className="admin-nav">
          <Link to="/admin" className={`admin-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            <LayoutDashboard size={18} /> Visão Geral
          </Link>
          <Link to="/admin/pedidos" className={`admin-link ${isActive('/admin/pedidos') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            <ShoppingBag size={18} /> Pedidos
          </Link>
          <Link to="/admin/produtos" className={`admin-link ${isActive('/admin/produtos') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            <Package size={18} /> Produtos
          </Link>
          <Link to="/admin/categorias" className={`admin-link ${isActive('/admin/categorias') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            <Tags size={18} /> Categorias
          </Link>
          <Link to="/admin/aparencia" className={`admin-link ${isActive('/admin/aparencia') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            <Palette size={18} /> Aparência
          </Link>
          <Link to="/admin/configuracoes" className={`admin-link ${isActive('/admin/configuracoes') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            <Settings size={18} /> Configurações
          </Link>

          {storeData.role === 'admin' && (
            <Link to="/admin/master" className="admin-link" onClick={() => setIsOpen(false)} style={{ color: '#000', backgroundColor: '#Fef3c7', marginTop: '20px' }}>
              <Crown size={18} color="#d97706" /> Painel Mestre
            </Link>
          )}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', width: '100%', padding: '10px', transition: '0.2s' }}>
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>
    </>
  );
}