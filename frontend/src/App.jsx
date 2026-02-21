import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Vehicles from './pages/Vehicles.jsx';
import Drivers from './pages/Drivers.jsx';
import Trips from './pages/Trips.jsx';
import Maintenance from './pages/Maintenance.jsx';
import Expenses from './pages/Expenses.jsx';
import Performance from './pages/Performance.jsx';
import Analytics from './pages/Analytics.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ page, children }) {
  const { can } = useAuth();
  if (!can.access[page]) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#f87171' }}>403</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>Access Denied — your role cannot view this page.</p>
      </div>
    );
  }
  return children;
}

import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="layout-wrapper">
        <Navbar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { token } = useAuth();

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid #313244' } }} />
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<ProtectedRoute><Layout><RoleRoute page="dashboard"><Dashboard /></RoleRoute></Layout></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><Layout><RoleRoute page="vehicles"><Vehicles /></RoleRoute></Layout></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><Layout><RoleRoute page="drivers"><Drivers /></RoleRoute></Layout></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><Layout><RoleRoute page="trips"><Trips /></RoleRoute></Layout></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><Layout><RoleRoute page="maintenance"><Maintenance /></RoleRoute></Layout></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Layout><RoleRoute page="expenses"><Expenses /></RoleRoute></Layout></ProtectedRoute>} />
        <Route path="/performance" element={<ProtectedRoute><Layout><RoleRoute page="performance"><Performance /></RoleRoute></Layout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Layout><RoleRoute page="analytics"><Analytics /></RoleRoute></Layout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
