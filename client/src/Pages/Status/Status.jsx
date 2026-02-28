import React, { useState, useEffect } from 'react'
import Navbar from '../../Components/Navbar/Navbar'
import styles from './Status.module.css'
import Header from '../../Components/Header/Header'

const TELEMETRY_API_URL = import.meta.env.VITE_TELEMETRY_API_URL || 'https://ri97neft0k.execute-api.ap-south-1.amazonaws.com/telemetry';

function Status() {
  const [telemetryData, setTelemetryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [chartData, setChartData] = useState([]);
  
  // Image viewer states
  const [timestamp, setTimestamp] = useState(Date.now());
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const baseImageUrl = 'https://esp32-solarimg.s3.ap-south-1.amazonaws.com/current-panel.jpg';
  const imageUrl = `${baseImageUrl}?t=${timestamp}`;

  // Image handling functions
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleRefreshImage = () => {
    setTimestamp(Date.now());
    setImageError(false);
    setImageLoading(true);
  };

  const fetchTelemetry = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      
      const startTime = Date.now()
      
      // Fetch current telemetry data
      const response = await fetch(TELEMETRY_API_URL)
      const result = await response.json()
      
      // Fetch historical data for chart (last 10 records)
      const historyResponse = await fetch(`${TELEMETRY_API_URL}?limit=10`)
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
              power: parseFloat(item.power_W.toFixed(2)),
              current: parseFloat(item.current_mA.toFixed(2)),
              voltage: parseFloat(item.voltage.toFixed(4)),
              timestamp: item.timestamp
            }
          }).reverse() // Reverse to show oldest to newest
          
          setChartData(formattedChartData)
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
    // Refresh data and chart every 20 seconds
    const interval = setInterval(() => fetchTelemetry(true), 20000)
    return () => clearInterval(interval)
  }, [])

  // Auto-refresh image every 5 seconds
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setTimestamp(Date.now());
      setImageLoading(true);
    }, 5000);
    
    return () => clearInterval(imageInterval);
  }, []);

  return (
    <div>
      <Header />
      <Navbar/>
      <div className={styles.statusContainer}>
        <h1 className={styles.title}>Device Telemetry Status</h1>
        
        {loading && !telemetryData && (
          <>
            {/* Telemetry Card Skeleton */}
            <div className={styles.telemetryCard}>
              <div className={styles.deviceInfo}>
                <div className={`${styles.skeletonBox} ${styles.skeletonTitle}`}></div>
                <div className={`${styles.skeletonBox} ${styles.skeletonText}`}></div>
              </div>
              <div className={styles.metricsGrid}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={styles.metricCard}>
                    <div className={`${styles.skeletonBox} ${styles.skeletonIcon}`}></div>
                    <div className={`${styles.skeletonBox} ${styles.skeletonLabel}`}></div>
                    <div className={`${styles.skeletonBox} ${styles.skeletonValue}`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Section Skeleton */}
            <div className={styles.imageSection}>
              <div className={styles.imageContainer}>
                <div className={`${styles.skeletonBox} ${styles.skeletonImage}`}></div>
              </div>
              <div className={styles.live}>
                <div className={styles.liveStatus}>
                  <div className={`${styles.skeletonBox} ${styles.skeletonDot}`}></div>
                  <div className={`${styles.skeletonBox} ${styles.skeletonText}`}></div>
                </div>
                <div className={`${styles.skeletonBox} ${styles.skeletonButton}`}></div>
              </div>
            </div>

            {/* Chart Section Skeleton */}
            <div className={styles.chartSection}>
              <div className={`${styles.skeletonBox} ${styles.skeletonChartTitle}`}></div>
              <div className={`${styles.skeletonBox} ${styles.skeletonChart}`}></div>
            </div>
          </>
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

        {/* Live Camera Feed Section */}
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            {imageLoading && !imageError && (
              <div className={styles.loadingOverlay}>
                <div className={styles.loadingText}>
                  Updating...
                </div>
              </div>
            )}

            {imageError && (
              <div className={styles.errorContainer}>
                <p className={styles.errorTitle}>
                  Failed to load image
                </p>
                <p className={styles.errorMessage}>
                  Please check your connection or refresh the page
                </p>
              </div>
            )}

            <img 
              src={imageUrl} 
              alt="Current Solar Panel"
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`${styles.panelImage} ${imageError ? styles.panelImageHidden : ''}`}
            />
          </div>
          <div className={styles.live}>
            <div className={styles.liveStatus}>
              <span className={styles.liveDot}></span>
              <p>Live Camera Feed</p>
            </div>
            <button onClick={handleRefreshImage} className={styles.refreshButton}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Chart Section */}
        {telemetryData && chartData.length > 0 && (
          <div className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Telemetry Over Time</h2>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.powerLine}`}></span>
                <span>Power (W)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.currentLine}`}></span>
                <span>Current (mA)</span>
              </div>
            </div>
            <div className={styles.lineChartContainer}>
              {/* Calculate ranges for axis labels */}
              {(() => {
                const powerValues = chartData.map(item => item.power)
                const currentValues = chartData.map(item => item.current)
                
                const maxPower = Math.max(...powerValues)
                const minPower = Math.min(...powerValues)
                const maxCurrent = Math.max(...currentValues)
                const minCurrent = Math.min(...currentValues)
                
                // Add 20% padding to ranges for better visualization
                const powerPadding = (maxPower - minPower) * 0.2 || 0.5
                const currentPadding = (maxCurrent - minCurrent) * 0.2 || 5
                
                const powerMin = Math.max(0, minPower - powerPadding)
                const powerMax = maxPower + powerPadding
                const currentMin = Math.max(0, minCurrent - currentPadding)
                const currentMax = maxCurrent + currentPadding
                
                // Create axis labels (5 levels)
                const powerLabels = []
                const currentLabels = []
                for (let i = 4; i >= 0; i--) {
                  powerLabels.push((powerMin + (powerMax - powerMin) * (i / 4)).toFixed(2))
                  currentLabels.push((currentMin + (currentMax - currentMin) * (i / 4)).toFixed(1))
                }
                
                return (
                  <>
                    {/* Left Y-axis (Current/Voltage) */}
                    <div className={styles.yAxisLeft}>
                      {currentLabels.map((label, idx) => (
                        <span key={idx} className={styles.yLabel}>{label}</span>
                      ))}
                    </div>
                    
                    <div className={styles.chartArea}>
                      <svg className={styles.lineChart} viewBox="0 0 500 200" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1="0" y1="10" x2="500" y2="10" stroke="#e0e0e0" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                        <line x1="0" y1="55" x2="500" y2="55" stroke="#e0e0e0" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                        <line x1="0" y1="100" x2="500" y2="100" stroke="#e0e0e0" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                        <line x1="0" y1="145" x2="500" y2="145" stroke="#e0e0e0" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                        <line x1="0" y1="190" x2="500" y2="190" stroke="#e0e0e0" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                        
                        {/* Power Line (Right axis scale) */}
                        <polyline
                          points={chartData.map((d, i) => {
                            const x = (i / Math.max(chartData.length - 1, 1)) * 500
                            const range = powerMax - powerMin
                            const normalized = range > 0 ? (d.power - powerMin) / range : 0.5
                            const y = 190 - (normalized * 180) + 5
                            return `${x},${y}`
                          }).join(' ')}
                          fill="none"
                          stroke="#667eea"
                          strokeWidth="2.5"
                          vectorEffect="non-scaling-stroke"
                        />
                        
                        {/* Current Line (Left axis scale) */}
                        <polyline
                          points={chartData.map((d, i) => {
                            const x = (i / Math.max(chartData.length - 1, 1)) * 500
                            const range = currentMax - currentMin
                            const normalized = range > 0 ? (d.current - currentMin) / range : 0.5
                            const y = 190 - (normalized * 180)
                            return `${x},${y}`
                          }).join(' ')}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </div>
                    
                    {/* Right Y-axis (Power) */}
                    <div className={styles.yAxisRight}>
                      {powerLabels.map((label, idx) => (
                        <span key={idx} className={styles.yLabel}>{label}</span>
                      ))}
                    </div>
                  </>
                )
              })()}
            </div>
            <div className={styles.axisLabels}>
              <span className={styles.axisLabelLeft}>Current (mA)</span>
              <span className={styles.axisLabelRight}>Power (W)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Status