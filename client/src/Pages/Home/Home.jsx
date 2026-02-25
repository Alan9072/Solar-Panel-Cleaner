import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from "./Home.module.css";
import Navbar from '../../Components/Navbar/Navbar';

function Home() {
  const navigate = useNavigate();
  const [panels, setPanels] = useState([
    { id: 1, name: 'Panel A1', status: 'active', efficiency: 94, lastCleaned: '2 hours ago' },
    { id: 2, name: 'Panel A2', status: 'cleaning', efficiency: 87, lastCleaned: 'Now' },
    { id: 3, name: 'Panel B1', status: 'active', efficiency: 91, lastCleaned: '5 hours ago' },
  ]);

  const [temperature, setTemperature] = useState(28);
  const [waterPressure, setWaterPressure] = useState(45);
  const [nozzleStatus, setNozzleStatus] = useState('Idle');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newPanelName, setNewPanelName] = useState('');

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature(prev => Math.max(20, Math.min(40, prev + (Math.random() - 0.5) * 2)));
      setWaterPressure(prev => Math.max(30, Math.min(60, prev + (Math.random() - 0.5) * 5)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAddPanel = () => {
    if (newPanelName.trim()) {
      const newPanel = {
        id: panels.length + 1,
        name: newPanelName,
        status: 'active',
        efficiency: Math.floor(Math.random() * 15 + 85),
        lastCleaned: 'Never'
      };
      setPanels([...panels, newPanel]);
      setNewPanelName('');
      setShowAddPanel(false);
    }
  };

  const handleCleanPanel = (id) => {
    setPanels(panels.map(panel => 
      panel.id === id ? { ...panel, status: 'cleaning', lastCleaned: 'Now' } : panel
    ));
    setNozzleStatus('Spraying');
    
    setTimeout(() => {
      setPanels(panels.map(panel => 
        panel.id === id ? { 
          ...panel, 
          status: 'active', 
          efficiency: Math.min(100, panel.efficiency + Math.floor(Math.random() * 8 + 5)),
          lastCleaned: 'Just now'
        } : panel
      ));
      setNozzleStatus('Idle');
    }, 5000);
  };

  const handleDeletePanel = (id) => {
    setPanels(panels.filter(panel => panel.id !== id));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#4ade80';
      case 'cleaning': return '#fbbf24';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const avgEfficiency = panels.length > 0 
    ? (panels.reduce((sum, panel) => sum + panel.efficiency, 0) / panels.length).toFixed(1)
    : 0;

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to clear cookie
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include', // Important: include cookies in the request
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      // Clear any localStorage data (if you're storing anything there)
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
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h1>Solar Panel Cleaning System</h1>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className={styles.main}>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.blue}`}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Panels</p>
              <h2 className={styles.statValue}>{panels.length}</h2>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.green}`}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Avg Efficiency</p>
              <h2 className={styles.statValue}>{avgEfficiency}%</h2>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.orange}`}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Temperature</p>
              <h2 className={styles.statValue}>{temperature.toFixed(1)}°C</h2>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.purple}`}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Water Pressure</p>
              <h2 className={styles.statValue}>{waterPressure.toFixed(0)} psi</h2>
            </div>
          </div>
        </div>

        {/* Monitoring Section */}
        <div className={styles.monitoringSection}>
          <div className={styles.monitorCard}>
            <h3 className={styles.cardTitle}>
              <svg className={styles.titleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Environmental Monitoring
            </h3>
            <div className={styles.gaugeContainer}>
              <div className={styles.gauge}>
                <div className={styles.gaugeValue} style={{height: `${(temperature - 20) * 5}%`}}></div>
                <div className={styles.gaugeInfo}>
                  <span className={styles.gaugeMark}>40°</span>
                  <span className={styles.gaugeMark}>30°</span>
                  <span className={styles.gaugeMark}>20°</span>
                </div>
              </div>
              <div className={styles.gaugeLabel}>
                <strong>{temperature.toFixed(1)}°C</strong>
                <span>Temperature</span>
              </div>
            </div>
          </div>

          <div className={styles.monitorCard}>
            <h3 className={styles.cardTitle}>
              <svg className={styles.titleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Water Pressure Control
            </h3>
            <div className={styles.gaugeContainer}>
              <div className={styles.gauge}>
                <div className={styles.gaugeValue} style={{height: `${(waterPressure - 30) / 0.3}%`, backgroundColor: '#8b5cf6'}}></div>
                <div className={styles.gaugeInfo}>
                  <span className={styles.gaugeMark}>60</span>
                  <span className={styles.gaugeMark}>45</span>
                  <span className={styles.gaugeMark}>30</span>
                </div>
              </div>
              <div className={styles.gaugeLabel}>
                <strong>{waterPressure.toFixed(0)} PSI</strong>
                <span>Pressure</span>
              </div>
            </div>
          </div>

          <div className={styles.monitorCard}>
            <h3 className={styles.cardTitle}>
              <svg className={styles.titleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Nozzle Status
            </h3>
            <div className={styles.nozzleStatus}>
              <div className={`${styles.statusIndicator} ${nozzleStatus === 'Spraying' ? styles.spraying : ''}`}>
                <div className={styles.statusDot}></div>
                <span className={styles.statusText}>{nozzleStatus}</span>
              </div>
              <p className={styles.statusDescription}>
                {nozzleStatus === 'Spraying' ? 'Water is being sprayed on panels' : 'System ready for operation'}
              </p>
            </div>
          </div>
        </div>

        {/* Panels Section */}
        <div className={styles.panelsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Solar Panels</h2>
            <button className={styles.addBtn} onClick={() => setShowAddPanel(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Panel
            </button>
          </div>

          <div className={styles.panelsGrid}>
            {panels.map(panel => (
              <div key={panel.id} className={styles.panelCard}>
                <div className={styles.panelHeader}>
                  <h4 className={styles.panelName}>{panel.name}</h4>
                  <div className={styles.panelStatus} style={{backgroundColor: getStatusColor(panel.status)}}>
                    {panel.status}
                  </div>
                </div>
                <div className={styles.panelBody}>
                  <div className={styles.efficiencyCircle}>
                    <svg className={styles.progressRing} viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle 
                        cx="60" cy="60" r="54" 
                        fill="none" 
                        stroke="#6A7BFE" 
                        strokeWidth="8"
                        strokeDasharray={`${panel.efficiency * 3.39} 339.292`}
                        strokeDashoffset="84.823"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className={styles.efficiencyText}>
                      <span className={styles.efficiencyValue}>{panel.efficiency}%</span>
                      <span className={styles.efficiencyLabel}>Efficiency</span>
                    </div>
                  </div>
                  <div className={styles.panelInfo}>
                    <p><strong>Last Cleaned:</strong> {panel.lastCleaned}</p>
                  </div>
                </div>
                <div className={styles.panelActions}>
                  <button 
                    className={styles.cleanBtn} 
                    onClick={() => handleCleanPanel(panel.id)}
                    disabled={panel.status === 'cleaning'}
                  >
                    {panel.status === 'cleaning' ? 'Cleaning...' : 'Clean Now'}
                  </button>
                  <button 
                    className={styles.deleteBtn} 
                    onClick={() => handleDeletePanel(panel.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Panel Modal */}
      {showAddPanel && (
        <div className={styles.modal} onClick={() => setShowAddPanel(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Add New Solar Panel</h3>
            <input
              type="text"
              placeholder="Enter panel name (e.g., Panel C1)"
              value={newPanelName}
              onChange={(e) => setNewPanelName(e.target.value)}
              className={styles.modalInput}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPanel()}
            />
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowAddPanel(false)}>Cancel</button>
              <button className={styles.submitBtn} onClick={handleAddPanel}>Add Panel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <Navbar />
    </div>
  )
}

export default Home