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
  const [chartData, setChartData] = useState([]);

  const fetchTelemetry = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      
      const startTime = Date.now()
      
      // Fetch current telemetry data
      const response = await fetch('https://ri97neft0k.execute-api.ap-south-1.amazonaws.com/telemetry')
      const result = await response.json()
      
      // Fetch historical data for chart (last 5 records)
      const historyResponse = await fetch('https://ri97neft0k.execute-api.ap-south-1.amazonaws.com/telemetry?limit=5')
      const historyResult = await historyResponse.json()
      
      if (result.success) {
        setTelemetryData(result.data)
        setLastUpdated(new Date())
        setError(null)
        
        // Format historical data for chart
        if (historyResult.success && historyResult.data) {
          // Check if data is an array or single object
          const dataArray = Array.isArray(historyResult.data) 
            ? historyResult.data 
            : [historyResult.data]
          
          const formattedChartData = dataArray.map((item) => {
            const time = new Date(item.timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })
            return {
              label: time,
              value: parseFloat(item.current_mA.toFixed(2)), // Using current for the chart
              rawValue: item.current_mA
            }
          }).reverse() // Reverse to show oldest to newest
          
          // Scale values to percentages (0-100) for better visualization
          const values = formattedChartData.map(d => d.value)
          const minValue = Math.min(...values)
          const maxValue = Math.max(...values)
          const range = maxValue - minValue
          
          const scaledChartData = formattedChartData.map(item => ({
            ...item,
            displayValue: range > 0 
              ? ((item.value - minValue) / range) * 80 + 20 // Scale to 20-100%
              : 50 // If all values are same, show 50%
          }))
          
          setChartData(scaledChartData)
        }
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
    // Refresh data and chart every 10 seconds
    const interval = setInterval(() => fetchTelemetry(true), 10000)
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
        {telemetryData && chartData.length > 0 && (
          <div className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Current Consumption Over Time (mA)</h2>
            <div className={styles.chart}>
              {chartData.map((data, index) => (
                <div key={index} className={styles.barWrapper}>
                  <div className={styles.barContainer}>
                    <div 
                      className={styles.bar} 
                      style={{ height: `${data.displayValue}%` }}
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