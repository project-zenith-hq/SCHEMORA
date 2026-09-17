"use client";

import { useEffect, useState } from 'react';
import styles from '../app/page.module.css';

export default function HeroBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.heroBackground}>
      {/* Layer 2: Subtle Atmospheric Gradient */}
      <div className={styles.atmosphericGlow}></div>

      {/* Layer 3: Technical Grid */}
      <div className={styles.perspectiveGrid}></div>

      {/* Layer 4: Intelligence Network — Monochrome */}
      <div className={styles.intelligenceField}>
        <svg viewBox="0 0 800 800" className={styles.indiaMesh} preserveAspectRatio="xMidYMid meet">
          {/* Abstract Geometric Wireframe */}
          <path 
            d="M350,150 L450,180 L520,300 L550,450 L480,550 L400,700 L350,650 L280,550 L250,400 L280,250 Z" 
            fill="none" 
            stroke="rgba(255,255,255,0.08)" 
            strokeWidth="0.5" 
            strokeDasharray="4 4"
            className={styles.animatedPath}
          />
          
          {/* Internal Connection Lines — white/gray */}
          <g stroke="rgba(255,255,255,0.06)" strokeWidth="0.25">
            <line x1="350" y1="150" x2="400" y2="350" />
            <line x1="450" y1="180" x2="400" y2="350" />
            <line x1="520" y1="300" x2="400" y2="350" />
            <line x1="280" y1="250" x2="400" y2="350" />
            
            <line x1="400" y1="350" x2="420" y2="500" />
            <line x1="550" y1="450" x2="420" y2="500" />
            <line x1="250" y1="400" x2="420" y2="500" />
            <line x1="280" y1="550" x2="420" y2="500" />
            
            <line x1="420" y1="500" x2="400" y2="700" />
            <line x1="480" y1="550" x2="400" y2="700" />
          </g>

          {/* Grid Structure Lines */}
          <g stroke="rgba(255,255,255,0.03)" strokeWidth="0.5">
            <line x1="200" y1="200" x2="600" y2="200" />
            <line x1="200" y1="400" x2="600" y2="400" />
            <line x1="200" y1="600" x2="600" y2="600" />
            <line x1="300" y1="100" x2="300" y2="700" />
            <line x1="500" y1="100" x2="500" y2="700" />
          </g>

          {/* Intelligence Nodes — subtle white dots */}
          <circle cx="350" cy="150" r="1.5" fill="rgba(255,255,255,0.2)" className={styles.pulseNode} style={{animationDelay: '0s'}} />
          <circle cx="450" cy="180" r="1" fill="rgba(255,255,255,0.15)" className={styles.pulseNode} style={{animationDelay: '1s'}} />
          <circle cx="520" cy="300" r="1.5" fill="rgba(255,255,255,0.2)" className={styles.pulseNode} style={{animationDelay: '2s'}} />
          <circle cx="550" cy="450" r="1" fill="rgba(255,255,255,0.15)" className={styles.pulseNode} style={{animationDelay: '0.5s'}} />
          <circle cx="480" cy="550" r="1" fill="rgba(255,255,255,0.15)" className={styles.pulseNode} style={{animationDelay: '1.5s'}} />
          <circle cx="400" cy="700" r="2" fill="rgba(255,255,255,0.2)" className={styles.pulseNode} style={{animationDelay: '2.5s'}} />
          <circle cx="280" cy="550" r="1" fill="rgba(255,255,255,0.15)" className={styles.pulseNode} style={{animationDelay: '0.8s'}} />
          <circle cx="250" cy="400" r="1.5" fill="rgba(255,255,255,0.2)" className={styles.pulseNode} style={{animationDelay: '1.8s'}} />
          <circle cx="280" cy="250" r="1" fill="rgba(255,255,255,0.15)" className={styles.pulseNode} style={{animationDelay: '0.2s'}} />
          
          {/* Core Processor Nodes */}
          <circle cx="400" cy="350" r="3" fill="rgba(255,255,255,0.08)" className={styles.pulseNodeLarge} />
          <circle cx="420" cy="500" r="2.5" fill="rgba(255,255,255,0.06)" className={styles.pulseNodeLarge} style={{animationDelay: '1s'}} />
        </svg>

        {/* Subtle Data Flow Lines */}
        <div className={`${styles.dataStream} ${styles.stream1}`}></div>
        <div className={`${styles.dataStream} ${styles.stream2}`}></div>
        <div className={`${styles.dataStream} ${styles.stream3}`}></div>
      </div>
    </div>
  );
}
