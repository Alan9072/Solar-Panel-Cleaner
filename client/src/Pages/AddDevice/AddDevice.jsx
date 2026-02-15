import React, { useState, useEffect } from 'react'
import NavBar from '../../Components/Navbar/Navbar'
import styles from './AddDevice.module.css'
import Header from '../../Components/Header/Header';

function AddDevice() {
  const [timestamp, setTimestamp] = useState(Date.now());
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const baseImageUrl = 'https://esp32-solarimg.s3.ap-south-1.amazonaws.com/current-panel.jpg';
  const imageUrl = `${baseImageUrl}?t=${timestamp}`;

  // Auto-refresh image every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
      setLoading(true);
    }, 5000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleImageLoad = () => {
    setLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setImageError(true);
  };

  const handleRefresh = () => {
    setTimestamp(Date.now());
    setImageError(false);
    setLoading(true);
  };

  return (
    <div>
      <NavBar/>
      <Header/>
      <div className={styles.container}>        

        {/* Image Container Section */}
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            {loading && !imageError && (
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
              <p>Live Updating</p>
            </div>
            <button onClick={handleRefresh} className={styles.refreshButton}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Refresh
            </button>
          </div>
          
        </div>

        {/* Details Section */}
        <div className={styles.detailsSection}>
          <h2 className={styles.detailsTitle}>
            System Details
          </h2>
          
          <div className={styles.detailsGrid}>
            <div className={styles.detailCard}>
              <h3 className={`${styles.detailCardTitle} ${styles.detailCardTitleGreen}`}>
                Auto-Refresh
              </h3>
              <p className={styles.detailCardText}>
                Image updates every 5 seconds automatically
              </p>
            </div>

            <div className={styles.detailCard}>
              <h3 className={`${styles.detailCardTitle} ${styles.detailCardTitleBlue}`}>
                Camera Source
              </h3>
              <p className={styles.detailCardText}>
                ESP32-CAM Module
              </p>
            </div>

            <div className={styles.detailCard}>
              <h3 className={`${styles.detailCardTitle} ${styles.detailCardTitleOrange}`}>
                Storage
              </h3>
              <p className={styles.detailCardText}>
                AWS S3 (ap-south-1)
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AddDevice