import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './RetailerDashboard.css';

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
  const { user, logout } = useAuth();
  
  // state for mobile menu toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // state for current active tab
  const [activeTab, setActiveTab] = useState('overview');

  // state for alert messages
  const [alert, setAlert] = useState(null);

  // hide alert banner after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // default products list
  const [products, setProducts] = useState([
    {
      id: 'PROD-101',
      title: 'Organic Red Tomatoes',
      category: 'Vegetables',
      price: 150.00,
      stock: 120,
      unit: 'kg',
      description: 'Fresh organic red tomatoes from greenhouse.',
      image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'PROD-102',
      title: 'Fresh Gala Apples',
      category: 'Fruits',
      price: 200.00,
      stock: 8,
      unit: 'kg',
      description: 'Sweet red gala apples from the orchard.',
      image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'PROD-103',
      title: 'Yukon Gold Potatoes',
      category: 'Tubers',
      price: 80.00,
      stock: 450,
      unit: 'kg',
      description: 'Gold potatoes for baking or boiling.',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'PROD-104',
      title: 'Raw Farm Fresh Milk',
      category: 'Dairy',
      price: 60.00,
      stock: 0,
      unit: 'liter',
      description: 'Fresh milk from grass-fed cows.',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'PROD-105',
      title: 'Whole Grain Wheat Flour',
      category: 'Grains',
      price: 350.00,
      stock: 85,
      unit: 'bag',
      description: 'Organic whole grain flour for baking bread.',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400'
    }
  ]);

  // state for active editing and deleting product
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  // default list of orders
  const [orders, setOrders] = useState([
    {
      id: 'ORD-9021',
      buyerName: 'Venkatesh Rao',
      productName: 'Organic Red Tomatoes',
      quantity: 15,
      unit: 'kg',
      total: 2250.00,
      date: '2026-08-04',
      status: 'pending'
    },
    {
      id: 'ORD-9022',
      buyerName: 'Lalitha Devi',
      productName: 'Whole Grain Wheat Flour',
      quantity: 4,
      unit: 'bag',
      total: 1400.00,
      date: '2026-08-03',
      status: 'shipped'
    },
    {
      id: 'ORD-9023',
      buyerName: 'Rambabu',
      productName: 'Fresh Gala Apples',
      quantity: 10,
      unit: 'kg',
      total: 2000.00,
      date: '2026-08-02',
      status: 'delivered'
    },
    {
      id: 'ORD-9024',
      buyerName: 'Satyavati Naidu',
      productName: 'Yukon Gold Potatoes',
      quantity: 50,
      unit: 'kg',
      total: 4000.00,
      date: '2026-08-01',
      status: 'delivered'
    },
    {
      id: 'ORD-9025',
      buyerName: 'Ravi Shankar',
      productName: 'Raw Farm Fresh Milk',
      quantity: 5,
      unit: 'liter',
      total: 300.00,
      date: '2026-07-30',
      status: 'cancelled'
    }
  ]);

  // state for financial balance and payouts
  const [revenueBalance, setRevenueBalance] = useState(85000.00);
  const [transactions, setTransactions] = useState([
    { id: 'TXN-401', type: 'order_sale', desc: 'Sale payout for ORD-9023', amount: 2000.00, date: '2026-08-02', status: 'completed' },
    { id: 'TXN-402', type: 'order_sale', desc: 'Sale payout for ORD-9024', amount: 4000.00, date: '2026-08-01', status: 'completed' },
    { id: 'TXN-403', type: 'withdrawal', desc: 'Transfer to Bank Account (*7829)', amount: -25000.00, date: '2026-07-28', status: 'completed' },
    { id: 'TXN-404', type: 'order_sale', desc: 'Sale payout for ORD-8942', amount: 9500.00, date: '2026-07-25', status: 'completed' }
  ]);

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

  // sync profile data if user changes
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
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
    setActiveTab('edit-product');
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
        <Link to="/" className="sidebar-brand" onClick={() => setSidebarOpen(false)}>
          <img src="/src/assets/icons/leaf.png" alt="Leaf Logo" className="sidebar-logo-img" />
          <span>Agri<span className="sidebar-brand-accent">Market</span></span>
        </Link>

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
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
              className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/graph.png" alt="" className="sidebar-link-img" />
              <span>Overview</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
              className={`sidebar-link ${['products', 'add-product', 'edit-product'].includes(activeTab) ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/shopping-bag.png" alt="" className="sidebar-link-img" />
              <span>My Products</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
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
              onClick={() => { setActiveTab('sales'); setSidebarOpen(false); }}
              className={`sidebar-link ${activeTab === 'sales' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/handshake.png" alt="" className="sidebar-link-img" />
              <span>Sales Summary</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('revenue'); setSidebarOpen(false); }}
              className={`sidebar-link ${activeTab === 'revenue' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/rupee.png" alt="" className="sidebar-link-img" />
              <span>Revenue</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
              className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/add-user.png" alt="" className="sidebar-link-img" />
              <span>Profile</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
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
            <button className="notification-bell-btn" aria-label="Notifications">
              <img src="/src/assets/icons/bell.png" alt="" className="topbar-bell-img" />
              {activeOrdersCount > 0 && <span className="notification-badge"></span>}
            </button>
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
          {activeTab === 'overview' && (
            <Overview
              orders={orders}
              products={products}
              totalRevenue={totalRevenue}
              revenueBalance={revenueBalance}
              setActiveTab={setActiveTab}
              openEditProductView={openEditProductView}
            />
          )}

          {['products', 'add-product', 'edit-product'].includes(activeTab) && (
            <Products
              products={products}
              setProducts={setProducts}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
              deletingProductId={deletingProductId}
              setDeletingProductId={setDeletingProductId}
              setAlert={setAlert}
            />
          )}

          {activeTab === 'orders' && (
            <Orders
              orders={orders}
              setOrders={setOrders}
              setAlert={setAlert}
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

        </div>
      </main>
    </div>
  );
}
