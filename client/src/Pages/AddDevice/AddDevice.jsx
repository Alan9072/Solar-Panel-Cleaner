import React, { useState, useEffect } from 'react'
import NavBar from '../../Components/Navbar/Navbar'
import styles from './AddDevice.module.css'
import Header from '../../Components/Header/Header';

const NOTIFICATIONS_API_URL = 'https://5okgo1bmj3.execute-api.ap-south-1.amazonaws.com/default/deletedb';

function AddDevice() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(NOTIFICATIONS_API_URL);
      const result = await response.json();
      
      if (result.alerts && Array.isArray(result.alerts)) {
        // Map API alerts to notification format
        const formattedNotifications = result.alerts.map((alert) => {
          // Determine notification type based on alert
          let type = 'warning'; // Default for alerts
          if (alert.status === 'resolved') {
            type = 'success';
          } else if (alert.alert === 'region_not_cleaned') {
            type = 'warning';
          }
          
          // Format region name
          const regionMap = {
            'rd': 'Right Down',
            'ru': 'Right Up',
            'ld': 'Left Down',
            'lu': 'Left Up'
          };
          const regionName = regionMap[alert.region] || alert.region.toUpperCase();
          
          // Format timestamp
          const timeAgo = getTimeAgo(alert.timestamp);
          
          return {
            id: alert.timestamp,
            type: type,
            title: `${alert.status === 'unresolved' ? '⚠️ ' : ''}Region ${regionName}`,
            message: alert.message,
            time: timeAgo,
            read: alert.status === 'resolved',
            status: alert.status,
            region: alert.region,
            alert: alert.alert
          };
        });
        
        setNotifications(formattedNotifications);
        setError(null);
      } else {
        setError('Invalid data format');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Notifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to calculate time ago
  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) {
      return;
    }
    
    try {
      setClearing(true);
      
      // Try GET method (some APIs use GET for simple operations)
      console.log('Trying GET request to:', NOTIFICATIONS_API_URL);
      const response = await fetch(NOTIFICATIONS_API_URL);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      // Clear locally and refetch
      if (response.ok || response.status === 200) {
        console.log('Request successful, clearing locally and refetching...');
        setNotifications([]);
        setTimeout(() => {
          fetchNotifications();
        }, 1000);
      } else {
        console.error('Clear failed with status:', response.status);
        setError('Failed to clear notifications. Status: ' + response.status);
      }
    } catch (err) {
      console.error('Clear notifications error:', err);
      setError('Cannot clear - CORS issue. Ask your friend to enable CORS for POST/DELETE methods on the API.');
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'info':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  return (
    <div>
      <NavBar/>
      <Header/>
      <div className={styles.container}>
        <div className={styles.headerActions}>
          {loading && notifications.length === 0 ? (
            <div className={styles.skeletonNotificationCount}>
              <div className={styles.skeletonCountText}></div>
            </div>
          ) : (
            <div className={styles.notificationCount}>
              {notifications.length} {notifications.length === 1 ? 'Notification' : 'Notifications'}
            </div>
          )}
          
          <button 
            onClick={clearAllNotifications} 
            className={styles.clearButton}
            disabled={clearing || notifications.length === 0}
          >
            {clearing ? 'Clearing...' : 'Clear All'}
          </button>
        </div>
        
        {loading && notifications.length === 0 ? (
          <div className={styles.notificationsList}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonIcon}></div>
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonTitle}></div>
                  <div className={styles.skeletonMessage}></div>
                  <div className={styles.skeletonTime}></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className={styles.errorTitle}>{error}</h2>
            <button onClick={fetchNotifications} className={styles.retryButton}>Try Again</button>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>No notifications yet</h2>
            <p className={styles.emptyText}>You're all caught up! Check back later for updates.</p>
          </div>
        ) : (
          <div className={styles.notificationsList}>
            {notifications.map((notification, index) => (
              <div 
                key={notification.id || index} 
                className={`${styles.notificationCard} ${!notification.read ? styles.unread : ''} ${styles[notification.type]}`}
              >
                <div className={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className={styles.notificationContent}>
                  <h3 className={styles.notificationTitle}>{notification.title}</h3>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  <span className={styles.notificationTime}>{notification.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddDevice