import React, { useState, useEffect } from 'react'
import Navbar from '../../Components/Navbar/Navbar'
import styles from './Status.module.css'
import Header from '../../Components/Header/Header'

function Status() {
  const [telemetryData, setTelemetryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Temporary chart data - you can replace these values
  const chartData = [
    { label: '12:00', value: 65 },
    { label: '13:00', value: 75 },
    { label: '14:00', value: 55 },
    { label: '15:00', value: 85 },
    { label: '16:00', value: 70 },
    { label: '17:00', value: 90 },
  ];

  const fetchTelemetry = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      
      const startTime = Date.now()
      const response = await fetch('https://ri97neft0k.execute-api.ap-south-1.amazonaws.com/telemetry')
      const result = await response.json()
      
      if (result.success) {
        setTelemetryData(result.data)
        setLastUpdated(new Date())
        setError(null)
      } else {
        setError('Failed to fetch telemetry data')
      }
      
      // Ensure loading state shows for at least 1 second
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 1000 - elapsedTime)
      await new Promise(resolve => setTimeout(resolve, remainingTime))
      
    } catch (err) {
      setError('Error connecting to the server')
      console.error('Telemetry fetch error:', err)
      
      // Still wait 1 second even on error
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTelemetry(false)
    // Refresh data every 7 seconds
    const interval = setInterval(() => fetchTelemetry(true), 7000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <Header />
      <Navbar/>
      <div className={styles.statusContainer}>
        <h1 className={styles.title}>Device Telemetry Status</h1>
        
        {loading && !telemetryData && (
          <div className={styles.loading}>Loading telemetry data...</div>
        )}
        
        {error && (
          <div className={styles.error}>{error}</div>
        )}
        
        {telemetryData && (
          <div className={styles.telemetryCard}>
            <div className={styles.deviceInfo}>
              <h2>Device ID: {telemetryData.deviceId}</h2>
              <p className={styles.timestamp}>
                Last Updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Just now'}
                {refreshing && <span className={styles.refreshIndicator}> • Updating...</span>}
              </p>
            </div>
            
            <div className={styles.metricsGrid}>
              <div className={`${styles.metricCard} ${refreshing ? styles.updating : ''}`}>
                <div className={styles.metricIcon}>🌡️</div>
                <div className={styles.metricLabel}>Temperature</div>
                <div className={styles.metricValue}>
                  {refreshing ? (
                    <span className={styles.skeleton}>--.-</span>
                  ) : (
                    `${telemetryData.temperature.toFixed(2)}°C`
                  )}
                </div>
              </div>
              
              <div className={`${styles.metricCard} ${refreshing ? styles.updating : ''}`}>
                <div className={styles.metricIcon}>⚡</div>
                <div className={styles.metricLabel}>Power</div>
                <div className={styles.metricValue}>
                  {refreshing ? (
                    <span className={styles.skeleton}>--.-</span>
                  ) : (
                    `${telemetryData.power_W.toFixed(2)} W`
                  )}
                </div>
              </div>
              
              <div className={`${styles.metricCard} ${refreshing ? styles.updating : ''}`}>
                <div className={styles.metricIcon}>🔌</div>
                <div className={styles.metricLabel}>Current</div>
                <div className={styles.metricValue}>
                  {refreshing ? (
                    <span className={styles.skeleton}>--.-</span>
                  ) : (
                    `${telemetryData.current_mA.toFixed(2)} mA`
                  )}
                </div>
              </div>
              
              <div className={`${styles.metricCard} ${refreshing ? styles.updating : ''}`}>
                <div className={styles.metricIcon}>🔋</div>
                <div className={styles.metricLabel}>Voltage</div>
                <div className={styles.metricValue}>
                  {refreshing ? (
                    <span className={styles.skeleton}>-.----</span>
                  ) : (
                    `${telemetryData.voltage.toFixed(4)} V`
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Section */}
        {telemetryData && (
          <div className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Power Usage Over Time</h2>
            <div className={styles.chart}>
              {chartData.map((data, index) => (
                <div key={index} className={styles.barWrapper}>
                  <div className={styles.barContainer}>
                    <div 
                      className={styles.bar} 
                      style={{ height: `${data.value}%` }}
                    >
                      <span className={styles.barValue}>{data.value}</span>
                    </div>
                  </div>
                  <div className={styles.barLabel}>{data.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Status