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
  Settings,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import { useLocation } from 'react-router-dom';
import logoBanner from '../../assets/logo-banner.png';
import Overview from './Overview/Overview';
import Products from './Products/Products';
import Orders from './Orders/Orders';
import Analytics from './Analytics/Analytics';
import Profile from './Profile/Profile';
import SettingsTab from './Settings/Settings';
import FarmerCoupons from './Coupons/FarmerCoupons';
import Marketplace from './Marketplace/Marketplace';
import AddProduct from './AddProduct/AddProduct';
import FarmerReviews from './Reviews/FarmerReviews';
import Chat from '../../components/Chat/Chat';

export default function FarmerDashboard() {
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

  // Sync tab with navigation state/query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') || location.state?.activeTab;
    setActiveTab(tabParam || 'dashboard');
  }, [location]);

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
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('http://localhost:5000/api/users/profile/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            const nameParts = (userData.fullName || '').split(' ');
            const fName = nameParts[0] || '';
            const lName = nameParts.slice(1).join(' ') || '';
            setProfileData({
              firstName: fName,
              lastName: lName,
              phone: userData.phone || '',
              email: userData.email || '',
              bio: userData.bio || '',
              farmName: userData.farmName || '',
              experience: userData.experience || '',
              addressStreet: userData.addressStreet || '',
              addressCity: userData.addressCity || '',
              addressState: userData.addressState || '',
              addressPin: userData.addressPin || '',
              profilePhoto: userData.profilePhoto || null,
              sector: userData.sector || 'fruits',
              role: userData.role || 'farmer',
              isTwoFactorEnabled: userData.isTwoFactorEnabled || false
            });
            return;
          }
        } catch (err) {
          console.error('Error fetching profile from backend:', err);
        }
      }
      
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
        farmName: '',
        experience: '',
        bio: '',
        addressStreet: '12, Green Field Road, SK Farms',
        addressCity: 'Coimbatore',
        addressState: 'Tamil Nadu',
        addressPin: '641001',
        profilePhoto: null,
        role: user?.role || 'farmer'
      });
    };

    fetchProfile();
  }, [user]);

  const handleUpdateProfileData = async (updatedProfile) => {
    setProfileData(updatedProfile);
    const storageKey = `profile_${user?.email || 'kavya20050203@gmail.com'}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
    
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
            bio: updatedProfile.bio || '',
            farmName: updatedProfile.farmName || '',
            experience: updatedProfile.experience || '',
            addressStreet: updatedProfile.addressStreet || '',
            addressCity: updatedProfile.addressCity || '',
            addressState: updatedProfile.addressState || '',
            addressPin: updatedProfile.addressPin || '',
            profilePhoto: updatedProfile.profilePhoto || null,
            sector: updatedProfile.sector || 'fruits'
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
      sector: profileFormInputs.sector,
      addressStreet: profileFormInputs.addressStreet,
      addressCity: profileFormInputs.addressCity,
      addressState: profileFormInputs.addressState,
      addressPin: profileFormInputs.addressPin,
      profilePhoto: profileFormInputs.profilePhoto,
      farmName: profileFormInputs.farmName,
      experience: profileFormInputs.experience,
      bio: profileFormInputs.bio
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

  // Initialize products list state as empty.
  const [products, setProducts] = useState([]);

  // Initialize received orders list state as empty.
  const [orders, setOrders] = useState([]);

  // state for storing unread chat messages count
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Initialize activities log state.
  const [activities, setActivities] = useState([
    { id: 2, text: 'Listing Guntur Red Tomatoes stock updated to 400 Kg', type: 'inventory', time: '2 hours ago' },
    { id: 3, text: 'Order ORD-8735 was marked as delivered', type: 'success', time: '1 day ago' },
    { id: 4, text: 'Crop listing Malabar Black Pepper set to Out of Stock', type: 'warning', time: '1 day ago' }
  ]);

  // Initialize dashboard summary stats.
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeListings: 0,
    completedOrders: 0,
    pendingShipment: 0
  });

  // Fetch crop listings and received orders from the backend API.
  const fetchProductsAndOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { 'Authorization': `Bearer ${token}` };

      const productsRes = await fetch('http://localhost:5000/api/products/my-inventory', { headers });
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      const ordersRes = await fetch('http://localhost:5000/api/orders/farmer', { headers });
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
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger API data fetch when user is loaded.
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

  // Update stats dynamically when products or orders change.
  useEffect(() => {
    const totalEarnings = orders
      .filter(o => o.status === 'delivered' || o.status === 'shipped')
      .reduce((sum, current) => sum + current.amount, 0);

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
    navigate(`?tab=${tabName}`);
    setSidebarOpen(false);
    fetchProductsAndOrders();
    if (tabName === 'chat') {
      setUnreadChatCount(0);
    }
  };

  // Set inputs to empty and navigate to add product page.
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
    navigate('?tab=add-product');
    setSidebarOpen(false);
  };

  // Set inputs to product details and navigate to edit product page.
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
    navigate('?tab=add-product');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle crop image upload preview for PNG and JPG format.
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Allow only PNG and JPG image uploads.
      if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        alert('Please upload a PNG or JPG format photo only.');
        return;
      }
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
            // Convert canvas image to data URL of original file type.
            image: canvas.toDataURL(file.type)
          }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Add or update a product listing via the backend API.
  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!formInputs.name || !formInputs.priceVal || formInputs.stockVal === '') {
      alert('Please fill in name, price, and stock fields.');
      return;
    }

    const payload = {
      name: formInputs.name,
      category: formInputs.category,
      price: parseFloat(formInputs.priceVal),
      priceUnit: formInputs.priceUnit,
      stock: parseFloat(formInputs.stockVal),
      stockUnit: formInputs.stockUnit,
      location: formInputs.location || 'My Farm',
      image: formInputs.image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=600&fm=png',
      description: formInputs.description
    };

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      let res;
      if (modalMode === 'add') {
        res = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        const prodId = products[editingIndex]._id;
        res = await fetch(`http://localhost:5000/api/products/${prodId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        logActivity(
          modalMode === 'add'
            ? `New listing created: ${formInputs.name}`
            : `Listing updated: ${formInputs.name}`,
          'inventory'
        );
        fetchProductsAndOrders();
        // Navigate back to the products list page.
        navigate('?tab=products');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to save product: ${errData.message || 'Server error (' + res.status + ')'}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while connecting to the server. Please try again.');
    }
  };

  // Delete a product listing via the backend API.
  const handleDeleteProduct = async (index) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      const deletedName = products[index].name;
      const prodId = products[index]._id;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/products/${prodId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchProductsAndOrders();
          logActivity(`Listing removed: ${deletedName}`, 'warning');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Toggle crop availability in stock via the backend API.
  const handleToggleStock = async (index) => {
    const prodId = products[index]._id;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/${prodId}/toggle-stock`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProductsAndOrders();
        logActivity(`${products[index].name} availability status toggled`, 'inventory');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark a pending order as shipped via the backend API.
  const handleOrderShip = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'shipped' })
      });
      if (res.ok) {
        fetchProductsAndOrders();
        logActivity(`Order ${orderId} marked as shipped`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark a shipped order as out for delivery via the backend API.
  const handleOrderOutForDelivery = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Out for Delivery' })
      });
      if (res.ok) {
        fetchProductsAndOrders();
        logActivity(`Order ${orderId} marked as out for delivery`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark a shipped order as delivered via the backend API.
  const handleOrderDeliver = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'delivered' })
      });
      if (res.ok) {
        fetchProductsAndOrders();
        logActivity(`Order ${orderId} marked as delivered`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter products list based on search term and category.
  const filteredProducts = products.filter(prod => {
    const nameText = prod.name || prod.title || '';
    const locationText = prod.location || '';
    const catText = (prod.category || '').toLowerCase();

    const matchesSearch = nameText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locationText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || catText === categoryFilter.toLowerCase();
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
            <span className="sidebar-user-role">Farmer Dashboard</span>
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
              onClick={() => handleTabChange('products')}
              className={`menu-link ${activeTab === 'products' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/shopping-bag.png" alt="" className="sidebar-link-img" />
              <span>My Products</span>
            </button>
          </li>
          <li className="menu-item">
            <button
              onClick={() => handleOpenAddModal()}
              className={`menu-link ${activeTab === 'add-product' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/sprout.png" alt="" className="sidebar-link-img" />
              <span>Add Product</span>
            </button>
          </li>
          <li className="menu-item">
            <button
              onClick={() => handleTabChange('orders')}
              className={`menu-link ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/delivery.png" alt="" className="sidebar-link-img" />
              <span>Orders</span>
              {pendingOrdersList.length > 0 && (
                <span className="menu-badge-red">{pendingOrdersList.length}</span>
              )}
            </button>
          </li>
          <li className="menu-item">
            <button
              onClick={() => handleTabChange('analytics')}
              className={`menu-link ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/handshake.png" alt="" className="sidebar-link-img" />
              <span>Sales Summary</span>
            </button>
          </li>
          <li className="menu-item">
            <button
              onClick={() => handleTabChange('reviews')}
              className={`menu-link ${activeTab === 'reviews' ? 'active' : ''}`}
            >
              <img 
                src="/src/assets/icons/star.png" 
                alt="" 
                className="sidebar-link-img" 
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  filter: activeTab === 'reviews' ? 'none' : 'grayscale(100%) brightness(1.5)', 
                  opacity: activeTab === 'reviews' ? 1 : 0.6 
                }} 
              />
              <span>Reviews & Ratings</span>
            </button>
          </li>
          <li className="menu-item">
            <button
              onClick={() => handleTabChange('coupons')}
              className={`menu-link ${activeTab === 'coupons' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/rupee.png" alt="" className="sidebar-link-img" />
              <span>My Coupons</span>
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
          <li className="menu-item">
            <button
              onClick={() => handleTabChange('settings')}
              className={`menu-link ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <img src="/src/assets/icons/shield.png" alt="" className="sidebar-link-img" />
              <span>Settings</span>
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
                handleLogoutClick();
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

        <div className="dashboard-topnav">
          <div className="topnav-left">
            <button 
              className="hamburger-toggle-menu" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
             <h2 className="topnav-title">
              {activeTab === 'dashboard' && "Farmer's Dashboard"}
              {activeTab === 'products' && 'Crop Inventory'}
              {activeTab === 'orders' && 'Orders Console'}
              {activeTab === 'analytics' && 'Financial Growth Report'}
              {activeTab === 'profile' && 'Farmer Profile'}
              {activeTab === 'marketplace' && 'Crop Marketplace Catalog'}
              {activeTab === 'settings' && 'Account Settings'}
              {activeTab === 'coupons' && 'My Coupons'}
              {activeTab === 'chat' && 'Chat'}
            </h2>
            <p className="topnav-subtitle">
              {activeTab === 'dashboard' && `Dashboard Overview • Welcome back, ${profileData.firstName} ${profileData.lastName} • Store status: ${isStoreOpen ? 'Open' : 'Closed'}`}
              {activeTab === 'products' && `Manage crop listings, update stock levels, and set prices.`}
              {activeTab === 'orders' && `Track customer purchases, pending shipments, and deliveries.`}
              {activeTab === 'analytics' && `View financial summaries, crop sales distributions, and growth curves.`}
              {activeTab === 'profile' && `Configure personal details, contact address, and farm sector.`}
              {activeTab === 'marketplace' && `Browse agricultural listings from other farmers and simulate orders.`}
              {activeTab === 'settings' && `Configure application theme, notifications preferences, and store operational status.`}
              {activeTab === 'coupons' && `Create discounts for your own crops, configure minimum orders, and view usage performance.`}
              {activeTab === 'chat' && `Discuss orders, pricing and details directly with buyers.`}
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
            handleOrderOutForDelivery={handleOrderOutForDelivery}
            handleOrderDeliver={handleOrderDeliver}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics orders={orders} products={products} />
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

        {activeTab === 'reviews' && (
          <FarmerReviews email={profileData.email} />
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

        {activeTab === 'coupons' && (
          <FarmerCoupons />
        )}

        {activeTab === 'chat' && (
          <Chat currentUser={user} />
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

        {activeTab === 'add-product' && (
          <AddProduct
            formInputs={formInputs}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            handleSaveProduct={handleSaveProduct}
            setFormInputs={setFormInputs}
            mode={modalMode}
            onCancel={() => handleTabChange('products')}
          />
        )}
      </main>

    </div>
  );
}
