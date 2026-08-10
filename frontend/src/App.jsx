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
import './styles/global.css';

export default function App() {
  return (
    <Router>
      <SessionTimeout />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/payment/checkout" element={<PaymentCheckout />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}