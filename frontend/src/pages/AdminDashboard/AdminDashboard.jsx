import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants } from '../../utils/animations';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import { useLocation } from 'react-router-dom';
import './AdminDashboard.css';
import logoBanner from '../../assets/logo-banner.png';

// Import subfolder components
import Overview from './Overview/Overview';
import Users from './Users/Users';
import Products from './Products/Products';
import Orders from './Orders/Orders';
import Payments from './Payments/Payments';
import Profile from './Profile/Profile';
import Settings from './Settings/Settings';
import AdminCoupons from './Coupons/AdminCoupons';
import AdminQueries from './Queries/AdminQueries';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [alert, setAlert] = useState(null);

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

  // hide alert banners automatically
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [queries, setQueries] = useState([]);

  // Mock seller payouts database
  const [payoutRequests, setPayoutRequests] = useState([]);

  // Mock platform financials settings
  const [platformEarnings, setPlatformEarnings] = useState(0);
  const [adminSettings, setAdminSettings] = useState({
    commissionRate: 5.0,
    maintenanceMode: false,
    allowRegistrations: true
  });

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map(u => ({
          ...u,
          id: u._id
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/products', {
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

        // Calculate dynamic platform earnings (commission) from delivered orders
        const calculatedEarnings = mapped
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + (Number(o.total || 0) * (adminSettings.commissionRate / 100)), 0);
        setPlatformEarnings(calculatedEarnings);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchQueries = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/queries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setQueries(data);
      }
    } catch (err) {
      console.error('Error fetching queries:', err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
      fetchProducts();
      fetchOrders();
      fetchQueries();

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchUsers();
          fetchProducts();
          fetchOrders();
          fetchQueries();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user]);

  // state for admin user profile

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
        <div className="sidebar-brand" onClick={() => handleTabChange('overview')} style={{ cursor: 'pointer' }}>
          <img src={logoBanner} alt="AgriMarket Logo" className="sidebar-logo-img" />
        </div>

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
              onClick={() => handleTabChange('overview')}
              className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/graph.png" alt="" className="sidebar-link-img" />
              <span>Overview</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange('users')}
              className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/group.png" alt="" className="sidebar-link-img" />
              <span>Manage Users</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange('products')}
              className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/wheat.png" alt="" className="sidebar-link-img" />
              <span>Manage Products</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange('orders')}
              className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/delivery.png" alt="" className="sidebar-link-img" />
              <span>Manage Orders</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange('payments')}
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
              onClick={() => handleTabChange('coupons')}
              className={`sidebar-link ${activeTab === 'coupons' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/rupee.png" alt="" className="sidebar-link-img" />
              <span>Coupons & Discounts</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange('queries')}
              className={`sidebar-link ${activeTab === 'queries' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/group.png" alt="" className="sidebar-link-img" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
              <span>Manage Queries</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabChange('profile')}
              className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/group.png" alt="" className="sidebar-link-img" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
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
                {activeTab === 'coupons' && 'Coupons & Discounts Campaign Manager'}
                {activeTab === 'profile' && 'Admin Profile'}
                {activeTab === 'queries' && 'User contact queries'}
                {activeTab === 'settings' && 'Global platform settings'}
                {` • Logged in as Administrator • Commission Rate: `}
                <strong>{adminSettings.commissionRate}%</strong>
              </span>
            </div>
          </div>

          <div className="topbar-actions">
            <NotificationBell />
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
                  users={users}
                  products={products}
                  orders={orders}
                  platformEarnings={platformEarnings}
                  setActiveTab={handleTabChange}
                  setAlert={setAlert}
                />
              )}

              {activeTab === 'users' && (
                <Users
                  users={users}
                  setUsers={setUsers}
                  setAlert={setAlert}
                  onRefresh={fetchUsers}
                />
              )}

              {activeTab === 'products' && (
                <Products
                  products={products}
                  setProducts={setProducts}
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

              {activeTab === 'coupons' && (
                <AdminCoupons
                  setAlert={setAlert}
                />
              )}

              {activeTab === 'queries' && (
                <AdminQueries
                  queries={queries}
                  setAlert={setAlert}
                  onRefresh={fetchQueries}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
