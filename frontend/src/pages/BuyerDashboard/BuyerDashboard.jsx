import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  ShoppingCart, 
  Heart, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Bell, 
  Leaf,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../FarmerDashboard/FarmerDashboard.css';

import Overview from './Overview/Overview';
import Browse from './Browse/Browse';
import Cart from './Cart/Cart';
import Orders from './Orders/Orders';
import Wishlist from './Wishlist/Wishlist';
import Profile from './Profile/Profile';
import SettingsTab from './Settings/Settings';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Initialize crop list state as empty.
  const [products, setProducts] = useState([]);

  // Initialize cart list state from localStorage.
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(`cart_${user?.email || 'buyer'}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Initialize wishlist state from localStorage.
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem(`wishlist_${user?.email || 'buyer'}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Initialize orders list state as empty.
  const [orders, setOrders] = useState([]);

  // Fetch crop listings and placed orders from the backend API.
  const fetchProductsAndOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const productsRes = await fetch('http://localhost:5000/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      if (token) {
        const headers = { 'Authorization': `Bearer ${token}` };
        const ordersRes = await fetch('http://localhost:5000/api/orders/buyer', { headers });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger data fetch on mount or user state change.
  useEffect(() => {
    fetchProductsAndOrders();
  }, [user]);

  const [profileData, setProfileData] = useState(() => {
    const storageKey = `profile_${user?.email || 'buyer'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      firstName: user?.fullName ? user.fullName.split(' ')[0] : 'Buyer',
      lastName: user?.fullName ? user.fullName.split(' ').slice(1).join(' ') : '',
      phone: '',
      email: user?.email || '',
      role: 'buyer',
      addressStreet: '',
      addressCity: '',
      addressState: '',
      addressPin: '',
      profilePhoto: null
    };
  });

  const [profileFormInputs, setProfileFormInputs] = useState({ ...profileData });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return document.body.classList.contains('dark-theme');
  });

  useEffect(() => {
    localStorage.setItem(`cart_${user?.email || 'buyer'}`, JSON.stringify(cart));
  }, [cart, user]);

  useEffect(() => {
    localStorage.setItem(`wishlist_${user?.email || 'buyer'}`, JSON.stringify(wishlist));
  }, [wishlist, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logActivity = (text, type = 'info') => {
    console.log(`[Buyer Activity Log] ${type.toUpperCase()}: ${text}`);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchQuery('');
  };

  const handleAddToCart = (crop) => {
    const existing = cart.find(item => item.id === crop.id);
    if (existing) {
      if (existing.quantity >= crop.stock) {
        alert('Cannot add more of this item. Maximum stock limit reached.');
        return;
      }
      setCart(cart.map(item => 
        item.id === crop.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...crop, quantity: 1 }]);
    }
    showToast('Product added successfully');
    logActivity(`Added ${crop.name} to shopping cart`, 'cart');
  };

  const handleUpdateCartQty = (id, qty) => {
    if (qty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: qty } : item
    ));
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
    logActivity(`Removed crop item from cart`, 'cart');
  };

  const handleToggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
      logActivity(`Removed crop from saved wishlist`, 'wishlist');
    } else {
      setWishlist([...wishlist, id]);
      logActivity(`Saved crop item to wishlist`, 'wishlist');
    }
  };

  // Place crop orders and deduct inventory stock via the backend API.
  const handleCheckout = async (address, phone, amount) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Loop through each cart item and place an order.
      for (const item of cart) {
        const payload = {
          productId: item._id || item.id,
          quantity: item.quantity,
          buyerPhone: phone,
          buyerAddress: address
        };

        const res = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json();
          alert(`Checkout failed: ${errData.message || 'Error occurred'}`);
          return;
        }
      }

      setCart([]);
      localStorage.removeItem(`cart_${user?.email || 'buyer'}`);
      alert('Checkout Successful!\nYour order has been placed successfully and is pending shipment.');
      
      // Refresh inventory and order history lists.
      fetchProductsAndOrders();
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel a pending order via the backend API.
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'cancelled' })
        });
        if (res.ok) {
          fetchProductsAndOrders();
          logActivity(`Cancelled order transaction ${orderId}`, 'warning');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateProfileData = (updatedProfile) => {
    setProfileData(updatedProfile);
    const storageKey = `profile_${user?.email || 'buyer'}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
    logActivity('Profile details updated successfully', 'success');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...profileData,
      firstName: profileFormInputs.firstName,
      lastName: profileFormInputs.lastName,
      phone: profileFormInputs.phone,
      email: profileFormInputs.email,
      addressStreet: profileFormInputs.addressStreet,
      addressCity: profileFormInputs.addressCity,
      addressState: profileFormInputs.addressState,
      addressPin: profileFormInputs.addressPin,
      profilePhoto: profileFormInputs.profilePhoto
    };

    handleUpdateProfileData(updatedProfile);
    setIsEditingProfile(false);
  };

  return (
    <div className="farmer-dashboard-layout buyer-dashboard-layout">

      <aside className="farmer-sidebar">
        <Link to="/" className="sidebar-logo">
          <img src="/src/assets/icons/leaf.png" alt="Leaf Logo" className="sidebar-logo-img" />
          <span>Agri<span className="logo-accent">Market</span></span>
        </Link>

        <div className="sidebar-user-card">
          {profileData.profilePhoto ? (
            <img src={profileData.profilePhoto} alt="User Avatar" className="w-12 h-12 object-cover rounded-full border border-slate-200" />
          ) : (
            <div className="sidebar-avatar">
              {profileData.firstName ? profileData.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="sidebar-user-info">
            <span className="sidebar-user-name" title={`${profileData.firstName} ${profileData.lastName}`}>
              {profileData.firstName} {profileData.lastName}
            </span>
            <span className="sidebar-user-role">Buyer Dashboard</span>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li className="menu-item">
            <button 
              onClick={() => handleTabChange('dashboard')} 
              className={`menu-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/graph.png" alt="" className="sidebar-link-img" />
              <span>Overview</span>
            </button>
          </li>
          <li className="menu-item">
            <button 
              onClick={() => handleTabChange('browse')} 
              className={`menu-link ${activeTab === 'browse' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/wheat.png" alt="" className="sidebar-link-img" />
              <span>Browse Crops</span>
            </button>
          </li>
          <li className="menu-item">
            <button 
              onClick={() => handleTabChange('cart')} 
              className={`menu-link ${activeTab === 'cart' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/shopping-bag.png" alt="" className="sidebar-link-img" />
              <span>Cart Summary</span>
            </button>
          </li>
          <li className="menu-item">
            <button 
              onClick={() => handleTabChange('orders')} 
              className={`menu-link ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/delivery.png" alt="" className="sidebar-link-img" />
              <span>Placed Orders</span>
            </button>
          </li>
          <li className="menu-item">
            <button 
              onClick={() => handleTabChange('wishlist')} 
              className={`menu-link ${activeTab === 'wishlist' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/star.png" alt="" className="sidebar-link-img" />
              <span>Saved Crops</span>
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to log out?")) {
                logout();
              }
            }} 
            className="logout-button"
          >
            <img src="/src/assets/icons/logout.png" alt="" className="sidebar-link-img" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main className="farmer-dashboard-main">

        <header className="dashboard-topnav">
          <div className="topnav-left">
            <h2 className="topnav-title">
              {activeTab === 'dashboard' && 'Hello'}
              {activeTab === 'browse' && 'Browse Catalog'}
              {activeTab === 'cart' && 'My Cart'}
              {activeTab === 'orders' && 'Orders History'}
              {activeTab === 'wishlist' && 'My Saved Crops'}
              {activeTab === 'profile' && 'My Profile'}
              {activeTab === 'settings' && 'Account Settings'}
            </h2>
            <p className="topnav-subtitle">
              {activeTab === 'dashboard' && `Support local farming by buying organic produce direct.`}
              {activeTab === 'browse' && 'Find and purchase fresh crops direct from farmer inventories.'}
              {activeTab === 'cart' && 'Review your crop choices and complete your order simulation.'}
              {activeTab === 'orders' && 'Track progress stages of all your active and fulfilled orders.'}
              {activeTab === 'wishlist' && 'View crops you saved to buy or inspect later.'}
              {activeTab === 'profile' && 'Configure personal details, contact address, and photo.'}
              {activeTab === 'settings' && 'Manage your notifications and visual dashboard themes.'}
            </p>
          </div>

          <div className="topnav-right">
            <button className="topnav-notification-bell" aria-label="Notifications" style={{ marginRight: '1rem' }}>
              <Bell size={20} />
              <span className="bell-badge"></span>
            </button>

            <div className="navbar-profile-container" ref={dropdownRef}>
              <button 
                className="navbar-profile-trigger" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <div className="navbar-avatar-placeholder">
                  {profileData.profilePhoto ? (
                    <img src={profileData.profilePhoto} alt="Avatar" className="navbar-avatar" />
                  ) : (
                    profileData.firstName ? profileData.firstName.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <span className="navbar-user-name">
                  {profileData.firstName} {profileData.lastName}
                </span>
                <span className={`navbar-role-tag buyer`}>buyer</span>
              </button>

              {isDropdownOpen && (
                <div className="navbar-dropdown">
                  <div className="dropdown-header">
                    <span className="dropdown-name">{profileData.firstName} {profileData.lastName}</span>
                    <span className="dropdown-email">{profileData.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>

                  <button 
                    onClick={() => {
                      setActiveTab('profile');
                      setIsDropdownOpen(false);
                    }} 
                    className="dropdown-item"
                  >
                    My Profile
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('settings');
                      setIsDropdownOpen(false);
                    }} 
                    className="dropdown-item"
                  >
                    Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <Overview 
            profileData={profileData}
            cart={cart}
            wishlist={wishlist}
            orders={orders}
            handleTabChange={handleTabChange}
          />
        )}

        {activeTab === 'browse' && (
          <Browse 
            products={products}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            handleAddToCart={handleAddToCart}
            wishlist={wishlist}
            handleToggleWishlist={handleToggleWishlist}
            cart={cart}
            onGoToCart={() => handleTabChange('cart')}
          />
        )}

        {activeTab === 'cart' && (
          <Cart 
            cart={cart}
            handleUpdateCartQty={handleUpdateCartQty}
            handleRemoveFromCart={handleRemoveFromCart}
            handleCheckout={handleCheckout}
            profileData={profileData}
          />
        )}

        {activeTab === 'orders' && (
          <Orders 
            orders={orders}
            handleCancelOrder={handleCancelOrder}
          />
        )}

        {activeTab === 'wishlist' && (
          <Wishlist 
            products={products}
            wishlist={wishlist}
            handleToggleWishlist={handleToggleWishlist}
            handleAddToCart={handleAddToCart}
          />
        )}

        {activeTab === 'profile' && (
          <Profile 
            profileData={profileData}
            isEditingProfile={isEditingProfile}
            setIsEditingProfile={setIsEditingProfile}
            profileFormInputs={profileFormInputs}
            setProfileFormInputs={setProfileFormInputs}
            handleSaveProfile={handleSaveProfile}
            handleUpdateProfileData={handleUpdateProfileData}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
            smsNotifications={smsNotifications}
            setSmsNotifications={setSmsNotifications}
            isDarkTheme={isDarkTheme}
            setIsDarkTheme={setIsDarkTheme}
            logActivity={logActivity}
          />
        )}
      </main>

      {toast.show && (
        <div className="dashboard-toast">
          <div className="toast-content">
            <span className="toast-icon">✓</span>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
