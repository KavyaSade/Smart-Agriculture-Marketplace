import React from 'react';
import './Profile.css';

export default function Profile({ profile, setProfile, profilePhoto, setProfilePhoto, setAlert }) {
  // handle profile picture changes
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        setAlert({ type: 'success', text: 'Profile photo updated!' });
      };
      reader.readAsDataURL(file);
    }
  };

  // save user profile changes
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setAlert({ type: 'success', text: 'Profile details saved!' });
  };

  return (
    <div className="profile-view dashboard-card">
      <form onSubmit={handleProfileSubmit}>
        {/* profile photo preview and upload section */}
        <div className="profile-photo-uploader-row">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile Preview" className="w-20 h-20 object-cover rounded-full border border-slate-200" />
          ) : (
            <div className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-md">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="uploader-info-col">
            <label className="form-label text-dark font-bold mb-0" style={{ marginBottom: 0 }}>Profile Photo</label>
            <div className="flex gap-2 items-center">
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="profile-photo-upload" />
              <label htmlFor="profile-photo-upload" className="btn btn-secondary cursor-pointer py-1.5 px-3 text-xs" style={{ display: 'inline-block' }}>
                {profilePhoto ? 'Update Photo' : 'Upload Photo'}
              </label>
              {profilePhoto && (
                <button
                  type="button"
                  className="cancel-action-btn py-1.5 px-3 text-xs"
                  style={{ color: '#d90429', borderColor: 'rgba(217, 4, 41, 0.3)', padding: '0.35rem 0.75rem' }}
                  onClick={() => {
                    setProfilePhoto(null);
                    setAlert({ type: 'success', text: 'Profile photo removed!' });
                  }}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="form-grid-layout">
          <div className="form-group">
            <label className="form-label text-dark">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="enter your full name"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label text-dark">Business / Farm Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="enter your farm name"
              value={profile.farmName}
              onChange={(e) => setProfile({ ...profile, farmName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label text-dark">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="enter your email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label text-dark">Phone Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="enter your phone number"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <div className="form-group form-group-full">
            <label className="form-label text-dark">Farm Location Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="enter your location"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </div>

          <div className="form-group form-group-full">
            <label className="form-label text-dark">Farm Bio</label>
            <textarea
              rows="3"
              className="form-input textarea-field"
              placeholder="enter your bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="submit-action-btn">
            <img src="/src/assets/icons/shield.png" alt="" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
