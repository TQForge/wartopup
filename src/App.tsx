import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyAccount from './pages/MyAccount';
import MyCodes from './pages/MyCodes';
import AdminPanel from './pages/AdminPanel';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import AddMoney from './pages/AddMoney';
import MyOrders from './pages/MyOrders';
import ContactUs from './pages/ContactUs';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthReady } = useAuth();
  if (!isAuthReady || loading) return <div className="p-8 text-center text-primary-500 font-medium">Loading session...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading, isAuthReady } = useAuth();
  if (!isAuthReady || loading) return <div className="p-8 text-center text-primary-500 font-medium">Loading session...</div>;
  if (!profile || profile.role !== 'admin') return <Navigate to="/" />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/topup" element={<Home />} /> {/* Placeholder */}
        <Route path="/topup/:id/:subId" element={<ProductDetails />} />
        
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <MyAccount />
          </ProtectedRoute>
        } />
        <Route path="/add-money" element={
          <ProtectedRoute>
            <AddMoney />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        } />
        <Route path="/codes" element={
          <ProtectedRoute>
            <MyCodes />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="/checkout" element={<Checkout />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
      </AlertProvider>
    </AuthProvider>
  );
}
