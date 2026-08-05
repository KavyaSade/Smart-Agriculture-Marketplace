import React from 'react';
import './Settings.css';

const Settings = ({
  emailNotifications,
  setEmailNotifications,
  smsNotifications,
  setSmsNotifications,
  isDarkTheme,
  setIsDarkTheme,
  logActivity
}) => {
  return (
    <div className="settings-tab-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div className="section-card">
        <div className="card-section-header">
          <h2>Account Settings</h2>
          <p style={{ color: '#55625b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Manage notifications and application theme.
          </p>
        </div>

        <div className="settings-container-new" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div className="settings-group-card" style={{ background: '#ffffff', border: '1px solid rgba(82, 183, 136, 0.08)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(27, 67, 50, 0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1b4332', margin: '0 0 1rem 0' }}>Notification Preferences</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1c2420', margin: '0 0 0.15rem 0' }}>Email Alerts</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Receive email confirmations when placing crop orders.</p>
                </div>
                <label className="toggle-switch-wrapper" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                  <input 
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }} 
                  />
                  <span className="toggle-slider" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: emailNotifications ? '#40916c' : '#ccc', transition: '0.4s', borderRadius: '34px' }}>
                    <span className="toggle-circle" style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: emailNotifications ? '28px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '0.4s', borderRadius: '50%' }}></span>
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1c2420', margin: '0 0 0.15rem 0' }}>SMS Warnings</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Receive SMS alerts on shipment updates and delivery status changes.</p>
                </div>
                <label className="toggle-switch-wrapper" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                  <input 
                    type="checkbox" 
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }} 
                  />
                  <span className="toggle-slider" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: smsNotifications ? '#40916c' : '#ccc', transition: '0.4s', borderRadius: '34px' }}>
                    <span className="toggle-circle" style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: smsNotifications ? '28px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '0.4s', borderRadius: '50%' }}></span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-group-card" style={{ background: '#ffffff', border: '1px solid rgba(82, 183, 136, 0.08)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(27, 67, 50, 0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1b4332', margin: '0 0 0.25rem 0' }}>Application Theme</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Toggle between light visual style and dark visual style for nighttime usage.</p>
              </div>
              <label className="toggle-switch-wrapper" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                <input 
                  type="checkbox" 
                  checked={isDarkTheme}
                  onChange={(e) => {
                    setIsDarkTheme(e.target.checked);
                    document.body.classList.toggle('dark-theme', e.target.checked);
                    logActivity(`Applied ${e.target.checked ? 'Dark' : 'Light'} theme`, 'info');
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }} 
                />
                <span className="toggle-slider" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isDarkTheme ? '#40916c' : '#ccc', transition: '0.4s', borderRadius: '34px' }}>
                  <span className="toggle-circle" style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: isDarkTheme ? '28px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '0.4s', borderRadius: '50%' }}></span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;
