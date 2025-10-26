import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Status.module.css'
import Navbar from '../../Components/Navbar/Navbar'

function Status() {
  const navigate = useNavigate();
  const [systemStatus, setSystemStatus] = useState({
    overall: 'operational',
    lastUpdate: new Date().toLocaleString()
  });

  const [services, setServices] = useState([
    { 
      id: 1, 
      name: 'Water Supply System', 
      status: 'operational', 
      uptime: '99.9%',
      lastCheck: '2 mins ago',
      description: 'Main water supply and distribution'
    },
    { 
      id: 2, 
      name: 'Pressure Monitoring', 
      status: 'operational', 
      uptime: '99.5%',
      lastCheck: '1 min ago',
      description: 'Real-time pressure sensors and alerts'
    },
    { 
      id: 3, 
      name: 'Temperature Sensors', 
      status: 'operational', 
      uptime: '100%',
      lastCheck: '30 secs ago',
      description: 'Environmental temperature monitoring'
    },
    { 
      id: 4, 
      name: 'Nozzle Control System', 
      status: 'warning', 
      uptime: '95.2%',
      lastCheck: '5 mins ago',
      description: 'Automated nozzle operation and control'
    },
    { 
      id: 5, 
      name: 'Panel Detection', 
      status: 'operational', 
      uptime: '98.8%',
      lastCheck: '1 min ago',
      description: 'Solar panel identification and tracking'
    },
    { 
      id: 6, 
      name: 'Database Service', 
      status: 'operational', 
      uptime: '99.9%',
      lastCheck: '10 secs ago',
      description: 'Data storage and retrieval operations'
    }
  ]);

  const [activityLog, setActivityLog] = useState([
    { id: 1, time: '10:45 AM', message: 'Panel A2 cleaning completed', type: 'success' },
    { id: 2, time: '10:30 AM', message: 'Water pressure adjusted to 45 PSI', type: 'info' },
    { id: 3, time: '10:15 AM', message: 'Nozzle Control System - Minor delay detected', type: 'warning' },
    { id: 4, time: '10:00 AM', message: 'Temperature threshold reached: 35°C', type: 'info' },
    { id: 5, time: '09:45 AM', message: 'Panel B1 cleaning started', type: 'success' }
  ]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'operational': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'maintenance': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'operational':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h1>System Status</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Overall Status Banner */}
        <div className={`${styles.overallStatus} ${styles[systemStatus.overall]}`}>
          <div className={styles.statusBanner}>
            <div className={styles.statusIcon}>
              {getStatusIcon(systemStatus.overall)}
            </div>
            <div className={styles.statusInfo}>
              <h2>All Systems {systemStatus.overall === 'operational' ? 'Operational' : 'Status Update'}</h2>
              <p>Last updated: {systemStatus.lastUpdate}</p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className={styles.servicesSection}>
          <h3 className={styles.sectionTitle}>Service Status</h3>
          <div className={styles.servicesGrid}>
            {services.map(service => (
              <div key={service.id} className={styles.serviceCard}>
                <div className={styles.serviceHeader}>
                  <div className={styles.serviceName}>
                    <div className={styles.serviceIcon} style={{color: getStatusColor(service.status)}}>
                      {getStatusIcon(service.status)}
                    </div>
                    <h4>{service.name}</h4>
                  </div>
                  <div className={styles.statusBadge} style={{backgroundColor: getStatusColor(service.status)}}>
                    {service.status}
                  </div>
                </div>
                <p className={styles.serviceDescription}>{service.description}</p>
                <div className={styles.serviceStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Uptime</span>
                    <span className={styles.statValue}>{service.uptime}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Last Check</span>
                    <span className={styles.statValue}>{service.lastCheck}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className={styles.activitySection}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <div className={styles.activityLog}>
            {activityLog.map(log => (
              <div key={log.id} className={`${styles.activityItem} ${styles[log.type]}`}>
                <span className={styles.activityIcon}>{getActivityIcon(log.type)}</span>
                <div className={styles.activityContent}>
                  <span className={styles.activityTime}>{log.time}</span>
                  <p className={styles.activityMessage}>{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <Navbar />
    </div>
  )
}

export default Status
