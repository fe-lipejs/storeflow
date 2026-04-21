import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, CheckCircle2, MessageCircle, TrendingUp, Smartphone, Package, XOctagon } from 'lucide-react';

export default function LandingPage() {
  
  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal');
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        if (elementTop < windowHeight - 50) {
          reveals[i].classList.add('active');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        
        body, html { 
          margin: 0; padding: 0; 
          background-color: #fff; 
          font-family: 'Montserrat', sans-serif; 
          color: #000; 
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased; 
        }

        /* HEADER CLEAN */
        .landing-header {
          position: fixed; top: 0; left: 0; width: 100%;
          padding: 20px 0; z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #eee;
        }
        .header-container {
          max-width: 1200px; margin: 0 auto; padding: 0 20px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .brand-logo {
          font-size: 18px; font-weight: 900; color: #000; text-decoration: none;
          letter-spacing: 1px; text-transform: uppercase; display: flex; align-items: center; gap: 8px;
        }
        .nav-links { display: flex; gap: 30px; align-items: center; }
        .login-link { color: #666; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s; }
        .login-link:hover { color: #000; }
        
        /* HEADER BOTAO */
        .cta-header {
          background: #000; color: #fff; padding: 12px 24px; border-radius: 4px;
          font-size: 12px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s;
        }
        .cta-header:hover { background: #333; }

        /* HERO SECTION */
        .hero-section {
          min-height: 90vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 140px 20px 60px; text-align: center; max-width: 900px; margin: 0 auto;
        }
        
        .hero-title {
          font-size: 64px; font-weight: 900; letter-spacing: -2px; line-height: 1.1; margin: 0 0 20px; color: #000; text-transform: uppercase;
        }
        .hero-subtitle {
          font-size: 20px; color: #666; line-height: 1.5; font-weight: 500;
          max-width: 700px; margin: 0 auto 40px;
        }

        /* O BOTAO COM BORDAS ARREDONDADAS (PÍLULA) */
        .cta-primary {
          display: inline-flex; align-items: center; gap: 10px; background: #000; color: #fff;
          padding: 20px 45px; text-decoration: none; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
          font-size: 15px; border-radius: 50px; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .cta-primary:hover { background: #333; transform: translateY(-2px); box-shadow: 0 15px 25px rgba(0,0,0,0.15); }

        .hero-image-container {
          margin-top: 60px; width: 100%; max-width: 1000px; padding: 0 20px; box-sizing: border-box;
        }
        .hero-image {
          width: 100%; border-radius: 12px; box-shadow: 0 25px 50px rgba(0,0,0,0.1); border: 1px solid #eaeaea; display: block;
        }

        /* A NOVA SEÇÃO DE COMPARAÇÃO (DESIGN MODERNO) */
        .comparison-section { padding: 120px 20px; background: #fff; }
        .comparison-wrapper { 
          max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; 
          background: #f8fafc; border-radius: 24px; border: 1px solid #eee; position: relative;
        }
        
        .comp-card { padding: 60px 40px; }
        
        /* O Lado Amador: Fundo cinza, letras apagadas */
        .comp-amador { color: #64748b; }
        .comp-amador h2 { color: #94a3b8; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 30px; display: flex; align-items: center; gap: 10px; }
        
        /* O Lado Profissional: Preto Absoluto, Sobreposto, Maior */
        .comp-pro { 
          background: #000; color: #fff; border-radius: 24px; 
          transform: scale(1.05); box-shadow: -15px 0 40px rgba(0,0,0,0.15);
          z-index: 10; transition: 0.3s;
        }
        .comp-pro h2 { color: #fff; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 30px; display: flex; align-items: center; gap: 10px; }
        
        .comp-list { list-style: none; padding: 0; margin: 0; }
        .comp-list li { display: flex; gap: 15px; margin-bottom: 25px; font-size: 15px; line-height: 1.6; }
        .comp-list li strong { display: block; margin-bottom: 4px; font-size: 16px; }
        .comp-amador .comp-list li strong { color: #334155; }
        .comp-pro .comp-list li strong { color: #fff; }

        /* FEATURES EM CARDS MODERNOS COM ÍCONES */
        .features-section { padding: 120px 20px; background: #fcfcfc; }
        .features-container { max-width: 1200px; margin: 0 auto; }
        .section-title { font-size: 40px; font-weight: 900; text-align: center; text-transform: uppercase; letter-spacing: -1px; margin: 0 0 60px; color: #000; }
        
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        
        .feature-card { 
          background: #fff; padding: 50px 40px; border-radius: 16px; 
          border: 1px solid #eee; box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: 0.3s; text-align: left;
        }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08); }
        
        .feature-icon { width: 56px; height: 56px; background: #000; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; color: #fff; }
        .feature-title { font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 0 0 15px; color: #000; }
        .feature-desc { color: #666; font-size: 15px; line-height: 1.6; margin: 0; font-weight: 500; }

        /* PRECIFICAÇÃO (INTACTA) */
        .pricing-section { padding: 120px 20px; background: #000; color: #fff; text-align: center; }
        .pricing-card { max-width: 500px; margin: 0 auto; background: #111; border: 1px solid #333; padding: 60px 50px; border-radius: 16px; }
        .price { font-size: 72px; font-weight: 900; letter-spacing: -3px; margin: 20px 0; }
        .price span { font-size: 16px; color: #999; font-weight: 600; letter-spacing: 0; text-transform: uppercase; }
        
        .btn-white { background: #fff; color: #000; padding: 20px; width: 100%; display: block; box-sizing: border-box; text-decoration: none; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-size: 15px; margin-bottom: 30px; transition: 0.2s; border-radius: 4px; }
        .btn-white:hover { background: #eee; }

        /* RODAPÉ BLACK CORRIGIDO */
        .footer { background: #000; text-align: center; padding: 60px 20px; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-top: 1px solid #222; }
        .footer span { color: #fff; font-weight: 800; }

        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease; }
        .reveal.active { opacity: 1; transform: translateY(0); }

        @media (max-width: 768px) {
          .hero-title { font-size: 42px; }
          .comparison-wrapper { grid-template-columns: 1fr; border-radius: 16px; }
          .comp-pro { transform: scale(1); border-radius: 0 0 16px 16px; }
          .nav-links { display: none; }
        }
      `}</style>

      {/* HEADER */}
      <header className="landing-header">
        <div className="header-container">
          <Link to="/" className="brand-logo">
            <ShoppingBag size={20} /> MEUSAAS
          </Link>
          <div className="nav-links">
            <Link to="/login" className="login-link">Login da Loja</Link>
            <Link to="/register" className="cta-header">Criar Conta</Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section reveal active">
        <h1 className="hero-title">PARE DE PERDER VENDAS NO WHATSAPP.</h1>
        <p className="hero-subtitle">
          Profissionalize seu negócio no Instagram. Dê aos seus clientes uma vitrine elegante, cálculo de frete na hora e checkout automático. Você dorme, sua loja vende.
        </p>
        <Link to="/register" className="cta-primary">
          Criar Minha Loja <ArrowRight size={20} />
        </Link>
        
        <div className="hero-image-container">
          <img src="https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=1200&auto=format&fit=crop" alt="Vitrine Profissional" className="hero-image" />
        </div>
      </section>

      {/* COMPARAÇÃO MODERNA E TRANSIÇÃO ELEGANTE */}
      <section className="comparison-section reveal">
        <div className="comparison-wrapper">
          
          <div className="comp-card comp-amador">
            <h2><MessageCircle size={22} /> O Jeito Amador</h2>
            <ul className="comp-list">
              <li>
                <XOctagon size={24} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div><strong>Atendimento exaustivo</strong> Responder "qual o valor?" e "tem no tamanho M?" dezenas de vezes por dia.</div>
              </li>
              <li>
                <XOctagon size={24} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div><strong>Cálculo de frete manual</strong> Ter que abrir o site dos Correios para simular o frete de cada cliente interessado.</div>
              </li>
              <li>
                <XOctagon size={24} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div><strong>Vendas perdidas de madrugada</strong> O cliente quer comprar às 23h. Quando você responde de manhã, ele já desistiu.</div>
              </li>
            </ul>
          </div>

          <div className="comp-card comp-pro">
            <h2><ShoppingBag size={24} /> O Padrão MeuSaaS</h2>
            <ul className="comp-list">
              <li>
                <CheckCircle2 size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div><strong>Vitrine Automática</strong> Seu cliente clica no link da bio, escolhe a cor, o tamanho e vê o preço na hora.</div>
              </li>
              <li>
                <CheckCircle2 size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div><strong>Frete Integrado</strong> O sistema pede o CEP e já dá o valor do PAC ou Sedex imediatamente no checkout.</div>
              </li>
              <li>
                <CheckCircle2 size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div><strong>Vendas 24h por dia</strong> O cliente paga pelo celular de madrugada e o pedido cai pronto no seu painel.</div>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* CARDS MODERNOS COM ÍCONES E TÍTULO LEGÍVEL */}
      <section className="features-section reveal">
        <div className="features-container">
          <h2 className="section-title">A Estrutura das Grandes Marcas.</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Smartphone size={24} /></div>
              <h3 className="feature-title">Design Premium</h3>
              <p className="feature-desc">Esqueça catálogos feios. Sua loja terá o mesmo padrão visual e a fluidez das maiores marcas D2C do mercado.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><TrendingUp size={24} /></div>
              <h3 className="feature-title">Checkout Sem Fricção</h3>
              <p className="feature-desc">Não perca o cliente na hora de pagar. Um fluxo limpo, direto para a conversão sem sair da sua vitrine.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon"><Package size={24} /></div>
              <h3 className="feature-title">Painel de Pedidos</h3>
              <p className="feature-desc">Uma central exclusiva para você administrar suas vendas, mudar status de envio e gerenciar seu faturamento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRECIFICAÇÃO (INTACTA) */}
      <section className="pricing-section reveal">
        <h2 style={{ fontSize: '40px', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 50px' }}>Simples. Sem taxas ocultas.</h2>
        <div className="pricing-card">
          <h3 style={{ fontSize: '20px', textTransform: 'uppercase', margin: '0 0 10px', color: '#999' }}>Acesso Completo</h3>
          <div className="price">R$49<span> / mês</span></div>
          <p style={{ color: '#888', fontSize: '15px', marginBottom: '40px', lineHeight: 1.6, fontWeight: 500 }}>Cancele quando quiser. Nenhuma porcentagem cobrada em cima das suas vendas.</p>
          
          <Link to="/register" className="btn-white">
            Criar Minha Loja Agora
          </Link>
          <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
            Liberação imediata
          </div>
        </div>
      </section>

      {/* FOOTER BLACK */}
      <footer className="footer">
        <div style={{ marginBottom: '10px' }}>© 2026 MEUSAAS. Todos os direitos reservados.</div>
        <div>Tecnologia por <span>Raffros Tecnologia</span></div>
      </footer>
    </>
  );
}