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
  FaEdit
} from "react-icons/fa";

const backendURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className={style.profileContainer}>
        {loading ? (
          <div className={style.loading}>
            <p>Loading user info...</p>
          </div>
        ) : user ? (
          <>
            <Header />
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
                  <button className={style.actionBtn}>
                    <FaShieldAlt />
                    <span>Security</span>
                  </button>
                  <button className={style.actionBtn}>
                    <FaBell />
                    <span>Notifications</span>
                  </button>
                  <button className={style.actionBtn}>
                    <FaCog />
                    <span>Preferences</span>
                  </button>
                  <button className={style.actionBtn}>
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
          </>
        ) : (
          <p>User data not found</p>
        )}
      </div>
    </>
  );
}

export default Profile;
