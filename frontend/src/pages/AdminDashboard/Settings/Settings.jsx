import React from 'react';
import './Settings.css';

export default function Settings({ adminSettings, setAdminSettings, setAlert }) {
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setAlert({ type: 'success', text: 'Global platform settings saved!' });
  };

  return (
    <div className="admin-settings-view dashboard-card">
      <form onSubmit={handleSettingsSubmit}>
        
        <div className="settings-section-card">
          <h4 className="text-dark">Global Commission Settings</h4>
          <div className="form-group mt-4 max-w-xs">
            <label className="form-label text-dark">Default Platform Fee Rate (%)</label>
            <input
              type="number"
              step="0.1"
              className="form-input"
              value={adminSettings.commissionRate}
              onChange={(e) => setAdminSettings({ 
                ...adminSettings, 
                commissionRate: parseFloat(e.target.value) || 0 
              })}
            />
          </div>
        </div>

        <div className="settings-section-card">
          <h4 className="text-dark">Platform Status</h4>
          
          <div className="settings-toggle-row">
            <div className="toggle-details">
              <span className="toggle-title text-dark">Site Maintenance Mode</span>
              <span className="toggle-desc text-muted">Put the marketplace in offline status.</span>
            </div>
            <label className="switch-label-wrapper">
              <input
                type="checkbox"
                className="switch-input"
                checked={adminSettings.maintenanceMode}
                onChange={(e) => setAdminSettings({ 
                  ...adminSettings, 
                  maintenanceMode: e.target.checked 
                })}
              />
              <span className="switch-slider-round"></span>
            </label>
          </div>

          <div className="settings-toggle-row">
            <div className="toggle-details">
              <span className="toggle-title text-dark">New User Registrations</span>
              <span className="toggle-desc text-muted">Allow new retailers and buyers to create accounts.</span>
            </div>
            <label className="switch-label-wrapper">
              <input
                type="checkbox"
                className="switch-input"
                checked={adminSettings.allowRegistrations}
                onChange={(e) => setAdminSettings({ 
                  ...adminSettings, 
                  allowRegistrations: e.target.checked 
                })}
              />
              <span className="switch-slider-round"></span>
            </label>
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="submit-action-btn">
            <img src="/src/assets/icons/shield.png" alt="" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            <span>Save Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
}
