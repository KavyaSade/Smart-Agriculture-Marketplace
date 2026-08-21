import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants } from '../../utils/animations';import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import { useLocation } from 'react-router-dom';
import './RetailerDashboard.css';
import logoBanner from '../../assets/logo-banner.png';

// Import subfolder components
import Overview from './Overview/Overview';
import Products from './Products/Products';
import Orders from './Orders/Orders';
import Sales from './Sales/Sales';
import Revenue from './Revenue/Revenue';
import Profile from './Profile/Profile';
import Settings from './Settings/Settings';

export default function RetailerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // state for mobile menu toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // state for current active tab
  const [activeTab, setActiveTab] = useState('overview');

  // Sync tab with navigation state/query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') || location.state?.activeTab;
    setActiveTab(tabParam || 'overview');
  }, [location]);

  const handleTabChange = (tabName) => {
    navigate(`?tab=${tabName}`);
    setSidebarOpen(false);
  };

  // state for alert messages
  const [alert, setAlert] = useState(null);

  // hide alert banner after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // default products list (fetched from backend)
  const [products, setProducts] = useState([]);

  // state for active editing and deleting product
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // default list of orders (fetched from backend)
  const [orders, setOrders] = useState([]);

  // state for financial balance and payouts
  const [revenueBalance, setRevenueBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;
    try {
      const response = await fetch('http://localhost:5000/api/products/my-inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map(p => ({
          ...p,
          id: p._id
        }));
        setProducts(mapped);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map(o => {
          // parse the date safely to avoid crashes
          let parseddate = o.date;
          try {
            const d = new Date(o.date);
            if (!isNaN(d.getTime())) {
              parseddate = d.toISOString().split('T')[0];
            }
          } catch (err) {
            // fallback to original date if parsing fails
          }
          return {
            ...o,
            id: o._id,
            total: o.amount,
            date: parseddate
          };
        });
        setOrders(mapped);

        // calculate revenue and transactions dynamically
        const calculatedRevenue = mapped
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + Number(o.total || 0), 0);
        setRevenueBalance(calculatedRevenue);

        const calculatedTransactions = mapped.map(o => ({
          id: `TXN-${o.id.substring(o.id.length - 6).toUpperCase()}`,
          type: 'order_sale',
          desc: `Sale payout for order ${o.id.substring(o.id.length - 6).toUpperCase()}`,
          amount: o.total,
          date: o.date,
          status: o.status === 'delivered' ? 'completed' : 'pending'
        }));
        setTransactions(calculatedTransactions);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchOrders();

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchProducts();
          fetchOrders();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user]);

  // state for user profile
  const [profile, setProfile] = useState({
    fullName: user?.fullName || 'Kavya',
    farmName: 'Kavya Organic Farms',
    email: user?.email || 'kavya@gmail.com',
    phone: user?.phone || '987654321',
    location: 'Guntur, Andhra Pradesh, India',
    bio: 'Organic farmer growing vegetables and grains in Andhra Pradesh since 2012.'
  });

  // state for user profile picture
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        isTwoFactorEnabled: user.isTwoFactorEnabled || false
      }));
    }
  }, [user]);

  // state for store settings
  const [settings, setSettings] = useState({
    shopOpen: true,
    emailNotifications: true,
    smsNotifications: false,
    orderAlerts: true,
    currency: 'INR',
    deliveryFee: 150.00
  });

  // select product to edit
  const openEditProductView = (product) => {
    setEditingProduct(product);
    navigate('?tab=edit-product');
  };

  // helper calculations for total stats
  const totalSalesCount = orders.filter(o => o.status === 'delivered').length;
  const activeOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'shipped').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="dashboard-container">
      {/* overlay backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div className="sidebar-backdrop-mobile" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* sidebar navigation panel */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'mobile-visible' : ''}`}>
        <div className="sidebar-brand" onClick={() => handleTabChange('overview')} style={{ cursor: 'pointer' }}>
          <img src={logoBanner} alt="AgriMarket Logo" className="sidebar-logo-img" />
        </div>

        {/* user avatar and info */}
        <div className="sidebar-user-card">
          {profilePhoto ? (
            <img src={profilePhoto} alt="User Avatar" className="w-12 h-12 object-cover rounded-full border border-slate-200" />
          ) : (
            <div className="sidebar-avatar">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="sidebar-user-info">
            <span className="sidebar-user-name" title={profile.fullName}>{profile.fullName}</span>
            <span className="sidebar-user-role">Retailer Dashboard</span>
          </div>
        </div>

        {/* links to dashboard tabs */}
        <ul className="sidebar-menu">
          <li>
            <button
              onClick={() => handleTabChange('overview')}
              className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/graph.png" alt="" className="sidebar-link-img" />
              <span>Overview</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange('products')}
              className={`sidebar-link ${['products', 'add-product', 'edit-product'].includes(activeTab) ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/shopping-bag.png" alt="" className="sidebar-link-img" />
              <span>My Products</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange('orders')}
              className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/delivery.png" alt="" className="sidebar-link-img" />
              <span>Orders</span>
              {activeOrdersCount > 0 && (
                <span className="ml-auto bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                  {activeOrdersCount}
                </span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange('sales')}
              className={`sidebar-link ${activeTab === 'sales' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/handshake.png" alt="" className="sidebar-link-img" />
              <span>Sales Summary</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange('revenue')}
              className={`sidebar-link ${activeTab === 'revenue' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/rupee.png" alt="" className="sidebar-link-img" />
              <span>Revenue</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange('profile')}
              className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/add-user.png" alt="" className="sidebar-link-img" />
              <span>Profile</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange('settings')}
              className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/shield.png" alt="" className="sidebar-link-img" />
              <span>Settings</span>
            </button>
          </li>
        </ul>
        {/* log out action */}
        <div className="sidebar-footer">
          <button
            onClick={() => {
              navigate('?tab=profile');
              setSidebarOpen(false);
              setTimeout(() => {
                const element = document.querySelector('.two-factor-setup-card');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }, 150);
            }}
            className="logout-button"
            style={{ 
              marginBottom: '0.5rem', 
              background: 'rgba(82, 183, 136, 0.1)', 
              color: '#40916c', 
              border: '1px solid rgba(82, 183, 136, 0.2)' 
            }}
          >
            <img src="/src/assets/icons/shield.png" alt="" className="sidebar-link-img" />
            <span>2FA Settings</span>
          </button>

          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to log out?")) {
                logout();
                navigate('/');
              }
            }} 
            className="logout-button"
          >
            <img src="/src/assets/icons/logout.png" alt="" className="sidebar-link-img" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* main content layout */}
      <main className="dashboard-main">
        
        {/* top header panel */}
        <header className="dashboard-topbar">
          <div className="flex items-center gap-4">
            <button 
              className="hamburger-toggle-menu" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <img src="/src/assets/icons/menu.png" alt="" className="topbar-menu-img" />
            </button>
            <div className="topbar-title-wrapper">
              <h2 className="text-dark">Retailer Dashboard</h2>
              <span className="topbar-subtitle text-muted">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'products' && 'My Products'}
                {activeTab === 'add-product' && 'Add Product'}
                {activeTab === 'edit-product' && 'Edit Product'}
                {activeTab === 'orders' && 'Manage Orders'}
                {activeTab === 'sales' && 'Sales Performance'}
                {activeTab === 'revenue' && 'Revenue & Finance'}
                {activeTab === 'profile' && 'Retailer Profile'}
                {activeTab === 'settings' && 'Store Settings'}
                {` • Welcome back, ${profile.fullName} • Store status: `}
                <strong>{settings.shopOpen ? 'Open' : 'Closed'}</strong>
              </span>
            </div>
          </div>
          
          <div className="topbar-actions">
            <NotificationBell />
          </div>
        </header>

        {/* render tab contents */}
        <div className="dashboard-view-body">
          
          {/* alerts banner */}
          {alert && (
            <div className={`dashboard-alert-banner ${alert.type === 'success' ? 'success' : 'bg-red-100 text-red-700 border border-red-200'}`}>
              <img src="/src/assets/icons/bell.png" alt="" className="topbar-bell-img" style={{ width: '18px', height: '18px' }} />
              <span>{alert.text}</span>
            </div>
          )}

          {/* Render individual tab content components */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: '100%' }}
            >
              {activeTab === 'overview' && (
                <Overview
                  orders={orders}
                  products={products}
                  totalRevenue={totalRevenue}
                  revenueBalance={revenueBalance}
                  setActiveTab={handleTabChange}
                  openEditProductView={openEditProductView}
                />
              )}

              {['products', 'add-product', 'edit-product'].includes(activeTab) && (
                <Products
                  products={products}
                  setProducts={setProducts}
                  activeTab={activeTab}
                  setActiveTab={handleTabChange}
                  editingProduct={editingProduct}
                  setEditingProduct={setEditingProduct}
                  deletingProductId={deletingProductId}
                  setDeletingProductId={setDeletingProductId}
                  setAlert={setAlert}
                  onRefresh={fetchProducts}
                />
              )}

              {activeTab === 'orders' && (
                <Orders
                  orders={orders}
                  setOrders={setOrders}
                  setAlert={setAlert}
                  onRefresh={fetchOrders}
                />
              )}

              {activeTab === 'sales' && (
                <Sales
                  orders={orders}
                  products={products}
                  totalSalesCount={totalSalesCount}
                  totalRevenue={totalRevenue}
                />
              )}

              {activeTab === 'revenue' && (
                <Revenue
                  revenueBalance={revenueBalance}
                  setRevenueBalance={setRevenueBalance}
                  transactions={transactions}
                  setTransactions={setTransactions}
                  setAlert={setAlert}
                />
              )}

              {activeTab === 'profile' && (
                <Profile
                  profile={profile}
                  setProfile={setProfile}
                  profilePhoto={profilePhoto}
                  setProfilePhoto={setProfilePhoto}
                  setAlert={setAlert}
                />
              )}

              {activeTab === 'settings' && (
                <Settings
                  settings={settings}
                  setSettings={setSettings}
                  setAlert={setAlert}
                />
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
