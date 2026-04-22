import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import Configuracoes from './pages/Admin/Configuracoes';
import Appearance from './pages/Admin/Appearance';
import Products from './pages/Admin/Products';
import Orders from './pages/Admin/Orders';
import Categories from './pages/Admin/Categories';
import MasterDashboard from './pages/Admin/MasterDashboard';
import Storefront from './pages/Vitrine/Storefront';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Auth/Register';
import LandingPage from './pages/LandingPage';
// Adicione lá em cima com os imports:
import CustomerLogin from './pages/Vitrine/CustomerLogin';
import CustomerDashboard from './pages/Vitrine/CustomerDashboard';

// ... (desça até o <Routes>) ...

// Rota de acesso do cliente
<Route path="/:slug/minha-conta" element={<CustomerLogin />} />

// O futuro painel do cliente (pode deixar comentado por enquanto se o arquivo não existir)
// <Route path="/:slug/painel" element={<CustomerDashboard />} />

// ==========================================
// 🛡️ O GUARDA-COSTAS DO FRONTEND (PrivateRoute)
// ==========================================
// Esse componente verifica se a pessoa tem o token. Se não tiver, manda pro Login.
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('@SaaS:token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* Rotas Públicas (Qualquer um acessa) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/esqueci-senha" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/:slug/minha-conta" element={<CustomerLogin />} />
        <Route path="/:slug/painel" element={<CustomerDashboard />} />

        {/* Rota Raiz redireciona para login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ========================================== */}
        {/* 🔒 ROTAS PRIVADAS (Só passa com crachá) */}
        {/* ========================================== */}
        <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin/categorias" element={<PrivateRoute><Categories /></PrivateRoute>} />
        <Route path="/admin/aparencia" element={<PrivateRoute><Appearance /></PrivateRoute>} />
        <Route path="/admin/produtos" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/admin/pedidos" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/admin/master" element={<PrivateRoute><MasterDashboard /></PrivateRoute>} />
        <Route path="/admin/configuracoes" element={<PrivateRoute><Configuracoes /></PrivateRoute>} />

        {/* Rota Dinâmica da Vitrine (Cliente Final) - Fica por último! */}
        <Route path="/:slug" element={<Storefront />} />
      </Routes>
    </Router>
  );
}

export default App;