import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Components/Navbar/Navbar";
import style from "./Profile.module.css";
import Header from "../../Components/Header/Header";
import { 
  FaUser, 
  FaShieldAlt, 
  FaBell, 
  FaCog, 
  FaChartLine, 
  FaCloudUploadAlt,
  FaHistory,
  FaMicrochip,
  FaSignOutAlt,
  FaEdit,
  FaTimes
} from "react-icons/fa";

const backendURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/user/me`, {
          withCredentials: true,
        });
        if (response.data) setUser(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => fetchUser(), 1000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${backendURL}/logout`, {}, { withCredentials: true });
      // Clear localStorage
      localStorage.clear();
      // Use window.location for full page reload
      window.location.href = '/login';
    } catch (err) {
      console.error("Logout failed:", err);
      // Still redirect even on error
      window.location.href = '/login';
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    try {
      await axios.post(
        `${backendURL}/api/user/change-password`,
        {
          newPassword: passwordData.newPassword
        },
        { withCredentials: true }
      );
      
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordData({ newPassword: '', confirmPassword: '' });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordData({ newPassword: '', confirmPassword: '' });
  };

  return (
    <>
      <Navbar />
      <div className={style.profileContainer}>
        <Header />
        {loading ? (
          <div className={style.loading}>
            <p>Loading user info...</p>
          </div>
        ) : user ? (
          <>
            
            <div className={style.profileContent}>
              
              {/* Profile Header */}
              <div className={style.profileHeader}>
                <div className={style.avatarSection}>
                  <div className={style.avatar}>
                    <FaUser />
                  </div>
                </div>
                <div className={style.userInfo}>
                  <h1 className={style.userName}>{user.name}</h1>
                  <p className={style.userHandle}>{user.username}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={style.section}>
                <h3 className={style.sectionTitle}>Account Settings</h3>
                <div className={style.actionGrid}>
                  <button className={style.actionBtn} onClick={openPasswordModal}>
                    <FaEdit />
                    <span>Change Password</span>
                  </button>
                  <button className={style.actionBtn} onClick={() => navigate('/status')}>
                    <FaBell />
                    <span>Notifications</span>
                  </button>
                  <button className={style.actionBtn}>
                    <FaCog />
                    <span>Preferences</span>
                  </button>
                  <button className={style.actionBtn} onClick={() => navigate('/history')}>
                    <FaHistory />
                    <span>History</span>
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <button className={style.logoutButton} onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
              <div className={style.modalOverlay} onClick={closePasswordModal}>
                <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
                  <div className={style.modalHeader}>
                    <h2>Change Password</h2>
                    <button className={style.closeBtn} onClick={closePasswordModal}>
                      <FaTimes />
                    </button>
                  </div>
                  
                  <form onSubmit={handlePasswordChange} className={style.passwordForm}>
                    <div className={style.messageContainer}>
                      {passwordError && (
                        <div className={style.errorMessage}>{passwordError}</div>
                      )}
                      {passwordSuccess && (
                        <div className={style.successMessage}>{passwordSuccess}</div>
                      )}
                    </div>
                    
                    <div className={style.formGroup}>
                      <label>New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        required
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className={style.formGroup}>
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        required
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className={style.modalButtons}>
                      <button type="button" className={style.cancelBtn} onClick={closePasswordModal}>
                        Cancel
                      </button>
                      <button type="submit" className={style.submitBtn}>
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          <p>User data not found</p>
        )}
      </div>
    </>
  );
}

export default Profile;
