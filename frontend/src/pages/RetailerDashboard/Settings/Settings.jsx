import React from 'react';
import './Settings.css';

export default function Settings({ settings, setSettings, setAlert }) {
  // save store settings changes
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setAlert({ type: 'success', text: 'Store settings saved!' });
  };

  return (
    <div className="settings-view dashboard-card">
      <form onSubmit={handleSettingsSubmit}>
        
        <div className="settings-section-card">
          <h4 className="text-dark">Storefront Settings</h4>
          <div className="settings-toggle-row">
            <div className="toggle-details">
              <span className="toggle-title text-dark">Open for Orders</span>
              <span className="toggle-desc text-muted">Let buyers see and buy your products online.</span>
            </div>
            <label className="switch-label-wrapper">
              <input
                type="checkbox"
                className="switch-input"
                checked={settings.shopOpen}
                onChange={(e) => setSettings({ ...settings, shopOpen: e.target.checked })}
              />
              <span className="switch-slider-round"></span>
            </label>
          </div>

          <div className="form-group mt-4 max-w-xs">
            <label className="form-label text-dark">Base Delivery Charge (₹)</label>
            <input
              type="number"
              step="1"
              className="form-input"
              placeholder="enter delivery fee"
              value={settings.deliveryFee}
              onChange={(e) => setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="settings-section-card">
          <h4 className="text-dark">Notification Preferences</h4>
          
          <div className="settings-toggle-row">
            <div className="toggle-details">
              <span className="toggle-title text-dark">Email Notifications</span>
              <span className="toggle-desc text-muted">Get emails when you sell products.</span>
            </div>
            <label className="switch-label-wrapper">
              <input
                type="checkbox"
                className="switch-input"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              />
              <span className="switch-slider-round"></span>
            </label>
          </div>

          <div className="settings-toggle-row">
            <div className="toggle-details">
              <span className="toggle-title text-dark">SMS Notifications</span>
              <span className="toggle-desc text-muted">Get SMS messages on your phone.</span>
            </div>
            <label className="switch-label-wrapper">
              <input
                type="checkbox"
                className="switch-input"
                checked={settings.smsNotifications}
                onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
              />
              <span className="switch-slider-round"></span>
            </label>
          </div>

          <div className="settings-toggle-row">
            <div className="toggle-details">
              <span className="toggle-title text-dark">New Order Alerts</span>
              <span className="toggle-desc text-muted">Get alerts for new purchases.</span>
            </div>
            <label className="switch-label-wrapper">
              <input
                type="checkbox"
                className="switch-input"
                checked={settings.orderAlerts}
                onChange={(e) => setSettings({ ...settings, orderAlerts: e.target.checked })}
              />
              <span className="switch-slider-round"></span>
            </label>
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="submit-action-btn">
            <img src="/src/assets/icons/shield.png" alt="" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
