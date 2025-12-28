import React, { useState } from "react";
import styles from "./System.module.css";
import { FaToggleOff, FaToggleOn } from "react-icons/fa"; // icons for OFF and ON
import Header from "../../Components/Header/Header";
import Navbar from "../../Components/Navbar/Navbar";

const API_URL = "https://0ezk16r0u1.execute-api.ap-south-1.amazonaws.com/control";

function System() {
  const [status, setStatus] = useState("OFF");
  const [loading, setLoading] = useState(false);

  const toggleSystem = async () => {
    const newState = status === "ON" ? "off" : "on";
    setLoading(true);

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: newState }),
      });
      setStatus(newState.toUpperCase());
    } catch (err) {
      console.error("API Error:", err);
    }

    setLoading(false);
  };

  const isOn = status === "ON";

  return (
    <div className={styles.container}>
      <Header />
      <h2 className={styles.title}>SYSTEM CONTROL</h2>

      <div
        className={`${styles.powerBtn} ${isOn ? styles.on : styles.off}`}
        onClick={toggleSystem}
      >
        {isOn ? (
          <FaToggleOn className={styles.icon} />
        ) : (
          <FaToggleOff className={styles.icon} />
        )}
      </div>

      <p className={`${styles.status} ${isOn ? styles.onText : styles.offText}`}>
        {loading ? "PROCESSING..." : `SYSTEM ${status}`}
      </p>
      <Navbar />
    </div>
  );
}

export default System;
