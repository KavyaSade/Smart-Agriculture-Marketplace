import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

// Import subfolder components
import Overview from './Overview/Overview';
import Users from './Users/Users';
import Products from './Products/Products';
import Orders from './Orders/Orders';
import Payments from './Payments/Payments';
import Profile from './Profile/Profile';
import Settings from './Settings/Settings';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [alert, setAlert] = useState(null);

  // hide alert banners automatically
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Mock platforms users database
  const [users, setUsers] = useState([
    { id: 'USR-201', fullName: 'Rishi', email: 'rishi@gmail.com', phone: '987654321', role: 'retailer', status: 'active', farmName: 'Rishi Organic Farms', isVerified: true, commissionRate: 5, joinedDate: '2026-08-04', location: 'Nellore, Andhra Pradesh' },
    { id: 'USR-202', fullName: 'Kavya', email: 'kavya@gmail.com', phone: '987654321', role: 'retailer', status: 'active', farmName: 'Kavya Organic Farms', isVerified: true, commissionRate: 5, joinedDate: '2025-11-20', location: 'Guntur, Andhra Pradesh' },
    { id: 'USR-203', fullName: 'Dileep', email: 'dileep@gmail.com', phone: '987654321', role: 'buyer', status: 'active', joinedDate: '2026-01-15', location: 'Vijayawada, Andhra Pradesh' },
    { id: 'USR-204', fullName: 'Lalitha Devi', email: 'lalitha@gmail.com', phone: '987654321', role: 'buyer', status: 'active', joinedDate: '2026-03-01', location: 'Visakhapatnam, Andhra Pradesh' },
    { id: 'USR-205', fullName: 'Admin', email: 'admin@gmail.com', phone: '987654321', role: 'admin', status: 'active', joinedDate: '2025-01-01', location: 'Eluru District, Andhra Pradesh' },
    { id: 'USR-206', fullName: 'Srinivas Rao', email: 'srinivas@gmail.com', phone: '987654321', role: 'user', status: 'active', joinedDate: '2026-05-10', location: 'Vijayawada, Andhra Pradesh' },
    { id: 'USR-207', fullName: 'Venkat', email: 'venkat@gmail.com', phone: '987654321', role: 'user', status: 'active', joinedDate: '2026-06-12', location: 'Tirupati, Andhra Pradesh' },
    { id: 'USR-208', fullName: 'Anjali', email: 'anjali@gmail.com', phone: '987654321', role: 'user', status: 'active', joinedDate: '2026-07-15', location: 'Visakhapatnam, Andhra Pradesh' }
  ]);

  // Mock platform live products database
  const [products, setProducts] = useState([
    { id: 'PROD-101', title: 'Organic Red Tomatoes', category: 'Vegetables', price: 150.00, stock: 120, unit: 'kg', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400' },
    { id: 'PROD-102', title: 'Fresh Gala Apples', category: 'Fruits', price: 200.00, stock: 8, unit: 'kg', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=400' },
    { id: 'PROD-103', title: 'Yukon Gold Potatoes', category: 'Tubers', price: 80.00, stock: 450, unit: 'kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400' },
    { id: 'PROD-104', title: 'Raw Farm Fresh Milk', category: 'Dairy', price: 60.00, stock: 0, unit: 'liter', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400' },
    { id: 'PROD-105', title: 'Whole Grain Wheat Flour', category: 'Grains', price: 350.00, stock: 85, unit: 'bag', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400' }
  ]);

  // Mock platform active orders logs
  const [orders, setOrders] = useState([
    { id: 'ORD-9021', buyerName: 'Dileep', productName: 'Organic Red Tomatoes', quantity: 15, unit: 'kg', total: 2250.00, date: '2026-08-04', status: 'pending' },
    { id: 'ORD-9022', buyerName: 'Lalitha Devi', productName: 'Whole Grain Wheat Flour', quantity: 4, unit: 'bag', total: 1400.00, date: '2026-08-03', status: 'shipped' },
    { id: 'ORD-9023', buyerName: 'Rambabu', productName: 'Fresh Gala Apples', quantity: 10, unit: 'kg', total: 2000.00, date: '2026-08-02', status: 'delivered' },
    { id: 'ORD-9024', buyerName: 'Satyavati', productName: 'Yukon Gold Potatoes', quantity: 50, unit: 'kg', total: 4000.00, date: '2026-08-01', status: 'delivered' }
  ]);

  // Mock seller payouts database
  const [payoutRequests, setPayoutRequests] = useState([
    { id: 'REQ-301', sellerName: 'Kavya', amount: 12500.00, date: '2026-08-05', status: 'pending' },
    { id: 'REQ-302', sellerName: 'Rishi', amount: 4500.00, date: '2026-08-04', status: 'completed' }
  ]);

  // Mock platform financials settings
  const [platformEarnings, setPlatformEarnings] = useState(14800.00);
  const [adminSettings, setAdminSettings] = useState({
    commissionRate: 5.0,
    maintenanceMode: false,
    allowRegistrations: true
  });

  // state for admin user profile
  const [profile, setProfile] = useState({
    fullName: user?.fullName || 'Admin',
    email: user?.email || 'admin@gmail.com',
    phone: user?.phone || '987654321',
    location: 'Eluru District, Andhra Pradesh, India',
    bio: 'Connecting verified farmers directly with wholesale buyers and consumers with secure escrow payments.'
  });
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

  const pendingWithdrawalRequestsCount = payoutRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="dashboard-container">
      {/* overlay backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div className="sidebar-backdrop-mobile" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* admin sidebar navigation */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'mobile-visible' : ''}`}>
        <Link to="/" className="sidebar-brand" onClick={() => setSidebarOpen(false)}>
          <img src="/src/assets/icons/leaf.png" alt="Leaf Logo" className="sidebar-logo-img" />
          <span>Agri<span className="sidebar-brand-accent">Market</span></span>
        </Link>

        {/* user card header */}
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
            <span className="sidebar-user-role">Administrator</span>
          </div>
        </div>

        {/* links to admin tabs */}
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
              onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
              className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/group.png" alt="" className="sidebar-link-img" />
              <span>Manage Users</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
              className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/wheat.png" alt="" className="sidebar-link-img" />
              <span>Manage Products</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
              className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/delivery.png" alt="" className="sidebar-link-img" />
              <span>Manage Orders</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('payments'); setSidebarOpen(false); }}
              className={`sidebar-link ${activeTab === 'payments' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/rupee.png" alt="" className="sidebar-link-img" />
              <span>Payments</span>
              {pendingWithdrawalRequestsCount > 0 && (
                <span className="ml-auto bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                  {pendingWithdrawalRequestsCount}
                </span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
              className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/group.png" alt="" className="sidebar-link-img" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
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

        {/* sign out button */}
        <div className="sidebar-footer">
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to log out from platform admin?")) {
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

      {/* admin main body */}
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
              <h2 className="text-dark">Admin Dashboard</h2>
              <span className="topbar-subtitle text-muted">
                {activeTab === 'overview' && 'Platform Overview'}
                {activeTab === 'users' && 'Manage Registered Users'}
                {activeTab === 'products' && 'Moderate Product Catalog'}
                {activeTab === 'orders' && 'Platform Orders Ledger'}
                {activeTab === 'payments' && 'Payouts & platform wallet'}
                {activeTab === 'profile' && 'Admin Profile'}
                {activeTab === 'settings' && 'Global platform settings'}
                {` • Logged in as Administrator • Commission Rate: `}
                <strong>{adminSettings.commissionRate}%</strong>
              </span>
            </div>
          </div>
          
          <div className="topbar-actions">
            <button className="notification-bell-btn" aria-label="Notifications">
              <img src="/src/assets/icons/bell.png" alt="" className="topbar-bell-img" />
              {pendingWithdrawalRequestsCount > 0 && <span className="notification-badge"></span>}
            </button>
          </div>
        </header>

        {/* render selected tab */}
        <div className="dashboard-view-body">
          {alert && (
            <div className={`dashboard-alert-banner ${alert.type === 'success' ? 'success' : 'bg-red-100 text-red-700 border border-red-200'}`}>
              <img src="/src/assets/icons/bell.png" alt="" className="topbar-bell-img" style={{ width: '18px', height: '18px' }} />
              <span>{alert.text}</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <Overview
              users={users}
              products={products}
              orders={orders}
              platformEarnings={platformEarnings}
              setActiveTab={setActiveTab}
              setAlert={setAlert}
            />
          )}

          {activeTab === 'users' && (
            <Users
              users={users}
              setUsers={setUsers}
              setAlert={setAlert}
            />
          )}

          {activeTab === 'products' && (
            <Products
              products={products}
              setProducts={setProducts}
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

          {activeTab === 'payments' && (
            <Payments
              platformEarnings={platformEarnings}
              setPlatformEarnings={setPlatformEarnings}
              payoutRequests={payoutRequests}
              setPayoutRequests={setPayoutRequests}
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
              adminSettings={adminSettings}
              setAdminSettings={setAdminSettings}
              setAlert={setAlert}
            />
          )}
        </div>
      </main>
    </div>
  );
}
