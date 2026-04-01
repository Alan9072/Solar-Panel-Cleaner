import React, { useEffect, useState } from "react";
import styles from "./System.module.css";
import { FaToggleOff, FaToggleOn, FaSpinner, FaMapMarkerAlt, FaWifi, FaMicrochip, FaClock } from "react-icons/fa";
import Header from "../../Components/Header/Header";
import Navbar from "../../Components/Navbar/Navbar";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const CLOUD_CONTROL_URL =
  import.meta.env.VITE_CLOUD_CONTROL_URL ||
  "https://0ezk16r0u1.execute-api.ap-south-1.amazonaws.com/control";

function System() {
  const [status, setStatus] = useState("OFF");
  const [isPolling, setIsPolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pollingRef = React.useRef(null); // Track active polling

  const loadSystemState = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/system-state`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      const currentState = String(data?.state || "OFF").toUpperCase();
      return currentState;
    } catch (err) {
      console.error("Load state error:", err);
      return null;
    }
  };

  // Poll cloud API for 80 seconds in background
  const pollCloudAPI = async (desiredState, pollId) => {
    const maxAttempts = 80;
    
    console.log(`🔄 [Poll ${pollId}] Background polling started - Target: ${desiredState}`);
    
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      // Check if this polling was cancelled
      if (pollingRef.current !== pollId) {
        console.log(`❌ [Poll ${pollId}] Cancelled - New polling started`);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const res = await fetch(CLOUD_CONTROL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: desiredState.toLowerCase() }),
        });
        const data = await res.json();
        const espState = data?.data?.state ? String(data.data.state).toUpperCase() : "UNKNOWN";
        
        console.log(`📡 [Poll ${pollId}] [${attempts + 1}s] ESP State: ${espState} | Target: ${desiredState}`);
        
        if (espState === desiredState) {
          console.log(`✅ [Poll ${pollId}] SUCCESS at ${attempts + 1}s - ESP confirmed ${desiredState}`);
          if (pollingRef.current === pollId) {
            setIsPolling(false);
          }
          return;
        }
      } catch (err) {
        console.error(`[Poll ${pollId}] [${attempts + 1}s] Cloud API error:`, err);
      }
    }
    
    console.warn(`⚠️ [Poll ${pollId}] Timeout after 80 seconds`);
    if (pollingRef.current === pollId) {
      setIsPolling(false);
    }
  };

  const toggleSystem = async () => {
    const currentState = status;
    const newState = status === "ON" ? "OFF" : "ON";
    
    // Cancel any existing polling
    const newPollId = Date.now();
    pollingRef.current = newPollId;
    
    // 1. Immediately change button UI
    setStatus(newState);

    try {
      // 2. Update database
      await fetch(`${API_BASE}/api/system-state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ state: newState }),
      });

      console.log(`✓ Button: ${newState}, Database: Updated`);
      
      // 3. Start new background polling (cancels previous)
      setIsPolling(true);
      pollCloudAPI(newState, newPollId);
    } catch (err) {
      console.error("API Error:", err);
      setStatus(currentState);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadSystemState().then(state => {
      if (state) setStatus(state);
      setIsLoading(false);
    });
  }, []);

  const isOn = status === "ON";

  return (
    <div className={styles.container}>
      <Header />

      {/* Info Cards */}
      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <FaMapMarkerAlt className={styles.infoIcon} />
          <div className={styles.infoLabel}>Location</div>
          <div className={styles.infoValue}>AWS ap-south-1</div>
        </div>
        
        <div className={styles.infoCard}>
          <FaMicrochip className={styles.infoIcon} />
          <div className={styles.infoLabel}>Mode</div>
          <div className={styles.infoValue}>Active</div>
        </div>
        
        <div className={styles.infoCard}>
          <FaWifi className={styles.infoIcon} />
          <div className={styles.infoLabel}>Connection</div>
          <div className={styles.infoValue}>{isLoading ? "Loading..." : isPolling ? "Syncing" : "Connected"}</div>
        </div>
        
        <div className={styles.infoCard}>
          <FaClock className={styles.infoIcon} />
          <div className={styles.infoLabel}>Status</div>
          <div className={styles.infoValue}>{isLoading ? "Loading..." : status}</div>
        </div>
      </div>

      {/* Power Button */}
      <div
        className={`${styles.powerBtn} ${isLoading ? '' : isOn ? styles.on : styles.off}`}
        onClick={isLoading ? undefined : toggleSystem}
        style={{ 
          cursor: isLoading ? 'not-allowed' : 'pointer', 
          backgroundColor: isLoading ? '#808080' : undefined 
        }}
      >
        {isLoading || isPolling ? (
          <FaSpinner className={styles.spinner} />
        ) : isOn ? (
          <FaToggleOn className={styles.icon} />
        ) : (
          <FaToggleOff className={styles.icon} />
        )}
      </div>

      <p className={`${styles.status} ${isOn ? styles.onText : styles.offText}`}>
        {isLoading ? (
          <>
            <span className={styles.statusMain}>LOADING...</span>
            <span className={styles.statusSub}>Fetching system status</span>
          </>
        ) : isPolling ? (
          <>
            <span className={styles.statusMain}>SYNCHRONIZING...</span>
            <span className={styles.statusSub}>Connecting to ESP Device</span>
          </>
        ) : isOn ? (
          <>
            <span className={styles.statusMain}>✓ SYSTEM OPERATIONAL</span>
            <span className={styles.statusSub}>All systems running normally</span>
          </>
        ) : (
          <>
            <span className={styles.statusMain}>⚠ SYSTEM OFFLINE</span>
            <span className={styles.statusSub}>Press button to activate</span>
          </>
        )}
      </p>
      <Navbar />
    </div>
  );
}

export default System;
