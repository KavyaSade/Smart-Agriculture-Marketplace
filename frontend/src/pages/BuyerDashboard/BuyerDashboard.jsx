import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants } from '../../utils/animations';import { 
  LayoutDashboard, 
  Search, 
  ShoppingCart, 
  Heart, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Bell, 
  Leaf,
  User,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import { useLocation } from 'react-router-dom';
import '../FarmerDashboard/FarmerDashboard.css';
import logoBanner from '../../assets/logo-banner.png';
import Overview from './Overview/Overview';
import Browse from './Browse/Browse';
import Cart from './Cart/Cart';
import Orders from './Orders/Orders';
import Wishlist from './Wishlist/Wishlist';
import Profile from './Profile/Profile';
import SettingsTab from './Settings/Settings';
import Chat from '../../components/Chat/Chat';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user && !localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // state for storing selected farmer to chat with
  const [selectedChatPartner, setSelectedChatPartner] = useState(null);

  // handler to initiate chat and change active tab
  const handleStartChat = (partner) => {
    setSelectedChatPartner(partner);
    handleTabChange('chat');
  };

  // Sync tab with navigation state/query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') || location.state?.activeTab;
    setActiveTab(tabParam || 'dashboard');

    const partnerId = params.get('partnerId');
    if (tabParam === 'chat' && partnerId) {
      setSelectedChatPartner({ _id: partnerId });
    }
  }, [location]);
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
  const [cart, setCart] = useState([]);

  // Initialize wishlist state from localStorage.
  const [wishlist, setWishlist] = useState([]);

  // Initialize orders list state as empty.
  const [orders, setOrders] = useState([]);

  // state for storing unread chat messages count
  const [unreadChatCount, setUnreadChatCount] = useState(0);

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

        // fetch unread chat count
        try {
          const chatRes = await fetch('http://localhost:5000/api/chat/unread-count', { headers });
          if (chatRes.ok) {
            const chatData = await chatRes.json();
            setUnreadChatCount(chatData.unreadCount || 0);
          }
        } catch (chatErr) {
          console.error('error fetching unread chat count:', chatErr);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger data fetch on mount and start a polling interval for real-time tracking.
  useEffect(() => {
    if (!user) return;
    fetchProductsAndOrders();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProductsAndOrders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchProductsAndOrders();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const [profileData, setProfileData] = useState({
    firstName: 'Buyer',
    lastName: '',
    phone: '',
    email: '',
    role: 'buyer',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressPin: '',
    profilePhoto: null
  });

  const [profileFormInputs, setProfileFormInputs] = useState({
    firstName: 'Buyer',
    lastName: '',
    phone: '',
    email: '',
    role: 'buyer',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressPin: '',
    profilePhoto: null
  });

  // Load user data once user changes (page refresh or login)
  useEffect(() => {
    if (user?.email) {
      // 1. Load Profile
      let loadedProfile = null;
      if (user && (user.addressStreet || user.profilePhoto || user.phone || user.bio || user.isTwoFactorEnabled)) {
        loadedProfile = {
          firstName: user.fullName ? user.fullName.split(' ')[0] : 'Buyer',
          lastName: user.fullName ? user.fullName.split(' ').slice(1).join(' ') : '',
          phone: user.phone || '',
          email: user.email || '',
          role: 'buyer',
          addressStreet: user.addressStreet || '',
          addressCity: user.addressCity || '',
          addressState: user.addressState || '',
          addressPin: user.addressPin || '',
          profilePhoto: user.profilePhoto || null,
          isTwoFactorEnabled: user.isTwoFactorEnabled || false
        };
      }

      if (!loadedProfile) {
        const storageKey = `profile_${user.email}`;
        const savedProfile = localStorage.getItem(storageKey);
        if (savedProfile) {
          try {
            loadedProfile = JSON.parse(savedProfile);
          } catch (e) {
            console.error(e);
          }
        }
      }

      if (!loadedProfile) {
        loadedProfile = {
          firstName: user.fullName ? user.fullName.split(' ')[0] : 'Buyer',
          lastName: user.fullName ? user.fullName.split(' ').slice(1).join(' ') : '',
          phone: user.phone || '',
          email: user.email || '',
          role: 'buyer',
          addressStreet: '',
          addressCity: '',
          addressState: '',
          addressPin: '',
          profilePhoto: null,
          isTwoFactorEnabled: user.isTwoFactorEnabled || false
        };
      }
      setProfileData(loadedProfile);
      setProfileFormInputs(loadedProfile);

      // 2. Load Cart
      const savedCart = localStorage.getItem(`cart_${user.email}`);
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error(e);
        }
      } else {
        setCart([]);
      }

      // 3. Load Wishlist
      const savedWishlist = localStorage.getItem(`wishlist_${user.email}`);
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (e) {
          console.error(e);
        }
      } else {
        setWishlist([]);
      }
    }
  }, [user]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return document.body.classList.contains('dark-theme');
  });

  // Storage is synchronized directly inside the state modifier functions to prevent synchronization race conditions.

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
    navigate(`?tab=${tabName}`);
    setSearchQuery('');
    setSidebarOpen(false);
    fetchProductsAndOrders();
    if (tabName === 'chat') {
      setUnreadChatCount(0);
    }
  };

  const handleAddToCart = (crop) => {
    const cropId = crop._id || crop.id;
    const existing = cart.find(item => (item._id || item.id) === cropId);
    let newCart;
    if (existing) {
      if (existing.quantity >= crop.stock) {
        alert('Cannot add more of this item. Maximum stock limit reached.');
        return;
      }
      newCart = cart.map(item => 
        (item._id || item.id) === cropId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...crop, id: cropId, quantity: 1 }];
    }
    setCart(newCart);
    if (user?.email) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(newCart));
    }
    showToast('Product added successfully');
    logActivity(`Added ${crop.name} to shopping cart`, 'cart');
  };

  const handleUpdateCartQty = (id, qty) => {
    if (qty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    const newCart = cart.map(item => 
      (item._id || item.id) === id ? { ...item, quantity: qty } : item
    );
    setCart(newCart);
    if (user?.email) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(newCart));
    }
  };

  const handleRemoveFromCart = (id) => {
    const newCart = cart.filter(item => (item._id || item.id) !== id);
    setCart(newCart);
    if (user?.email) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(newCart));
    }
    logActivity(`Removed crop item from cart`, 'cart');
  };

  const handleToggleWishlist = (id) => {
    let newWishlist;
    if (wishlist.includes(id)) {
      newWishlist = wishlist.filter(item => item !== id);
      logActivity(`Removed crop from saved wishlist`, 'wishlist');
    } else {
      newWishlist = [...wishlist, id];
      logActivity(`Saved crop item to wishlist`, 'wishlist');
    }
    setWishlist(newWishlist);
    if (user?.email) {
      localStorage.setItem(`wishlist_${user.email}`, JSON.stringify(newWishlist));
    }
  };

  // redirect the user to the payment checkout screen
  const handleCheckout = (address, phone, amount) => {
    navigate('/payment/checkout', { state: { cart, address, phone, total: amount } });
    return true;
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

  const handleUpdateProfileData = async (updatedProfile) => {
    setProfileData(updatedProfile);
    if (user?.email) {
      localStorage.setItem(`profile_${user.email}`, JSON.stringify(updatedProfile));
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://localhost:5000/api/users/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fullName: `${updatedProfile.firstName} ${updatedProfile.lastName}`.trim(),
            phone: updatedProfile.phone,
            addressStreet: updatedProfile.addressStreet || '',
            addressCity: updatedProfile.addressCity || '',
            addressState: updatedProfile.addressState || '',
            addressPin: updatedProfile.addressPin || '',
            profilePhoto: updatedProfile.profilePhoto || null
          })
        });
      } catch (err) {
        console.error('Error saving profile to database:', err);
      }
    }
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
      {sidebarOpen && (
        <div className="sidebar-backdrop-mobile" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`farmer-sidebar ${sidebarOpen ? 'mobile-visible' : ''}`}>
        <div className="sidebar-logo" onClick={() => { handleTabChange('dashboard'); setSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
          <img src={logoBanner} alt="AgriMarket Logo" className="sidebar-logo-img" />
        </div>

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
          <li className="menu-item">
            <button 
              onClick={() => handleTabChange('chat')} 
              className={`menu-link ${activeTab === 'chat' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/chat.png" alt="" className="sidebar-link-img" />
              <span>Chat</span>
              {unreadChatCount > 0 && (
                <span className="chat-unread-badge" style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '50%', marginLeft: 'auto' }}>
                  {unreadChatCount}
                </span>
              )}
            </button>
          </li>
        </ul>

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
            <button 
              className="hamburger-toggle-menu" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
            <h2 className="topnav-title">
              {activeTab === 'dashboard' && 'Hello'}
              {activeTab === 'browse' && 'Browse Catalog'}
              {activeTab === 'cart' && 'My Cart'}
              {activeTab === 'orders' && 'Orders History'}
              {activeTab === 'wishlist' && 'My Saved Crops'}
              {activeTab === 'profile' && 'My Profile'}
              {activeTab === 'settings' && 'Account Settings'}
              {activeTab === 'chat' && 'Chat'}
            </h2>
            <p className="topnav-subtitle">
              {activeTab === 'dashboard' && `Support local farming by buying organic produce direct.`}
              {activeTab === 'browse' && 'Find and purchase fresh crops direct from farmer inventories.'}
              {activeTab === 'cart' && 'Review your crop choices and complete your order simulation.'}
              {activeTab === 'orders' && 'Track progress stages of all your active and fulfilled orders.'}
              {activeTab === 'wishlist' && 'View crops you saved to buy or inspect later.'}
              {activeTab === 'profile' && 'Configure personal details, contact address, and photo.'}
              {activeTab === 'settings' && 'Manage your notifications and visual dashboard themes.'}
              {activeTab === 'chat' && 'discuss crops, pricing and delivery directly with farmers.'}
            </p>
          </div>

          <div className="topnav-right">
            <NotificationBell />

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
                      navigate('?tab=profile');
                      setIsDropdownOpen(false);
                    }} 
                    className="dropdown-item"
                  >
                    My Profile
                  </button>
                  <button 
                    onClick={() => {
                      navigate('?tab=settings');
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

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%' }}
          >
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
                currentUser={user}
                onStartChat={handleStartChat}
              />
            )}

            {activeTab === 'cart' && (
              <Cart 
                cart={cart}
                handleUpdateCartQty={handleUpdateCartQty}
                handleRemoveFromCart={handleRemoveFromCart}
                handleCheckout={handleCheckout}
                profileData={profileData}
                onGoToOrders={() => handleTabChange('orders')}
              />
            )}

            {activeTab === 'orders' && (
              <Orders 
                orders={orders}
                handleCancelOrder={handleCancelOrder}
                onRefreshOrders={fetchProductsAndOrders}
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

            {activeTab === 'chat' && (
              <Chat 
                currentUser={user}
                initialPartner={selectedChatPartner}
              />
            )}
          </motion.div>
        </AnimatePresence>
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
