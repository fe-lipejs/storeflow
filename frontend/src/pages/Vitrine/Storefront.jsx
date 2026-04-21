import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Store, X, CheckCircle, ChevronLeft, ChevronRight, Trash2, Minus, Plus, Menu, User, ArrowLeft, SlidersHorizontal, PackageCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51TNwwH8dE283e6ko4eIDPHyMd4g91yvvMjUMWjaGPiTg2C0qXniTeJwyxwp0AgZu3hHZbzSr1Wc96jux6zDPyGZb00O0cgSGor');

const CheckoutForm = ({ clientSecret, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${window.location.pathname}?success=true`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', animation: 'fadeIn 0.5s' }}>
      <PaymentElement options={{ layout: "tabs" }} />
      {errorMessage && <div style={{ color: 'red', marginTop: '10px', fontSize: '13px', fontWeight: 600 }}>{errorMessage}</div>}
      <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
        <button type="button" onClick={onCancel} className="btn-outline" style={{ flex: 0.3 }} disabled={isProcessing}>
          <ArrowLeft size={18} />
        </button>
        <button type="submit" disabled={isProcessing || !stripe || !elements} className="btn-black" style={{ flex: 1, marginTop: 0 }}>
          {isProcessing ? 'Processando...' : 'Confirmar e Pagar'}
        </button>
      </div>
    </form>
  );
};

export default function Storefront() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [cart, setCart] = useState([]);

  const [activeCategory, setActiveCategory] = useState('Todas');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  // NOVO STATE: Controla a tela mágica de Sucesso do Pedido
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', shipping_method: 'correios',
    cep: '', street: '', number: '', neighborhood: '', city: '', state: ''
  });

  // Listener para saber se o cliente pagou com sucesso no Stripe
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setShowSuccessScreen(true); // Ativa a página de obrigado
      setIsCartOpen(false);
      setCart([]); // Limpa a sacola do cara
      window.history.replaceState(null, '', window.location.pathname); // Limpa a URL
    }
  }, [slug]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/${slug}`).then(res => res.json()).then(setData);
  }, [slug]);

  if (!data) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Montserrat, sans-serif' }}>Carregando vitrine...</div>;

  const { store, products } = data;
  const categoriesList = ['Todas', ...new Set(products.map(p => p.category_name || 'Geral'))];
  const filteredProducts = activeCategory === 'Todas' ? products : products.filter(p => (p.category_name || 'Geral') === activeCategory);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const productImages = selectedProduct ? (selectedProduct.images ? JSON.parse(selectedProduct.images) : (selectedProduct.image_url ? [selectedProduct.image_url] : [])) : [];

  // Função do Toast Notification aprimorada (Fecha sozinho em 4s)
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000); 
  };

  const handleAddToCart = () => {
    const hasColors = selectedProduct.variations && JSON.parse(selectedProduct.variations).colors?.length > 0;
    const hasSizes = selectedProduct.variations && JSON.parse(selectedProduct.variations).sizes?.length > 0;

    if (hasColors && !selectedColor) return showToast("Selecione uma cor!");
    if (hasSizes && !selectedSize) return showToast("Selecione um tamanho!");

    const cartKey = `${selectedProduct.id}-${selectedColor || 'u'}-${selectedSize || 'u'}`;
    const existing = cart.find(item => item.cartKey === cartKey);
    const finalPrice = selectedProduct.promotional_price || selectedProduct.price;

    if (existing) {
      setCart(cart.map(item => item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...selectedProduct, cartKey, price: parseFloat(finalPrice), quantity: 1, color: selectedColor, size: selectedSize, displayImg: productImages[0] }]);
    }

    setSelectedProduct(null);
    showToast("Adicionado à sacola!");
    setIsCartOpen(true);
  };

  const removeFromCart = (cartKey) => setCart(cart.filter(item => item.cartKey !== cartKey));

  const updateQuantity = (cartKey, amount) => {
    setCart(cart.map(item => {
      if (item.cartKey === cartKey) {
        const newQuantity = item.quantity + amount;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const handleCepChange = async (e) => {
    const newCep = e.target.value.replace(/\D/g, '');
    setForm({ ...form, cep: newCep });
    if (newCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${newCep}/json/`);
        const cepData = await response.json();
        if (!cepData.erro) setForm(prev => ({ ...prev, street: cepData.logradouro, neighborhood: cepData.bairro, city: cepData.localidade, state: cepData.uf }));
      } catch (error) { console.error("Erro ao buscar CEP"); }
    }
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setLoadingCheckout(true);

    try {
      const fullAddress = `${form.street}, ${form.number} - ${form.neighborhood}, ${form.city} - ${form.state}, CEP: ${form.cep}`;
      const orderPayload = {
        store_id: store.id,
        shipping_method: form.shipping_method,
        customer: { name: form.name, email: form.email, phone: form.phone, address: fullAddress },
        cart: cart.map(item => ({ id: item.id, quantity: item.quantity, price: item.price, product_name: item.name }))
      };

      const orderRes = await fetch('http://localhost:3000/api/checkout/order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload)
      });
      const orderData = await orderRes.json();

      if (orderData.order_id) {
        const stripeRes = await fetch('http://localhost:3000/api/checkout/create-payment-intent', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderData.order_id, total_amount: cartTotal, customer: orderPayload.customer })
        });
        const stripeData = await stripeRes.json();

        if (stripeData.clientSecret) {
          setClientSecret(stripeData.clientSecret);
          setCheckoutStep(3);
        } else {
          showToast("Erro ao conectar com o Stripe.");
        }
      }
    } catch (error) {
      showToast("Erro de conexão ao preparar pagamento.");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const selectCategoryAndCloseMenu = (cat) => {
    setActiveCategory(cat);
    setIsMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        body { margin: 0; background-color: #fff; font-family: 'Montserrat', sans-serif; color: #000; -webkit-font-smoothing: antialiased; display: flex; flex-direction: column; min-height: 100vh; }
        
        .store-header { border-bottom: 1px solid #eee; position: sticky; top: 0; background: #fff; z-index: 40; height: 70px; display: flex; align-items: center; }
        .header-content { max-width: 1200px; margin: 0 auto; width: 100%; padding: 0 20px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }
        
        .header-left { display: flex; justify-content: flex-start; }
        .header-center { display: flex; justify-content: center; align-items: center; gap: 10px; }
        .header-right { display: flex; justify-content: flex-end; align-items: center; gap: 20px; }
        
        .icon-btn { background: none; border: none; cursor: pointer; color: #000; padding: 5px; display: flex; align-items: center; justify-content: center; }
        .cart-icon-container { position: relative; cursor: pointer; padding: 5px; display: flex; align-items: center; justify-content: center; height: 34px; width: 34px; }
        .cart-badge { position: absolute; top: -2px; right: -5px; background: #000; color: #fff; font-size: 10px; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }

        .main-content { flex: 1; display: flex; flex-direction: column; }
        .store-banner-container { width: 100%; margin: 0 0 40px 0; animation: fadeIn 0.5s; }
        .store-banner { width: 100%; height: 450px; object-fit: cover; display: block; background: #f3f4f6; }
        @media (max-width: 768px) { .store-banner { height: 220px; } }    
        
        .products-header { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; width: 100%; margin: 0 auto 25px; padding: 0 20px; box-sizing: border-box; }
        .section-title { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin: 0; color: #000; }
        .filter-btn { display: flex; align-items: center; gap: 8px; background: none; border: 1px solid #e5e7eb; padding: 10px 18px; border-radius: 50px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; cursor: pointer; transition: 0.2s; color: #000; }
        .filter-btn:hover { border-color: #000; background: #f9fafb; }

        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 30px; max-width: 1200px; width: 100%; margin: 0 auto 60px; padding: 0 20px; box-sizing: border-box; }
        @media (max-width: 768px) {
          .products-grid { grid-template-columns: 1fr 1fr; gap: 15px; }
          .section-title { font-size: 16px; }
          .filter-btn { padding: 8px 14px; font-size: 10px; }
        }

        .product-card { cursor: pointer; transition: opacity 0.3s; text-align: center; }
        .product-card:hover { opacity: 0.8; }
        .img-wrapper { aspect-ratio: 4/5; background: #f9f9f9; overflow: hidden; margin-bottom: 15px; position: relative; border-radius: 8px; }
        
        .product-title { font-size: 12px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px; color: #444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 10px; }
        
        .price-container { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 2px; margin-top: 4px; }
        .price-old { text-decoration: line-through; color: #9ca3af; font-size: 11px; font-weight: 600; line-height: 1; }
        .price-current { font-weight: 800; font-size: 16px; color: #000; line-height: 1; }

        .categories-bar { display: flex; gap: 10px; max-width: 1200px; width: 100%; margin: 0 auto 40px; padding: 0 20px; overflow-x: auto; scrollbar-width: none; box-sizing: border-box; }
        .categories-bar::-webkit-scrollbar { display: none; } 
        .category-pill { background: #f9fafb; border: 1px solid #e5e7eb; padding: 10px 20px; border-radius: 50px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: 0.2s; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .category-pill:hover { border-color: #000; color: #000; }
        .category-pill.active { background: #000; color: #fff; border-color: #000; }
        
        .badge-destaque { position: absolute; top: 10px; left: 10px; background: #000; color: #fff; font-size: 10px; font-weight: bold; padding: 4px 8px; text-transform: uppercase; z-index: 10; }

        .drawer-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 200; display: flex; animation: fadeIn 0.3s; }
        .drawer-overlay.right { justify-content: flex-end; }
        .drawer-overlay.left { justify-content: flex-start; }
        
        .drawer-content { background: #fff; height: 100vh; overflow-y: auto; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 25px rgba(0,0,0,0.1); }
        .drawer-content.right-panel { width: 100%; max-width: 480px; animation: slideLeft 0.3s ease-out; }
        .drawer-content.left-menu { width: 80%; max-width: 350px; animation: slideRight 0.3s ease-out; }
        
        .close-btn { background: none; border: none; cursor: pointer; color: #000; padding: 5px; transition: 0.2s; display: flex; align-items: center; justify-content: center;}
        
        .btn-black { background: #000; color: #fff; border: none; width: 100%; padding: 18px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 14px; text-transform: uppercase; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; gap: 10px; }
        .btn-black:disabled { background: #ccc; cursor: not-allowed; }
        .btn-outline { background: transparent; color: #000; border: 2px solid #000; width: 100%; padding: 16px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13px; text-transform: uppercase; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;}
        
        .btn-link { background: none; border: 1px solid grey; width: 100%; padding: 15px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; text-transform: uppercase; cursor: pointer; color: #666; transition: 0.2s; letter-spacing: 0.5px; }
        .btn-link:hover { color: #000; }

        .menu-nav-list { display: flex; flex-direction: column; padding: 20px 0; }
        .menu-nav-link { padding: 15px 30px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #000; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: 0.2s; }
        .menu-nav-link:hover, .menu-nav-link.active { background: #f9fafb; padding-left: 40px; }
        
        .menu-footer { margin-top: auto; padding: 30px; border-top: 1px solid #f3f4f6; background: #fafafa; }
        .login-link { display: flex; align-items: center; gap: 10px; color: #000; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }

        .carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.8); border: none; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; color: #000; }
        .variation-btn { border: 2px solid #e5e7eb; padding: 10px 20px; background: #fff; font-size: 13px; font-weight: 600; cursor: pointer; color: #000;}
        .variation-btn.active { border-color: #000; }

        .input-saas { width: 100%; padding: 15px; border: 1px solid #e5e7eb; background: #f9fafb; margin-bottom: 15px; box-sizing: border-box; font-family: 'Montserrat', sans-serif; font-size: 14px; color: #000; transition: all 0.2s; }
        .input-saas:focus { border-color: #000; background: #fff; outline: none; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .qty-btn { background: #f3f4f6; border: none; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: 'Montserrat', sans-serif; color: #000; }
        
        .stepper-container { display: flex; justify-content: space-between; padding: 20px 30px; border-bottom: 1px solid #eee; background: #fff; }
        .step { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; }
        .step.active { color: #000; }

        /* Estilo do Toast Melhorado */
        .toast-notification { position: fixed; top: 85px; right: 20px; background: #000; color: white; padding: 15px 20px; font-weight: 600; font-size: 13px; text-transform: uppercase; z-index: 300; display: flex; align-items: center; justify-content: space-between; gap: 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); animation: fadeIn 0.3s; min-width: 250px; }
        .toast-close { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .toast-close:hover { color: #fff; }

        .store-footer { background-color: #000; color: #fff; padding: 50px 20px 30px; text-align: center; margin-top: auto; }
        .store-footer .footer-brand { font-weight: 800; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
        .store-footer .footer-copy { font-size: 13px; color: #9ca3af; margin-bottom: 30px; }
        .store-footer .powered-by { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px; border-top: 1px solid #333; padding-top: 20px; max-width: 300px; margin: 0 auto; }
        .store-footer .powered-by span { color: #fff; font-weight: bold; }

        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* TOAST DE AVISO (Com botão de fechar) */}
      {toastMessage && (
        <div className="toast-notification">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={18} color="#10b981" /> {toastMessage}
          </div>
          <button className="toast-close" onClick={() => setToastMessage(null)}>
            <X size={18} />
          </button>
        </div>
      )}

      <header className="store-header">
        <div className="header-content">
          <div className="header-left">
            <button className="icon-btn" onClick={() => setIsMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
          <div className="header-center">
            {store.logo_url && <img src={store.logo_url} style={{ width: 35, height: 35, borderRadius: '50%', objectFit: 'cover' }} alt="Logo" />}
            <span style={{ fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', color: '#000', letterSpacing: '2px' }}>{store.name}</span>
          </div>
          <div className="header-right">
            {/* Ícone de Usuário Alinhado */}
            <Link to={`/${store.slug}/minha-conta`} style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '34px', width: '34px' }}>
              <User size={24} />
            </Link>
            {/* Ícone de Carrinho Alinhado */}
            <div className="cart-icon-container" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={24} color="#000" />
              {cart.length > 0 && <div className="cart-badge">{cart.length}</div>}
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="drawer-overlay left" onClick={() => setIsMenuOpen(false)}>
          <div className="drawer-content left-menu" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu</span>
              <button className="close-btn" onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
            </div>
            <nav className="menu-nav-list" style={{ flex: 1, overflowY: 'auto' }}>
              <div className={`menu-nav-link ${activeCategory === 'Todas' ? 'active' : ''}`} onClick={() => selectCategoryAndCloseMenu('Todas')}>Início</div>
              {categoriesList.filter(c => c !== 'Todas').map(c => (
                <div key={c} className={`menu-nav-link ${activeCategory === c ? 'active' : ''}`} onClick={() => selectCategoryAndCloseMenu(c)}>{c}</div>
              ))}
              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                <Link to={`/${store.slug}/minha-conta`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '50px', color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
                  <User size={18} /> Minha Conta
                </Link>
              </div>
            </nav>
            <div className="menu-footer" style={{ marginTop: 'auto', padding: '20px', background: '#fafafa', borderTop: '1px solid #eee', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0' }}>Área Administrativa</p>
              <Link to="/login" state={{ fromStore: store }} className="login-link" style={{ fontSize: '12px', color: '#64748b', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                <Store size={16} style={{ marginRight: '6px' }} /> Acesso do Lojista
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* RENDERIZAÇÃO CONDICIONAL: TELA DE SUCESSO OU VITRINE       */}
      {/* ========================================================== */}
      
      {showSuccessScreen ? (
        
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f9fafb' }}>
          <div style={{ background: '#fff', padding: '50px 40px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', width: '100%', animation: 'fadeIn 0.5s' }}>
            <div style={{ width: '80px', height: '80px', background: '#dcfce3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
              <PackageCheck size={40} color="#16a34a" />
            </div>
            
            <h1 style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.5px', margin: '0 0 15px', color: '#000' }}>
              Pedido Confirmado!
            </h1>
            
            <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.6, marginBottom: '30px' }}>
              O seu pagamento foi aprovado. Nós enviamos um e-mail com a confirmação da compra, o resumo dos itens e as informações de envio.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Link to={`/${store.slug}/minha-conta`} style={{ background: '#000', color: '#fff', textDecoration: 'none', padding: '18px', borderRadius: '8px', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: '0.2s' }}>
                <PackageCheck size={20} /> Acompanhar meu Pedido
              </Link>
              
              <button onClick={() => setShowSuccessScreen(false)} style={{ background: 'transparent', border: '1px solid #d1d5db', color: '#4b5563', padding: '18px', borderRadius: '8px', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', cursor: 'pointer', transition: '0.2s' }}>
                Voltar para a Loja
              </button>
            </div>
          </div>
        </main>

      ) : (

        <main className="main-content">
          {store.banner_url && (
            <div className="store-banner-container">
              <img src={store.banner_url} alt={`Banner ${store.name}`} className="store-banner" />
            </div>
          )}

          {categoriesList.length > 0 && (
            <div className="categories-bar">
              {categoriesList.map(cat => (
                <button key={cat} className={`category-pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="products-header">
            <h2 className="section-title">{activeCategory === 'Todas' ? 'Lançamentos' : activeCategory}</h2>
            <button className="filter-btn" onClick={() => alert("Menu de Filtros em breve!")}><SlidersHorizontal size={14} /> Filtrar</button>
          </div>

          <div className="products-grid">
            {filteredProducts.map(p => {
              const firstImg = p.images ? JSON.parse(p.images)[0] : p.image_url;
              return (
                <div key={p.id} className="product-card" onClick={() => { setSelectedProduct(p); setCurrentImageIndex(0); setSelectedColor(null); setSelectedSize(null); }}>
                  <div className="img-wrapper">
                    {p.is_featured === 1 && <span className="badge-destaque">Destaque</span>}
                    {firstImg ? <img src={firstImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#eee' }} />}
                  </div>
                  <div>
                    <h3 className="product-title">{p.name}</h3>
                    <div className="price-container">
                      {p.promotional_price && <span className="price-old">R$ {parseFloat(p.price).toFixed(2)}</span>}
                      <span className="price-current">R$ {parseFloat(p.promotional_price || p.price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      )}

      <footer className="store-footer">
        <div className="footer-brand">{store.name}</div>
        <div className="footer-copy">© 2026 Todos os direitos reservados.</div>
        <div className="powered-by">Tecnologia por <span>Raffros Tecnologia</span></div>
      </footer>

      {/* MODAL DE PRODUTO */}
      {selectedProduct && (
        <div className="drawer-overlay right" onClick={() => setSelectedProduct(null)}>
          <div className="drawer-content right-panel" onClick={e => e.stopPropagation()}>
            <div style={{ position: 'absolute', top: 15, right: 15, zIndex: 20 }}>
              <button className="close-btn" style={{ background: '#fff', borderRadius: '50%', padding: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} onClick={() => setSelectedProduct(null)}><X size={24} color="#000" /></button>
            </div>
            <div style={{ position: 'relative', width: '100%', background: '#f5f5f5', aspectRatio: '3/4' }}>
              {productImages.length > 0 ? (
                <>
                  <img src={productImages[currentImageIndex]} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {productImages.length > 1 && (
                    <>
                      <button className="carousel-btn" style={{ left: 10 }} onClick={() => setCurrentImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1)}><ChevronLeft size={20} /></button>
                      <button className="carousel-btn" style={{ right: 10 }} onClick={() => setCurrentImageIndex(prev => (prev + 1) % productImages.length)}><ChevronRight size={20} /></button>
                    </>
                  )}
                </>
              ) : <div style={{ width: '100%', height: '100%' }} />}
            </div>
            <div style={{ padding: '30px' }}>
              <h2 style={{ textTransform: 'uppercase', fontSize: '20px', fontWeight: 800, margin: '0 0 10px', color: '#000' }}>{selectedProduct.name}</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontWeight: 700, fontSize: '20px', color: '#000' }}>R$ {selectedProduct.promotional_price || selectedProduct.price}</span>
                {selectedProduct.promotional_price && <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>R$ {selectedProduct.price}</span>}
              </div>
              <p style={{ color: '#444', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>{selectedProduct.description}</p>
              
              {JSON.parse(selectedProduct.variations || '{}').colors?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '11px', marginBottom: '10px', textTransform: 'uppercase' }}>Cor</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {JSON.parse(selectedProduct.variations).colors.map(c => <button key={c} className={`variation-btn ${selectedColor === c ? 'active' : ''}`} onClick={() => setSelectedColor(c)}>{c}</button>)}
                  </div>
                </div>
              )}
              {JSON.parse(selectedProduct.variations || '{}').sizes?.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '11px', marginBottom: '10px', textTransform: 'uppercase' }}>Tamanho</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {JSON.parse(selectedProduct.variations).sizes.map(s => <button key={s} className={`variation-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>)}
                  </div>
                </div>
              )}
              <button className="btn-black" onClick={handleAddToCart}>Adicionar à Sacola</button>
            </div>
          </div>
        </div>
      )}

      {/* CARRINHO DE COMPRAS E CHECKOUT */}
      {isCartOpen && (
        <div className="drawer-overlay right" onClick={() => setIsCartOpen(false)}>
          <div className="drawer-content right-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid #eee' }}>
              <h2 style={{ color: 'grey', margin: 0, fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{checkoutStep === 1 ? 'Sua Sacola' : 'Checkout'}</h2>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}><X size={24} /></button>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: '80px 30px', textAlign: 'center' }}>
                <p style={{ fontWeight: 600, color: '#000' }}>SUA SACOLA ESTÁ VAZIA.</p>
                <button className="btn-link" onClick={() => setIsCartOpen(false)} style={{ marginTop: '20px' }}>Voltar para a Loja</button>
              </div>
            ) : (
              <>
                <div className="stepper-container">
                  <div className={`step ${checkoutStep >= 1 ? 'active' : ''}`}>1. Sacola</div>
                  <div className={`step ${checkoutStep >= 2 ? 'active' : ''}`}>2. Entrega</div>
                  <div className={`step ${checkoutStep >= 3 ? 'active' : ''}`}>3. Pagar</div>
                </div>

                <div style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>

                  {checkoutStep === 1 && (
                    <div>
                      {cart.map(item => (
                        <div key={item.cartKey} style={{ display: 'flex', gap: '15px', padding: '20px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                          {item.displayImg ? <img src={item.displayImg} style={{ width: 70, height: 90, objectFit: 'cover' }} /> : <div style={{ width: 70, height: 90, background: '#eee' }} />}
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 5px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>{item.name}</h4>
                            <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>{item.color} {item.size && `/ ${item.size}`}</span>
                            <div style={{ fontWeight: '700', marginTop: '5px', fontSize: '14px' }}>R$ {item.price.toFixed(2)}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                            <button onClick={() => removeFromCart(item.cartKey)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><Trash2 size={18} /></button>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb' }}>
                              <button className="qty-btn" onClick={() => updateQuantity(item.cartKey, -1)}><Minus size={14} /></button>
                              <span style={{ padding: '0 12px', fontSize: '13px', fontWeight: '700' }}>{item.quantity}</span>
                              <button className="qty-btn" onClick={() => updateQuantity(item.cartKey, 1)}><Plus size={14} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', marginTop: '20px', paddingTop: '20px' }}>
                        <span>TOTAL</span><span>R$ {cartTotal.toFixed(2)}</span>
                      </div>
                      <div style={{ marginTop: '30px' }}>
                        <button className="btn-black" onClick={() => setCheckoutStep(2)}>Finalizar Compra</button>
                        <br />
                        <button className="btn-link" onClick={() => setIsCartOpen(false)}>Continuar Comprando</button>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 2 && (
                    <form onSubmit={handleProceedToPayment}>
                      <h3 style={{ margin: '0 0 15px', fontSize: '13px', textTransform: 'uppercase', color: '#000' }}>Contato</h3>
                      <input type="text" required placeholder="Nome Completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-saas" />
                      <div className="form-row">
                        <input type="email" required placeholder="E-mail" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-saas" />
                        <input type="tel" required placeholder="WhatsApp" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-saas" />
                      </div>

                      <h3 style={{ margin: '20px 0 15px', fontSize: '13px', textTransform: 'uppercase', color: '#000' }}>Endereço</h3>
                      <div className="form-row">
                        <input type="text" required placeholder="CEP" maxLength="8" value={form.cep} onChange={handleCepChange} className="input-saas" />
                        <select value={form.shipping_method} onChange={e => setForm({ ...form, shipping_method: e.target.value })} className="input-saas">
                          <option value="correios">Correios</option>
                          <option value="motoboy">Motoboy</option>
                          <option value="retirada">Retirar na Loja</option>
                        </select>
                      </div>
                      <input type="text" required placeholder="Rua / Avenida" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="input-saas" />
                      <div className="form-row">
                        <input type="text" required placeholder="Número" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} className="input-saas" />
                        <input type="text" required placeholder="Bairro" value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} className="input-saas" />
                      </div>
                      <div className="form-row">
                        <input type="text" required placeholder="Cidade" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-saas" />
                        <input type="text" required placeholder="UF" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="input-saas" maxLength="2" />
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => setCheckoutStep(1)} className="btn-outline" style={{ flex: 0.3 }}><ArrowLeft size={20} /></button>
                        <button type="submit" disabled={loadingCheckout} className="btn-black" style={{ flex: 1, marginTop: 0 }}>
                          {loadingCheckout ? 'Processando...' : 'Ir para Pagamento'}
                        </button>
                      </div>
                    </form>
                  )}

                  {checkoutStep === 3 && clientSecret && (
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                      <h3 style={{ margin: '0 0 15px', fontSize: '13px', textTransform: 'uppercase', color: '#000' }}>Pagamento Seguro</h3>
                      
                      <div style={{ background: '#f9fafb', padding: '15px', marginBottom: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                        <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                          Total a Pagar: <span style={{ fontSize: '18px' }}>R$ {cartTotal.toFixed(2)}</span>
                        </p>
                      </div>

                      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                        <CheckoutForm clientSecret={clientSecret} onCancel={() => { setCheckoutStep(2); setClientSecret(null); }} />
                      </Elements>
                    </div>
                  )}

                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}