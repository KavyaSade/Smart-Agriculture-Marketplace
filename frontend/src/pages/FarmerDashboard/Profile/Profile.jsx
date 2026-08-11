import React from 'react';
import { Edit } from 'lucide-react';
import './Profile.css';
import TwoFactorSetup from '../../../components/2fa/setup';

const convertImageToPng = (file, callback, maxDim = 400) => {
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
      callback(canvas.toDataURL('image/png'));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};

const Profile = ({
  profileData,
  isEditingProfile,
  setIsEditingProfile,
  profileFormInputs,
  setProfileFormInputs,
  handleSaveProfile,
  handleUpdateProfileData
}) => {
  return (
    <div className="section-card">
      <div className="card-section-header">
        <h2>My Profile</h2>
      </div>

      <div className="profile-minimal-container animate-fade-in">
        {!isEditingProfile ? (

          <div className="profile-details-view">

            <div className="profile-minimal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="profile-minimal-avatar-placeholder" style={{ width: '70px', height: '70px', fontSize: '1.75rem' }}>
                  {profileData.profilePhoto ? (
                    <img src={profileData.profilePhoto} alt="Avatar" className="profile-minimal-avatar-img" />
                  ) : (
                    profileData.firstName ? profileData.firstName.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div>
                  <h3 className="profile-minimal-name" style={{ margin: '0 0 0.25rem 0' }}>{profileData.firstName} {profileData.lastName}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="profile-minimal-badge">{profileData.role}</span>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <label className="view-upload-btn" style={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#40916c', background: 'rgba(82, 183, 136, 0.08)', padding: '0.2rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(82, 183, 136, 0.2)', display: 'inline-block' }}>
                        Upload Photo
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              convertImageToPng(file, (pngDataUrl) => {
                                const updatedProfile = {
                                  ...profileData,
                                  profilePhoto: pngDataUrl
                                };
                                handleUpdateProfileData(updatedProfile);
                              });
                            }
                          }}
                        />
                      </label>
                      {profileData.profilePhoto && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const updatedProfile = {
                              ...profileData,
                              profilePhoto: null
                            };
                            handleUpdateProfileData(updatedProfile);
                          }}
                          style={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', background: 'rgba(239, 68, 68, 0.05)', padding: '0.2rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.1)' }}
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="profile-minimal-columns-grid">

              <div className="profile-minimal-column">
                <div className="profile-minimal-section-title" style={{ marginTop: 0 }}>Personal Information</div>
                <div className="profile-minimal-list">
                  <div className="profile-minimal-item">
                    <span className="profile-minimal-label">First Name</span>
                    <span className="profile-minimal-value">{profileData.firstName}</span>
                  </div>
                  <div className="profile-minimal-item">
                    <span className="profile-minimal-label">Last Name</span>
                    <span className="profile-minimal-value">{profileData.lastName}</span>
                  </div>
                  <div className="profile-minimal-item">
                    <span className="profile-minimal-label">Phone Number</span>
                    <span className="profile-minimal-value">{profileData.phone}</span>
                  </div>
                  <div className="profile-minimal-item">
                    <span className="profile-minimal-label">Email Address</span>
                    <span className="profile-minimal-value">{profileData.email}</span>
                  </div>
                  <div className="profile-minimal-item">
                    <span className="profile-minimal-label">Primary Sector</span>
                    <span className="profile-minimal-value" style={{ textTransform: 'capitalize' }}>
                      {profileData.sector === 'fruits' ? 'Fruits & Vegetables' : profileData.sector}
                    </span>
                  </div>
                  <div className="profile-minimal-item">
                    <span className="profile-minimal-label">Farm Name</span>
                    <span className="profile-minimal-value">{profileData.farmName || 'Not Specified'}</span>
                  </div>
                  <div className="profile-minimal-item">
                    <span className="profile-minimal-label">Farming Experience</span>
                    <span className="profile-minimal-value">{profileData.experience || 'Not Specified'}</span>
                  </div>
                  <div className="profile-minimal-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span className="profile-minimal-label">Farm Bio / About Us</span>
                    <span className="profile-minimal-value" style={{ marginTop: '0.25rem', whiteSpace: 'pre-line', width: '100%' }}>{profileData.bio || 'No bio written yet.'}</span>
                  </div>
                </div>
              </div>

              <div className="profile-minimal-column">
                <div className="profile-minimal-section-title" style={{ marginTop: 0 }}>Address Information</div>
                <div className="profile-minimal-list">
                  <div className="profile-minimal-item">
                    <span className="profile-minimal-label">Street Address</span>
                    <span className="profile-minimal-value">{profileData.addressStreet}</span>
                  </div>
                  <div className="profile-minimal-item">
                    <span className="profile-minimal-label">City</span>
                    <span className="profile-minimal-value">{profileData.addressCity}</span>
                  </div>
                  <div className="profile-minimal-item">
                    <span className="profile-minimal-label">State</span>
                    <span className="profile-minimal-value">{profileData.addressState}</span>
                  </div>
                  <div className="profile-minimal-item">
                    <span className="profile-minimal-label">Postal / PIN Code</span>
                    <span className="profile-minimal-value">{profileData.addressPin}</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setProfileFormInputs({
                  firstName: profileData.firstName,
                  lastName: profileData.lastName,
                  phone: profileData.phone,
                  email: profileData.email,
                  sector: profileData.sector,
                  addressStreet: profileData.addressStreet,
                  addressCity: profileData.addressCity,
                  addressState: profileData.addressState,
                  addressPin: profileData.addressPin,
                  profilePhoto: profileData.profilePhoto,
                  farmName: profileData.farmName || '',
                  experience: profileData.experience || '',
                  bio: profileData.bio || ''
                });
                setIsEditingProfile(true);
              }} 
              className="btn btn-primary profile-action-btn"
              style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}
            >
              <Edit size={16} />
              <span>Edit Profile Details</span>
            </button>

            <TwoFactorSetup 
              isTwoFactorEnabled={profileData.isTwoFactorEnabled} 
              onToggleSuccess={(newVal) => {
                handleUpdateProfileData({
                  ...profileData,
                  isTwoFactorEnabled: newVal
                });
              }}
            />
          </div>
        ) : (

          <form onSubmit={handleSaveProfile} className="profile-edit-form-minimal">
            <div className="profile-photo-editor-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(82, 183, 136, 0.1)' }}>
              <div className="profile-minimal-avatar-placeholder" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                {profileFormInputs.profilePhoto ? (
                  <img src={profileFormInputs.profilePhoto} alt="Avatar" className="profile-minimal-avatar-img" />
                ) : (
                  profileFormInputs.firstName ? profileFormInputs.firstName.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', border: '1px solid rgba(82, 183, 136, 0.3)', color: '#40916c', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>Upload Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          convertImageToPng(file, (pngDataUrl) => {
                            setProfileFormInputs(prev => ({ ...prev, profilePhoto: pngDataUrl }));
                          });
                        }
                      }}
                    />
                  </label>
                {profileFormInputs.profilePhoto && (
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#e63946', color: '#ffffff', border: 'none' }}
                    onClick={() => {
                      setProfileFormInputs(prev => ({ ...prev, profilePhoto: null }));
                    }}
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
            <div className="profile-minimal-columns-grid">

              <div className="profile-minimal-column">
                <div className="profile-minimal-section-title" style={{ marginTop: 0, marginBottom: '1rem' }}>Personal Information</div>

                <div className="form-grid-row form-grid-row-2col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-firstname">First Name *</label>
                    <input 
                      type="text" 
                      id="p-firstname"
                      className="form-input" 
                      value={profileFormInputs.firstName}
                      onChange={(e) => setProfileFormInputs(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-lastname">Last Name *</label>
                    <input 
                      type="text" 
                      id="p-lastname"
                      className="form-input" 
                      value={profileFormInputs.lastName}
                      onChange={(e) => setProfileFormInputs(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" htmlFor="p-phone">Phone Number *</label>
                  <input 
                    type="text" 
                    id="p-phone"
                    className="form-input" 
                    value={profileFormInputs.phone}
                    onChange={(e) => setProfileFormInputs(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" htmlFor="p-email">Email Address *</label>
                  <input 
                    type="email" 
                    id="p-email"
                    className="form-input" 
                    value={profileFormInputs.email}
                    onChange={(e) => setProfileFormInputs(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" htmlFor="p-sector">Primary Sector *</label>
                  <select 
                    id="p-sector"
                    className="form-input"
                    value={profileFormInputs.sector}
                    onChange={(e) => setProfileFormInputs(prev => ({ ...prev, sector: e.target.value }))}
                    required
                  >
                    <option value="grains">Grains</option>
                    <option value="fruits">Fruits & Vegetables</option>
                    <option value="dairy">Dairy Products</option>
                    <option value="spices">Spices</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" htmlFor="p-farmname">Farm Name</label>
                  <input 
                    type="text" 
                    id="p-farmname"
                    className="form-input" 
                    value={profileFormInputs.farmName || ''}
                    onChange={(e) => setProfileFormInputs(prev => ({ ...prev, farmName: e.target.value }))}
                    placeholder="e.g. Green Valley Farm"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" htmlFor="p-experience">Farming Experience</label>
                  <input 
                    type="text" 
                    id="p-experience"
                    className="form-input" 
                    value={profileFormInputs.experience || ''}
                    onChange={(e) => setProfileFormInputs(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="e.g. 5 Years"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" htmlFor="p-bio">Farm Bio / About Us</label>
                  <textarea 
                    id="p-bio"
                    className="form-input" 
                    style={{ minHeight: '80px', fontFamily: 'inherit', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(82, 183, 136, 0.2)' }}
                    value={profileFormInputs.bio || ''}
                    onChange={(e) => setProfileFormInputs(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Describe your farming practices, organic standards, and products..."
                  />
                </div>
              </div>

              <div className="profile-minimal-column">
                <div className="profile-minimal-section-title" style={{ marginTop: 0, marginBottom: '1rem' }}>Address Information</div>

                <div className="form-group">
                  <label className="form-label" htmlFor="p-street">Street Address *</label>
                  <input 
                    type="text" 
                    id="p-street"
                    className="form-input" 
                    value={profileFormInputs.addressStreet}
                    onChange={(e) => setProfileFormInputs(prev => ({ ...prev, addressStreet: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-grid-row form-grid-row-2col" style={{ marginTop: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-city">City *</label>
                    <input 
                      type="text" 
                      id="p-city"
                      className="form-input" 
                      value={profileFormInputs.addressCity}
                      onChange={(e) => setProfileFormInputs(prev => ({ ...prev, addressCity: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-state">State *</label>
                    <input 
                      type="text" 
                      id="p-state"
                      className="form-input" 
                      value={profileFormInputs.addressState}
                      onChange={(e) => setProfileFormInputs(prev => ({ ...prev, addressState: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" htmlFor="p-pin">Postal / PIN Code *</label>
                  <input 
                    type="text" 
                    id="p-pin"
                    className="form-input" 
                    value={profileFormInputs.addressPin}
                    onChange={(e) => setProfileFormInputs(prev => ({ ...prev, addressPin: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="profile-form-actions" style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditingProfile(false)} 
                className="btn btn-secondary profile-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
