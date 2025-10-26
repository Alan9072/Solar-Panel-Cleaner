import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to clear cookie
      await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Clear any localStorage data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if there's an error
      navigate('/login');
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        {/* Status Button */}
        <button 
          className={`${styles.navItem} ${isActive('/status') ? styles.active : ''}`}
          onClick={() => navigate('/status')}
        >
          <div className={styles.iconWrapper}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className={styles.navLabel}>Status</span>
        </button>

        {/* Add Button (Center) */}
        <button 
          className={`${styles.navItem} ${styles.addButton} ${isActive('/') ? styles.active : ''}`}
          onClick={() => navigate('/')}
        >
          <div className={styles.addIconWrapper}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className={styles.navLabel}>Home</span>
        </button>

        {/* Logout Button */}
        <button 
          className={`${styles.navItem}`}
          onClick={handleLogout}
        >
          <div className={styles.iconWrapper}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className={styles.navLabel}>Logout</span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
