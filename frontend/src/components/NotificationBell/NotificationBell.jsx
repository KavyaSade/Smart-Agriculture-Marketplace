import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  Check, 
  Info, 
  ShoppingBag, 
  AlertTriangle, 
  AlertCircle, 
  User, 
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { messaging } from '../../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import './NotificationBell.css';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const dropdownRef = useRef(null);
  const registrationStarted = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Sync token to backend
  const registerToken = async (fcmToken) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch('http://localhost:5000/api/users/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: fcmToken })
      });
    } catch (err) {
      console.error('Error registering FCM token:', err);
    }
  };

  // Request notification permissions and register service worker
  const setupNotifications = async () => {
    if (!messaging || registrationStarted.current) return;
    registrationStarted.current = true;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const fcmToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BFsB2zG3d3C6c-vH-w72P-347t_DummyVapidKeyValueHere',
          serviceWorkerRegistration: registration
        });
        if (fcmToken) {
          await registerToken(fcmToken);
        }
      }
    } catch (err) {
      console.warn('FCM registration failed:', err);
    }
  };

  useEffect(() => {
    if (user) {
      setupNotifications();
      fetchNotifications();

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchNotifications();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // poll notifications every 10 seconds for real time dashboard update when tab is active
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchNotifications();
        }
      }, 10000);

      // Listen for foreground FCM pushes
      let unsubscribe = null;
      if (messaging) {
        unsubscribe = onMessage(messaging, (payload) => {
          console.log('Foreground push received:', payload);
          
          const newToast = {
            id: Date.now(),
            title: payload.notification?.title || 'Marketplace Alert',
            body: payload.notification?.body || '',
            data: payload.data || {}
          };
          setToasts((prev) => [newToast, ...prev]);

          // Show native desktop notification only if the app is in the background (tab not active)
          if (Notification.permission === 'granted' && document.visibilityState !== 'visible') {
            try {
              const notification = new Notification(payload.notification?.title || 'AgriMarket', {
                body: payload.notification?.body || '',
                icon: '/favicon.png',
                tag: payload.data?.type || 'agrimarket',
                data: payload.data || {}
              });

              notification.onclick = () => {
                window.focus();
                notification.close();

                const data = payload.data || {};
                const refId = data.referenceId || data.senderId;
                const refType = data.referenceType;
                const type = data.type;
                const role = user?.role;

                if (refType === 'Order' && refId) {
                  if (role === 'buyer') {
                    navigate(`/buyer-dashboard?tab=orders&id=${refId}`);
                  } else if (role === 'farmer' || role === 'retailer') {
                    navigate(`/farmer-dashboard?tab=orders&id=${refId}`);
                  }
                } else if (refType === 'Product') {
                  if (role === 'farmer' || role === 'retailer') {
                    if (type === 'new_product_review') {
                      navigate(`/farmer-dashboard?tab=reviews`);
                    } else {
                      navigate(`/farmer-dashboard?tab=products`);
                    }
                  } else if (role === 'admin') {
                    navigate(`/admin-dashboard?tab=products`);
                  }
                } else if (refType === 'User') {
                  if (type === 'new_chat_message' && refId) {
                    if (role === 'buyer') {
                      navigate(`/buyer-dashboard?tab=chat&partnerId=${refId}`);
                    } else if (role === 'farmer' || role === 'retailer') {
                      navigate(`/farmer-dashboard?tab=chat&partnerId=${refId}`);
                    }
                  } else {
                    if (role === 'admin') {
                      navigate(`/admin-dashboard?tab=users`);
                    } else if (role === 'buyer') {
                      navigate(`/buyer-dashboard?tab=profile`);
                    } else if (role === 'farmer' || role === 'retailer') {
                      navigate(`/farmer-dashboard?tab=profile`);
                    }
                  }
                }
              };
            } catch (err) {
              console.warn('Failed to display native notification:', err);
            }
          }

          fetchNotifications();

          // Auto-remove toast after 10 seconds
          setTimeout(() => {
            setToasts((prev) => prev.filter(t => t.id !== newToast.id));
          }, 10000);
        });
      }

      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (unsubscribe) unsubscribe();
      };
    }
  }, [user]);

  // Mark a single notification as read
  const markAsRead = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete a notification
  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete all notifications
  const clearAllNotifications = async () => {
    if (!window.confirm('Delete all notification history?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Click handler to route user to correct tabs based on notification event context
  const handleNotificationClick = async (notif) => {
    // 1. Mark as read
    if (!notif.isRead) {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`http://localhost:5000/api/notifications/${notif._id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    }

    setIsOpen(false);
    fetchNotifications();

    // 2. Click-to-navigate
    const refId = notif.referenceId;
    const refType = notif.referenceType;
    const type = notif.type;
    const role = user?.role;

    if (refType === 'Order') {
      if (role === 'buyer') {
        navigate('/buyer-dashboard', { state: { activeTab: 'orders', highlightOrderId: refId } });
      } else if (role === 'farmer' || role === 'retailer') {
        navigate('/farmer-dashboard', { state: { activeTab: 'orders', highlightOrderId: refId } });
      }
    } else if (refType === 'Product') {
      if (role === 'farmer' || role === 'retailer') {
        if (type === 'new_product_review') {
          navigate('/farmer-dashboard', { state: { activeTab: 'reviews' } });
        } else {
          navigate('/farmer-dashboard', { state: { activeTab: 'products' } });
        }
      } else if (role === 'admin') {
        navigate('/admin-dashboard', { state: { activeTab: 'products' } });
      }
    } else if (refType === 'User') {
      if (type === 'new_chat_message') {
        // redirect to chat tab in dashboards with partnerId
        if (role === 'buyer') {
          navigate(`/buyer-dashboard?tab=chat&partnerId=${refId}`);
        } else if (role === 'farmer' || role === 'retailer') {
          navigate(`/farmer-dashboard?tab=chat&partnerId=${refId}`);
        }
      } else {
        if (role === 'admin') {
          navigate('/admin-dashboard', { state: { activeTab: 'users' } });
        } else if (role === 'buyer') {
          navigate('/buyer-dashboard?tab=profile');
        } else if (role === 'farmer' || role === 'retailer') {
          navigate('/farmer-dashboard?tab=profile');
        }
      }
    }
  };

  // Render notification category icon
  const renderNotifIcon = (type) => {
    switch (type) {
      case 'order_received':
      case 'order_placed':
      case 'order_accepted':
      case 'order_shipped':
      case 'order_out_for_delivery':
      case 'order_delivered':
        return <ShoppingBag className="notif-type-icon icon-order" size={16} />;
      case 'low_stock':
        return <AlertTriangle className="notif-type-icon icon-stock" size={16} />;
      case 'new_product_review':
        return <FileText className="notif-type-icon icon-review" size={16} />;
      case 'new_user_registered':
      case 'welcome':
      case 'welcome_back':
        return <User className="notif-type-icon icon-user" size={16} />;
      case 'payment_success':
        return <CheckCircle className="notif-type-icon icon-success" size={16} />;
      case 'payment_failed':
        return <AlertCircle className="notif-type-icon icon-failure" size={16} />;
      default:
        return <Info className="notif-type-icon icon-default" size={16} />;
    }
  };

  // Helper custom icon mapping for checkcircle
  const CheckCircle = (props) => <Check {...props} className={props.className + " border-2 border-emerald-500 rounded-full p-0.5"} style={{ color: '#10b981' }} />;

  // Render formatted time ago string
  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="notif-bell-wrapper" ref={dropdownRef}>
     
      <button 
        className="notif-bell-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications dropdown"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-bell-badge animate-pulse">{unreadCount}</span>
        )}
      </button>

      
      {isOpen && (
        <div className="notif-dropdown-card">
          <div className="notif-dropdown-header">
            <h3>Notifications</h3>
            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} title="Mark all as read" className="btn-notif-header">
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAllNotifications} title="Clear history" className="btn-notif-header text-red-500">
                  <Trash2 size={14} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          <div className="notif-dropdown-body">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <Bell className="mx-auto text-slate-300 mb-2" size={32} />
                <p>No notifications yet</p>
                <span>We'll let you know when action is required.</span>
              </div>
            ) : (
              <div className="notif-list">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notif-icon-col">
                      {renderNotifIcon(notif.type)}
                    </div>
                    <div className="notif-content-col">
                      <div className="notif-item-header">
                        <h4>{notif.title}</h4>
                        <span className="notif-time">{formatTimeAgo(notif.createdAt)}</span>
                      </div>
                      <p className="notif-message">{notif.message}</p>
                    </div>
                    <div className="notif-actions-col">
                      {!notif.isRead && (
                        <button 
                          onClick={(e) => markAsRead(e, notif._id)} 
                          title="Mark as read"
                          className="btn-notif-item-action mark-read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button 
                        onClick={(e) => deleteNotification(e, notif._id)} 
                        title="Delete notification"
                        className="btn-notif-item-action delete-notif"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-app foreground notification Toast list using React Portal */}
      {createPortal(
        <div className="notif-toast-container">
          {toasts.map((toast) => (
            <div 
              key={toast.id} 
              className="notif-toast-card animate-bounce-in"
              onClick={() => {
                handleNotificationClick(toast);
                setToasts((prev) => prev.filter(t => t.id !== toast.id));
              }}
            >
              <div className="notif-toast-icon">
                {renderNotifIcon(toast.data?.type || '')}
              </div>
              <div className="notif-toast-body">
                <h5>{toast.title}</h5>
                <p>{toast.body}</p>
                <span className="toast-click-prompt">Click to view details</span>
              </div>
              <button 
                className="notif-toast-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setToasts((prev) => prev.filter(t => t.id !== toast.id));
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
