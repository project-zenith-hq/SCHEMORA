"use client";

import { useState, useEffect } from 'react';
import styles from '../app/page.module.css';

const TELEMETRY_STATES = [
  "IDENTIFYING",
  "MATCHING",
  "VERIFYING",
  "GUIDING",
  "EMPOWERING"
];

export default function HeroTelemetry() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % TELEMETRY_STATES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.hudLeft}>
      {TELEMETRY_STATES.map((state, index) => {
        const isActive = index === activeIndex;
        return (
          <div 
            key={state} 
            className={`${styles.hudItem} ${isActive ? styles.hudItemActive : ''}`}
          >
            {isActive && <span className={styles.hudPulse}></span>}
            {state}
          </div>
        );
      })}
    </div>
  );
}
