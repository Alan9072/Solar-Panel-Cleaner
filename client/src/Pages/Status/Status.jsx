import React, { useState, useEffect } from 'react'
import Navbar from '../../Components/Navbar/Navbar'
import styles from './Status.module.css'
import Header from '../../Components/Header/Header'

const TELEMETRY_API_URL = import.meta.env.VITE_TELEMETRY_API_URL || 'https://ri97neft0k.execute-api.ap-south-1.amazonaws.com/telemetry';
const INSPECTION_API_URL = 'https://esp32-solarimg.s3.ap-south-1.amazonaws.com/inspection-result.json';

function Status() {
  const [telemetryData, setTelemetryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [inspectionResult, setInspectionResult] = useState(null)
  
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
    fetchInspectionResult();
  };

  const fetchInspectionResult = async () => {
    try {
      const response = await fetch(INSPECTION_API_URL + '?t=' + Date.now())
      const result = await response.json()
      setInspectionResult(result)
    } catch (err) {
      console.error('Inspection fetch error:', err)
    }
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
    fetchInspectionResult()
    // Refresh data every 20 seconds
    const interval = setInterval(() => {
      fetchTelemetry(true)
      fetchInspectionResult()
    }, 20000)
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
        {/* <h1 className={styles.title}>Device Telemetry Status</h1> */}
        
        {loading && !telemetryData && (
          <>
            {/* Telemetry Card Skeleton */}
            <div className={styles.telemetryCard}>
              <div className={styles.deviceInfo}>
                <div className={`${styles.skeletonBox} ${styles.skeletonTitle}`}></div>
                <div className={`${styles.skeletonBox} ${styles.skeletonText}`}></div>
              </div>
              <div className={styles.metricsGrid}>
                {[1, 2, 3].map((i) => (
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
            </div>
          </div>
        )}

        {/* Live Camera Feed Section */}
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            {/* Corner Labels - Red if blocked (true), Green if clean (false) */}
            <span className={`${styles.cornerLabel} ${styles.topLeft} ${inspectionResult?.lu ? styles.blocked : styles.clean}`}>
              LU {inspectionResult?.lu ? '🔴' : '🟢'}
            </span>
            <span className={`${styles.cornerLabel} ${styles.topRight} ${inspectionResult?.ru ? styles.blocked : styles.clean}`}>
              RU {inspectionResult?.ru ? '🔴' : '🟢'}
            </span>
            <span className={`${styles.cornerLabel} ${styles.bottomLeft} ${inspectionResult?.ld ? styles.blocked : styles.clean}`}>
              LD {inspectionResult?.ld ? '🔴' : '🟢'}
            </span>
            <span className={`${styles.cornerLabel} ${styles.bottomRight} ${inspectionResult?.rd ? styles.blocked : styles.clean}`}>
              RD {inspectionResult?.rd ? '🔴' : '🟢'}
            </span>

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

        {/* Inspection Details Section */}
        {inspectionResult && (
          <div className={styles.inspectionDetails}>
            <h2 className={styles.inspectionTitle}>Panel Inspection Report</h2>
            
            <div className={styles.inspectionSummary}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>
                  {(() => {
                    const blockedCount = [inspectionResult.lu, inspectionResult.ru, inspectionResult.ld, inspectionResult.rd].filter(Boolean).length;
                    if (blockedCount === 0) return '✅';
                    if (blockedCount <= 2) return '⚠️';
                    return '❌';
                  })()}
                </div>
                <div className={styles.summaryContent}>
                  <h3 className={styles.summaryLabel}>Overall Status</h3>
                  <p className={styles.summaryValue}>
                    {(() => {
                      const blockedCount = [inspectionResult.lu, inspectionResult.ru, inspectionResult.ld, inspectionResult.rd].filter(Boolean).length;
                      if (blockedCount === 0) return 'All Clear';
                      if (blockedCount <= 2) return 'Needs Attention';
                      return 'Critical - Cleaning Required';
                    })()}
                  </p>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>📊</div>
                <div className={styles.summaryContent}>
                  <h3 className={styles.summaryLabel}>Blocked Corners</h3>
                  <p className={styles.summaryValue}>
                    {[inspectionResult.lu, inspectionResult.ru, inspectionResult.ld, inspectionResult.rd].filter(Boolean).length} / 4
                  </p>
                </div>
              </div>

            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <h4 className={styles.detailHeader}>Corner Status</h4>
                <div className={styles.detailList}>
                  <div className={`${styles.detailItem} ${inspectionResult.lu ? styles.statusBlocked : styles.statusClean}`}>
                    <span className={styles.detailLabel}>Left Upper (LU):</span>
                    <span className={styles.detailStatus}>
                      {inspectionResult.lu ? '🔴 Blocked' : '🟢 Clean'}
                    </span>
                  </div>
                  <div className={`${styles.detailItem} ${inspectionResult.ru ? styles.statusBlocked : styles.statusClean}`}>
                    <span className={styles.detailLabel}>Right Upper (RU):</span>
                    <span className={styles.detailStatus}>
                      {inspectionResult.ru ? '🔴 Blocked' : '🟢 Clean'}
                    </span>
                  </div>
                  <div className={`${styles.detailItem} ${inspectionResult.ld ? styles.statusBlocked : styles.statusClean}`}>
                    <span className={styles.detailLabel}>Left Down (LD):</span>
                    <span className={styles.detailStatus}>
                      {inspectionResult.ld ? '🔴 Blocked' : '🟢 Clean'}
                    </span>
                  </div>
                  <div className={`${styles.detailItem} ${inspectionResult.rd ? styles.statusBlocked : styles.statusClean}`}>
                    <span className={styles.detailLabel}>Right Down (RD):</span>
                    <span className={styles.detailStatus}>
                      {inspectionResult.rd ? '🔴 Blocked' : '🟢 Clean'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detailCard}>
                <h4 className={styles.detailHeader}>Additional Information</h4>
                <div className={styles.detailList}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Object Above Panel:</span>
                    <span className={`${styles.detailStatus} ${inspectionResult.object_above ? styles.statusWarning : styles.statusClean}`}>
                      {inspectionResult.object_above ? '⚠️ Detected' : '✅ None'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Image Source:</span>
                    <span className={styles.detailStatus}>{inspectionResult.image_file}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Last Inspection:</span>
                    <span className={styles.detailStatus}>
                      {new Date(inspectionResult.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Status