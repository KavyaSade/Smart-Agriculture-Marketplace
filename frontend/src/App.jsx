import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import FarmerDashboard from './pages/FarmerDashboard/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard/BuyerDashboard';
import RetailerDashboard from './pages/RetailerDashboard/RetailerDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import PaymentCheckout from './pages/payment/paymentcheckout';
import PaymentSuccess from './pages/payment/paymentsuccess';
import PaymentFailure from './pages/payment/paymentfailure';
import SessionTimeout from './components/SessionTimeout/SessionTimeout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import './styles/global.css';

export default function App() {
  return (
    <Router>
      <SessionTimeout />
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Public-only routes (redirects to dashboard if already logged in) */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />

        {/* Protected Dashboard routes */}
        <Route path="/farmer-dashboard" element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/buyer-dashboard" element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/retailer-dashboard" element={
          <ProtectedRoute allowedRoles={['retailer']}>
            <RetailerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Protected payment checkout routes */}
        <Route path="/payment/checkout" element={
          <ProtectedRoute allowedRoles={['buyer', 'retailer']}>
            <PaymentCheckout />
          </ProtectedRoute>
        } />
        <Route path="/payment/success" element={
          <ProtectedRoute allowedRoles={['buyer', 'retailer']}>
            <PaymentSuccess />
          </ProtectedRoute>
        } />
        <Route path="/payment/failure" element={
          <ProtectedRoute allowedRoles={['buyer', 'retailer']}>
            <PaymentFailure />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}