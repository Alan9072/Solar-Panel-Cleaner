import React from "react";
import { useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import { CgProfile } from "react-icons/cg"; // Logo icon
import { FaServer, FaPlusCircle, FaCogs } from "react-icons/fa"; // Optional icons per page
import { MdDashboard } from "react-icons/md";
import { TbLayoutDashboardFilled } from "react-icons/tb";

function Header() {
  const location = useLocation();

  // Map paths to titles and icons
  const getHeader = () => {
    switch (location.pathname) {
      case "/":
        return { title: "Status Dashboard", icon: <TbLayoutDashboardFilled  /> };
      case "/add":
        return { title: "Add Device", icon: <FaPlusCircle /> };
      case "/system":
        return { title: "System Control", icon: <FaCogs /> };
      case "/profile":
        return { title: "User Profile", icon: <CgProfile /> };
      default:
        return { title: "Dashboard", icon: <FaServer /> };
    }
  };

  const { title, icon } = getHeader();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          {React.cloneElement(icon, { className: styles.logoIcon })}
          <h1>{title}</h1>
        </div>
      </div>
    </header>
  );
}

export default Header;
