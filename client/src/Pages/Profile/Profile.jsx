import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Components/Navbar/Navbar";
import style from "./Profile.module.css";

const backendURL = "http://localhost:3000";

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
          <div className={style.profileContent}>
            <h1>My Profile</h1>

            <div className={style.profileCard}>
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
            </div>

            <div className={style.settingsCard}>
              <h2>Account Settings</h2>
              <p>Change Password</p>
              <p>Notification Preferences</p>
              <p>Other Settings</p>
            </div>

            <button className={style.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <p>User data not found</p>
        )}
      </div>
    </>
  );
}

export default Profile;
