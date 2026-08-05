import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../components/Navbar/Navbar.css';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  IndianRupee, 
  Package, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  X, 
  MapPin, 
  TrendingUp, 
  LogOut,
  ChevronRight,
  TrendingDown,
  Activity,
  AlertTriangle,
  FileText,
  User,
  Bell,
  Truck,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './FarmerDashboard.css';
import Overview from './Overview/Overview';
import Products from './Products/Products';
import Orders from './Orders/Orders';
import Analytics from './Analytics/Analytics';
import Profile from './Profile/Profile';
import SettingsTab from './Settings/Settings';
import Marketplace from './Marketplace/Marketplace';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const [activeTab, setActiveTab] = useState('dashboard');

  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [profileData, setProfileData] = useState({
    firstName: 'Sk',
    lastName: 'Prasad',
    phone: '+91 98765 43210',
    email: user?.email || 'kavya20050203@gmail.com',
    sector: 'fruits',
    addressStreet: '12, Green Field Road, SK Farms',
    addressCity: 'Coimbatore',
    addressState: 'Tamil Nadu',
    addressPin: '641001',
    profilePhoto: null,
    role: user?.role || 'farmer'
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(document.body.classList.contains('dark-theme'));
  const [profileFormInputs, setProfileFormInputs] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    sector: 'fruits',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressPin: '',
    profilePhoto: null,
    differentAddress: false
  });

  useEffect(() => {
    const storageKey = `profile_${user?.email || 'kavya20050203@gmail.com'}`;
    const savedProfile = localStorage.getItem(storageKey);
    if (savedProfile) {
      try {
        setProfileData(JSON.parse(savedProfile));
        return;
      } catch (e) {
        console.error('Error parsing saved profile from localStorage:', e);
      }
    }

    const nameParts = (user?.fullName || 'Sk Prasad').split(' ');
    const fName = nameParts[0] || 'Sk';
    const lName = nameParts.slice(1).join(' ') || 'Prasad';
    setProfileData({
      firstName: fName,
      lastName: lName,
      phone: user?.phone || '+91 98765 43210',
      email: user?.email || 'kavya20050203@gmail.com',
      sector: 'fruits',
      addressStreet: '12, Green Field Road, SK Farms',
      addressCity: 'Coimbatore',
      addressState: 'Tamil Nadu',
      addressPin: '641001',
      profilePhoto: null,
      role: user?.role || 'farmer'
    });
  }, [user]);

  const handleUpdateProfileData = (updatedProfile) => {
    setProfileData(updatedProfile);
    const storageKey = `profile_${user?.email || 'kavya20050203@gmail.com'}`;
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
      sector: profileFormInputs.sector,
      addressStreet: profileFormInputs.addressStreet,
      addressCity: profileFormInputs.addressCity,
      addressState: profileFormInputs.addressState,
      addressPin: profileFormInputs.addressPin,
      profilePhoto: profileFormInputs.profilePhoto
    };

    handleUpdateProfileData(updatedProfile);
    setIsEditingProfile(false);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [marketSearchQuery, setMarketSearchQuery] = useState('');
  const [marketCategoryFilter, setMarketCategoryFilter] = useState('all');
  const [marketplaceCrops] = useState([
    {
      id: 101,
      name: 'Organic Red Potatoes',
      category: 'grains',
      price: 35,
      priceUnit: 'Kg',
      stock: 450,
      stockUnit: 'Kg',
      location: 'Green Valley Farm',
      farmer: 'Arjun Singh',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400',
      description: 'Grown organically without pesticides. High starch quality.'
    },
    {
      id: 102,
      name: 'Royal Delicious Apples',
      category: 'fruits',
      price: 130,
      priceUnit: 'Kg',
      stock: 120,
      stockUnit: 'Kg',
      location: 'Shimla Orchards',
      farmer: 'Ramesh Negi',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400',
      description: 'Crispy, sweet, and freshly harvested royal apples.'
    },
    {
      id: 103,
      name: 'Roma Tomatoes',
      category: 'fruits',
      price: 45,
      priceUnit: 'Kg',
      stock: 300,
      stockUnit: 'Kg',
      location: 'Sunfields Farm',
      farmer: 'Priya Sharma',
      image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400',
      description: 'Firm and pulpy, ideal for home kitchens and ketchup production.'
    },
    {
      id: 104,
      name: 'Pure Buffalo Ghee',
      category: 'dairy',
      price: 650,
      priceUnit: 'Litre',
      stock: 80,
      stockUnit: 'Litres',
      location: 'Krishna Dairy',
      farmer: 'Gopal Yadav',
      image: 'https://images.unsplash.com/photo-1635359739501-c80b2a8df80c?auto=format&fit=crop&q=80&w=400',
      description: 'Prepared using traditional Bilona method. 100% natural.'
    },
    {
      id: 105,
      name: 'Kashmiri Saffron (Kesar)',
      category: 'spices',
      price: 350,
      priceUnit: 'Gram',
      stock: 2,
      stockUnit: 'Kg',
      location: 'Pampore Fields',
      farmer: 'Bashir Ahmed',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
      description: 'Grade A+ original export quality saffron saffron threads.'
    }
  ]);

  const handleSimulatePurchase = (crop) => {
    alert(`Purchase Simulation:\nSuccessfully simulated purchase order for 10 ${crop.priceUnit} of ${crop.name} from ${crop.farmer} (${crop.location})!`);
    logActivity(`Simulated purchase of ${crop.name} from ${crop.farmer}`, 'success');
  };

  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingIndex, setEditingIndex] = useState(null);

  const [formInputs, setFormInputs] = useState({
    name: '',
    category: 'grains',
    priceVal: '',
    priceUnit: 'Kg',
    stockVal: '',
    stockUnit: 'Kg',
    description: '',
    location: '',
    image: ''
  });

  const [products, setProducts] = useState([
    {
      name: 'Nellore Sona Masuri Rice',
      category: 'grains',
      price: 65,
      priceUnit: 'Kg',
      stock: 2500,
      stockUnit: 'Kg',
      location: 'Krishna Delta Farm',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
      description: 'High quality grains harvested from delta region.',
      inStock: true
    },
    {
      name: 'Guntur Red Tomatoes',
      category: 'fruits',
      price: 35,
      priceUnit: 'Kg',
      stock: 400,
      stockUnit: 'Kg',
      location: 'Madanapalle Farms',
      image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&q=80&w=600',
      description: 'Fresh organic tomatoes directly sourced from fields.',
      inStock: true
    },
    {
      name: 'Guntur Red Chillies',
      category: 'spices',
      price: 180,
      priceUnit: 'Kg',
      stock: 1200,
      stockUnit: 'Kg',
      location: 'Andhra Spice Farms',
      image: 'https://images.unsplash.com/photo-1546860255-95536c19724e?w=600&auto=format&fit=crop&q=60',
      description: 'Sun dried hot chillies with strong flavor.',
      inStock: true
    },
    {
      name: 'Malabar Black Pepper',
      category: 'spices',
      price: 450,
      priceUnit: 'Kg',
      stock: 0,
      stockUnit: 'Kg',
      location: 'Malabar Hills Spices',
      image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=600',
      description: 'Premium organic black pepper seeds.',
      inStock: false
    }
  ]);

  const [orders, setOrders] = useState([
    {
      id: 'ORD-8742',
      buyer: 'Ramesh Kumar',
      phone: '+91 98765 43210',
      address: 'Plot 42, Green Avenue, Hyderabad, Telangana',
      productName: 'Nellore Sona Masuri Rice',
      quantity: 500,
      unit: 'Kg',
      amount: 32500,
      date: 'Aug 04, 2026',
      status: 'pending'
    },
    {
      id: 'ORD-8739',
      buyer: 'Suresh Raina',
      phone: '+91 98765 43211',
      address: 'Flat 102, Royal Gardens, Chennai, Tamil Nadu',
      productName: 'Guntur Red Tomatoes',
      quantity: 200,
      unit: 'Kg',
      amount: 7000,
      date: 'Aug 03, 2026',
      status: 'shipped'
    },
    {
      id: 'ORD-8735',
      buyer: 'Vijay Traders',
      phone: '+91 98765 43212',
      address: 'Guntur Spice Market Yard, Guntur, Andhra Pradesh',
      productName: 'Guntur Red Chillies',
      quantity: 100,
      unit: 'Kg',
      amount: 18000,
      date: 'Jul 31, 2026',
      status: 'delivered'
    }
  ]);

  const [activities, setActivities] = useState([
    { id: 1, text: 'Order ORD-8742 received from Ramesh Kumar', type: 'order', time: '10 minutes ago' },
    { id: 2, text: 'Listing Guntur Red Tomatoes stock updated to 400 Kg', type: 'inventory', time: '2 hours ago' },
    { id: 3, text: 'Order ORD-8735 was marked as delivered', type: 'success', time: '1 day ago' },
    { id: 4, text: 'Crop listing Malabar Black Pepper set to Out of Stock', type: 'warning', time: '1 day ago' }
  ]);

  const [stats, setStats] = useState({
    totalEarnings: 57500,
    activeListings: 4,
    completedOrders: 1,
    pendingShipment: 2
  });

  useEffect(() => {
    const totalEarnings = orders
      .filter(o => o.status === 'delivered' || o.status === 'shipped')
      .reduce((sum, current) => sum + current.amount, 18000); 

    const activeListings = products.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingShipment = orders.filter(o => o.status === 'pending' || o.status === 'shipped').length;

    setStats({
      totalEarnings,
      activeListings,
      completedOrders,
      pendingShipment
    });
  }, [products, orders]);

  const logActivity = (text, type = 'info') => {
    const newAct = {
      id: Date.now(),
      text,
      type,
      time: 'Just now'
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormInputs({
      name: '',
      category: 'grains',
      priceVal: '',
      priceUnit: 'Kg',
      stockVal: '',
      stockUnit: 'Kg',
      description: '',
      location: user?.fullName ? `${user.fullName} Farm` : 'My Farm',
      image: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (index) => {
    const prod = products[index];
    setModalMode('edit');
    setEditingIndex(index);
    setFormInputs({
      name: prod.name,
      category: prod.category,
      priceVal: prod.price,
      priceUnit: prod.priceUnit,
      stockVal: prod.stock,
      stockUnit: prod.stockUnit,
      description: prod.description || '',
      location: prod.location,
      image: prod.image
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please choose a smaller photo.');
        return;
      }

      const maxDim = 600;
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width || maxDim;
          let height = img.height || maxDim;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          setFormInputs(prev => ({
            ...prev,
            image: canvas.toDataURL('image/png')
          }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();

    if (!formInputs.name || !formInputs.priceVal || formInputs.stockVal === '') {
      alert('Please fill in name, price, and stock fields.');
      return;
    }

    const newProduct = {
      name: formInputs.name,
      category: formInputs.category,
      price: parseFloat(formInputs.priceVal),
      priceUnit: formInputs.priceUnit,
      stock: parseFloat(formInputs.stockVal),
      stockUnit: formInputs.stockUnit,
      location: formInputs.location || 'My Farm',
      image: formInputs.image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=600',
      description: formInputs.description,
      inStock: parseFloat(formInputs.stockVal) > 0
    };

    if (modalMode === 'add') {
      setProducts(prev => [...prev, newProduct]);
      logActivity(`New listing created: ${formInputs.name}`, 'inventory');
    } else {
      setProducts(prev => {
        const updated = [...prev];
        updated[editingIndex] = newProduct;
        return updated;
      });
      logActivity(`Listing updated: ${formInputs.name}`, 'inventory');
    }

    setIsModalOpen(false);
  };

  const handleDeleteProduct = (index) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      const deletedName = products[index].name;
      setProducts(prev => prev.filter((_, idx) => idx !== index));
      logActivity(`Listing removed: ${deletedName}`, 'warning');
    }
  };

  const handleToggleStock = (index) => {
    setProducts(prev => {
      const updated = [...prev];
      const prod = updated[index];
      prod.inStock = !prod.inStock;
      if (prod.inStock && prod.stock === 0) {
        prod.stock = 100;
      } else if (!prod.inStock) {
        prod.stock = 0;
      }
      logActivity(`${prod.name} availability toggled to ${prod.inStock ? 'In Stock' : 'Out of Stock'}`, 'inventory');
      return updated;
    });
  };

  const handleOrderShip = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
    logActivity(`Order ${orderId} marked as shipped`, 'success');
  };

  const handleOrderDeliver = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o));
    logActivity(`Order ${orderId} marked as delivered`, 'success');
  };

  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || prod.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(order => {
    if (orderStatusFilter === 'all') return true;
    return order.status === orderStatusFilter;
  });

  const filteredMarketCrops = marketplaceCrops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(marketSearchQuery.toLowerCase()) || 
                          crop.farmer.toLowerCase().includes(marketSearchQuery.toLowerCase()) ||
                          crop.location.toLowerCase().includes(marketSearchQuery.toLowerCase());
    const matchesCategory = marketCategoryFilter === 'all' || crop.category === marketCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const outOfStockProducts = products.filter(p => !p.inStock || p.stock === 0);

  const pendingOrdersList = orders.filter(o => o.status === 'pending');

  const warningProducts = [
    ...products.filter(p => !p.inStock || p.stock === 0).map(p => ({ ...p, statusText: 'Out of Stock' })),
    ...products.filter(p => p.inStock && p.stock > 0 && p.stock < 500).map(p => ({ ...p, statusText: `Only ${p.stock} ${p.stockUnit} remaining` }))
  ];

  return (
    <div className="farmer-dashboard-layout">

      <aside className="farmer-sidebar">
        <div>
          <a href="/" className="sidebar-logo">
            <span><span className="logo-leaf">Agri</span>Market</span>
          </a>

          <nav>
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
                  onClick={() => handleTabChange('products')} 
                  className={`menu-link ${activeTab === 'products' ? 'active' : ''}`}
                >
                  <Package size={20} />
                  <span>My Products</span>
                </button>
              </li>
              <li className="menu-item">
                <button 
                  onClick={() => handleTabChange('orders')} 
                  className={`menu-link ${activeTab === 'orders' ? 'active' : ''}`}
                >
                  <Truck size={20} />
                  <span>Orders</span>
                  {pendingOrdersList.length > 0 && (
                    <span className="menu-badge">{pendingOrdersList.length}</span>
                  )}
                </button>
              </li>
              <li className="menu-item">
                <button 
                  onClick={() => handleTabChange('analytics')} 
                  className={`menu-link ${activeTab === 'analytics' ? 'active' : ''}`}
                >
                  <Activity size={20} />
                  <span>Sales Summary</span>
                </button>
              </li>
              <li className="menu-item">
                <button 
                  onClick={() => handleTabChange('settings')} 
                  className={`menu-link ${activeTab === 'settings' ? 'active' : ''}`}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main className="farmer-dashboard-main">

        <div className="dashboard-topnav">
          <div className="topnav-left">
            <h2 className="topnav-title">
              {activeTab === 'dashboard' && "Farmer's Dashboard"}
              {activeTab === 'products' && 'Crop Inventory'}
              {activeTab === 'orders' && 'Orders Console'}
              {activeTab === 'analytics' && 'Financial Growth Report'}
              {activeTab === 'profile' && 'Farmer Profile'}
              {activeTab === 'marketplace' && 'Crop Marketplace Catalog'}
              {activeTab === 'settings' && 'Account Settings'}
            </h2>
            <p className="topnav-subtitle">
              {activeTab === 'dashboard' && `Dashboard Overview • Welcome back, ${profileData.firstName} ${profileData.lastName} • Store status: ${isStoreOpen ? 'Open' : 'Closed'}`}
              {activeTab === 'products' && `Manage crop listings, update stock levels, and set prices.`}
              {activeTab === 'orders' && `Track customer purchases, pending shipments, and deliveries.`}
              {activeTab === 'analytics' && `View financial summaries, crop sales distributions, and growth curves.`}
              {activeTab === 'profile' && `Configure personal details, contact address, and farm sector.`}
              {activeTab === 'marketplace' && `Browse agricultural listings from other farmers and simulate orders.`}
              {activeTab === 'settings' && `Configure application theme, notifications preferences, and store operational status.`}
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
                  {profileData.firstName ? profileData.firstName : 'User'}
                </span>
                <span className={`navbar-role-tag ${profileData.role}`}>{profileData.role}</span>
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
                      handleTabChange('marketplace');
                      setIsDropdownOpen(false);
                    }} 
                    className="dropdown-item"
                  >
                    Go to Marketplace
                  </button>

                  <button 
                    onClick={() => {
                      handleTabChange('profile');
                      setIsDropdownOpen(false);
                    }} 
                    className="dropdown-item"
                  >
                    My Profile
                  </button>

                  <div className="dropdown-divider"></div>
                  <button 
                    onClick={() => {
                      handleLogoutClick();
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
        </div>

        {activeTab === 'dashboard' && (
          <Overview 
            stats={stats} 
            orders={orders} 
            products={products} 
            handleTabChange={handleTabChange} 
            warningProducts={warningProducts} 
          />
        )}

        {activeTab === 'products' && (
          <Products 
            handleOpenAddModal={handleOpenAddModal} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            categoryFilter={categoryFilter} 
            setCategoryFilter={setCategoryFilter} 
            filteredProducts={filteredProducts} 
            products={products} 
            handleToggleStock={handleToggleStock} 
            handleOpenEditModal={handleOpenEditModal} 
            handleDeleteProduct={handleDeleteProduct} 
          />
        )}

        {activeTab === 'orders' && (
          <Orders 
            orders={orders} 
            orderStatusFilter={orderStatusFilter} 
            setOrderStatusFilter={setOrderStatusFilter} 
            filteredOrders={filteredOrders} 
            handleOrderShip={handleOrderShip} 
            handleOrderDeliver={handleOrderDeliver} 
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics />
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
            isStoreOpen={isStoreOpen} 
            setIsStoreOpen={setIsStoreOpen} 
            emailNotifications={emailNotifications} 
            setEmailNotifications={setEmailNotifications} 
            smsNotifications={smsNotifications} 
            setSmsNotifications={setSmsNotifications} 
            isDarkTheme={isDarkTheme} 
            setIsDarkTheme={setIsDarkTheme} 
            logActivity={logActivity} 
          />
        )}

        {activeTab === 'marketplace' && (
          <Marketplace 
            marketSearchQuery={marketSearchQuery} 
            setMarketSearchQuery={setMarketSearchQuery} 
            marketCategoryFilter={marketCategoryFilter} 
            setMarketCategoryFilter={setMarketCategoryFilter} 
            filteredMarketCrops={filteredMarketCrops} 
            handleSimulatePurchase={handleSimulatePurchase} 
          />
        )}
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <div className="modal-header-section">
              <h3>{modalMode === 'add' ? 'Add New Product Listing' : 'Edit Product Details'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="modal-form-body">
                <div className="form-grid-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="m-name">Product Name</label>
                    <input 
                      type="text" 
                      id="m-name"
                      name="name" 
                      className="form-input" 
                      placeholder="e.g. Premium Basmati Rice" 
                      value={formInputs.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-row form-grid-row-2col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="m-category">Category</label>
                    <select 
                      id="m-category"
                      name="category" 
                      className="form-input"
                      value={formInputs.category}
                      onChange={handleInputChange}
                    >
                      <option value="grains">Grains</option>
                      <option value="fruits">Fruits & Vegetables</option>
                      <option value="dairy">Dairy Products</option>
                      <option value="spices">Spices</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="m-location">Farm/Location</label>
                    <input 
                      type="text" 
                      id="m-location"
                      name="location" 
                      className="form-input" 
                      placeholder="e.g. Krishna Delta Farm" 
                      value={formInputs.location}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-grid-row form-grid-row-2col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="m-price">Price (₹)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        id="m-price"
                        name="priceVal" 
                        className="form-input" 
                        placeholder="Price" 
                        value={formInputs.priceVal}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                      <select 
                        name="priceUnit" 
                        className="form-input" 
                        style={{ width: '100px' }}
                        value={formInputs.priceUnit}
                        onChange={handleInputChange}
                      >
                        <option value="Kg">Kg</option>
                        <option value="Litre">Litre</option>
                        <option value="Bunch">Bunch</option>
                        <option value="Gram">Gram</option>
                        <option value="Quintal">Quintal</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="m-stock">Stock Quantity</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        id="m-stock"
                        name="stockVal" 
                        className="form-input" 
                        placeholder="Stock" 
                        value={formInputs.stockVal}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                      <select 
                        name="stockUnit" 
                        className="form-input" 
                        style={{ width: '100px' }}
                        value={formInputs.stockUnit}
                        onChange={handleInputChange}
                      >
                        <option value="Kg">Kg</option>
                        <option value="Litres">Litres</option>
                        <option value="Bunches">Bunches</option>
                        <option value="Grams">Grams</option>
                        <option value="Quintals">Quintals</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-grid-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="m-image">Product Image (Photo)</label>
                    <input 
                      type="file" 
                      id="m-image"
                      accept="image/*"
                      className="form-input" 
                      onChange={handleImageUpload}
                    />
                    {formInputs.image && (
                      <div className="product-image-preview-container" style={{ marginTop: '0.75rem', position: 'relative' }}>
                        <img 
                          src={formInputs.image} 
                          alt="Crop preview" 
                          style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(82, 183, 136, 0.2)' }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setFormInputs(prev => ({ ...prev, image: '' }))}
                          style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justify: 'center', cursor: 'pointer' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="m-description">Description</label>
                    <textarea 
                      id="m-description"
                      name="description" 
                      className="form-input" 
                      placeholder="Provide quality parameters, packaging style, etc." 
                      rows="3"
                      value={formInputs.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-form-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-modal-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
