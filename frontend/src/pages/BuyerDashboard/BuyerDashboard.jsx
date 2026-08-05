import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('global_products');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const defaultCrops = [
      {
        id: 'crop-1',
        name: 'Organic Potatoes',
        category: 'grains',
        price: 45,
        priceUnit: 'Kg',
        stock: 450,
        stockUnit: 'Kg',
        location: 'Pune, Maharashtra',
        farmer: 'Vikas Patil',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400',
        description: 'Freshly harvested organic yellow potatoes. Hand-picked, nutrient-rich, and free from synthetic pesticides.'
      },
      {
        id: 'crop-2',
        name: 'Royal Delicious Apples',
        category: 'fruits',
        price: 130,
        priceUnit: 'Kg',
        stock: 120,
        stockUnit: 'Kg',
        location: 'Shimla Orchards',
        farmer: 'Ramesh Negi',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400',
        description: 'Crispy, sweet, and freshly harvested royal apples.'
      },
      {
        id: 'crop-3',
        name: 'Roma Tomatoes',
        category: 'fruits',
        price: 45,
        priceUnit: 'Kg',
        stock: 300,
        stockUnit: 'Kg',
        location: 'Sunfields Farm',
        farmer: 'Priya Sharma',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400',
        description: 'Firm and pulpy, ideal for home kitchens and ketchup production.'
      },
      {
        id: 'crop-4',
        name: 'Pure Buffalo Ghee',
        category: 'dairy',
        price: 650,
        priceUnit: 'Litre',
        stock: 80,
        stockUnit: 'Litres',
        location: 'Krishna Dairy',
        farmer: 'Gopal Yadav',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1635359739501-c80b2a8df80c?auto=format&fit=crop&q=80&w=400',
        description: 'Prepared using traditional Bilona method. 100% natural.'
      },
      {
        id: 'crop-5',
        name: 'Kashmiri Saffron (Kesar)',
        category: 'spices',
        price: 350,
        priceUnit: 'Gram',
        stock: 2,
        stockUnit: 'Kg',
        location: 'Pampore Fields',
        farmer: 'Bashir Ahmed',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
        description: 'Grade A+ original export quality saffron saffron threads.'
      },
      {
        id: 'crop-6',
        name: 'Basmati Rice',
        category: 'grains',
        price: 90,
        priceUnit: 'Kg',
        stock: 500,
        stockUnit: 'Kg',
        farmer: 'Rajesh Patil',
        location: 'Nagpur, Maharashtra',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
        description: 'Aromatic, long-grain premium Basmati rice, aged to perfection.'
      }
    ];
    localStorage.setItem('global_products', JSON.stringify(defaultCrops));
    return defaultCrops;
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(`cart_${user?.email || 'buyer'}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem(`wishlist_${user?.email || 'buyer'}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem(`buyer_orders_${user?.email || 'buyer'}`);
    return saved ? JSON.parse(saved) : [];
  });

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

  const handleCheckout = (address, phone, amount) => {
    const newOrders = cart.map(item => ({
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: item.name,
      quantity: item.quantity,
      unit: item.priceUnit,
      farmer: item.farmer || 'Local Farmer',
      amount: item.price * item.quantity,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'pending'
    }));

    const updatedOrders = [...newOrders, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(`buyer_orders_${user?.email || 'buyer'}`, JSON.stringify(updatedOrders));

    setCart([]);
    localStorage.removeItem(`cart_${user?.email || 'buyer'}`);

    alert('Checkout Successful!\nYour simulated order has been placed successfully and is pending shipment.');
    logActivity(`Placed order transaction for ${newOrders.length} crop items`, 'success');
  };

  const handleCancelOrder = (id) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const updated = orders.map(o => 
        o.id === id ? { ...o, status: 'cancelled' } : o
      );
      setOrders(updated);
      localStorage.setItem(`buyer_orders_${user?.email || 'buyer'}`, JSON.stringify(updated));
      logActivity(`Cancelled order transaction ${id}`, 'warning');
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
        <div>
          <a href="#" className="sidebar-logo">
            <Leaf className="logo-leaf" size={24} />
            <span>AgriMarket</span>
          </a>

          <ul className="sidebar-menu">
            <li className="menu-item">
              <button 
                onClick={() => handleTabChange('dashboard')} 
                className={`menu-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={20} />
                <span>Overview</span>
              </button>
            </li>
            <li className="menu-item">
              <button 
                onClick={() => handleTabChange('browse')} 
                className={`menu-link ${activeTab === 'browse' ? 'active' : ''}`}
              >
                <Search size={20} />
                <span>Browse Crops</span>
              </button>
            </li>
            <li className="menu-item">
              <button 
                onClick={() => handleTabChange('cart')} 
                className={`menu-link ${activeTab === 'cart' ? 'active' : ''}`}
              >
                <ShoppingCart size={20} />
                <span>Cart Summary</span>
              </button>
            </li>
            <li className="menu-item">
              <button 
                onClick={() => handleTabChange('orders')} 
                className={`menu-link ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <ShoppingBag size={20} />
                <span>Placed Orders</span>
              </button>
            </li>
            <li className="menu-item">
              <button 
                onClick={() => handleTabChange('wishlist')} 
                className={`menu-link ${activeTab === 'wishlist' ? 'active' : ''}`}
              >
                <Heart size={20} />
                <span>Saved Crops</span>
              </button>
            </li>
          </ul>
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
                  <button 
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }} 
                    className="dropdown-item logout-btn"
                  >
                    Log Out
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
