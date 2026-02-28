import React from "react";
import { Link, useLocation ,useNavigate } from "react-router-dom";
import style from "./Navbar.module.css";
import { CgProfile } from "react-icons/cg";
import { IoAddCircle, IoHome } from "react-icons/io5";
import { MdDashboard, MdHistory } from "react-icons/md";
import { IoIosAdd } from "react-icons/io";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaCogs } from "react-icons/fa";
import { IoAnalytics } from "react-icons/io5";
import { IoNotifications } from "react-icons/io5";


function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to clear cookie
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Clear any localStorage data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Use window.location for full page reload
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if there's an error
      window.location.href = '/login';
    }
  };

  return (
    <div className={style.mainDiv}>
      <Link
        to="/"
        className={`${style.navItem} ${location.pathname === "/" ? style.active : ""}`}
      >
        <TbLayoutDashboardFilled className={style.reactIcons} />
      </Link>

      <Link
        to="/status"
        className={`${style.navItem} ${location.pathname === "/status" ? style.active : ""}`}
      >
        <IoNotifications className={style.reactIcons} />
      </Link>

      <Link
        to="/system"
        className={`${style.navItem} ${location.pathname === "/system" ? style.active : ""}`}
      >
        <FaCogs className={style.reactIcons} />
      </Link>

      <Link
        to="/profile"
        className={`${style.navItem} ${location.pathname === "/profile" ? style.active : ""}`}
      >
        <CgProfile className={style.reactIcons} />
      </Link>
    </div>
  );
}

export default Navbar;
