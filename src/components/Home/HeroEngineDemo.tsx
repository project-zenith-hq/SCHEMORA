"use client";

import React, { useState, useEffect } from "react";
import styles from "./HeroEngineDemo.module.css";

const stages = ["PROFILE", "RETRIEVAL", "EVALUATION", "MATCH"];

export default function HeroEngineDemo() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % stages.length);
    }, 2500); // cycle every 2.5s
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.demoContainer}>
      <div className={styles.demoHeader}>
        <span>SCHEMORA_ENGINE_V1.0</span>
        <div className={styles.demoDots}>
          <div className={`${styles.demoDot} ${currentStage === 0 ? styles.active : ""}`} />
          <div className={`${styles.demoDot} ${currentStage === 1 ? styles.active : ""}`} />
          <div className={`${styles.demoDot} ${currentStage === 2 ? styles.active : ""}`} />
          <div className={`${styles.demoDot} ${currentStage === 3 ? styles.active : ""}`} />
        </div>
      </div>
      
      <div className={styles.demoBody}>
        {/* Sidebar Steps */}
        <div className={styles.demoSidebar}>
          {stages.map((stage, idx) => (
            <div 
              key={stage} 
              className={`${styles.demoStep} ${currentStage === idx ? styles.active : ""}`}
            >
              <div className={`${styles.stepIcon} ${currentStage > idx ? styles.completed : ""}`}>
                {currentStage > idx ? "✓" : ""}
              </div>
              {stage}
            </div>
          ))}
        </div>

        {/* Main Stage Content */}
        <div className={styles.demoMain}>
          
          {/* Stage 0: PROFILE */}
          <div className={`${styles.stage} ${currentStage === 0 ? styles.active : ""}`}>
            <div className={styles.stageTitle}>Ingesting Profile Data</div>
            <div className={styles.dataBlock}>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Sector</span>
                <span className={styles.dataValue}>Manufacturing</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Entity</span>
                <span className={styles.dataValue}>Proprietorship</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Age</span>
                <span className={styles.dataValue}>28</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Category</span>
                <span className={styles.dataValue}>General</span>
              </div>
            </div>
          </div>

          {/* Stage 1: RETRIEVAL */}
          <div className={`${styles.stage} ${currentStage === 1 ? styles.active : ""}`}>
            <div className={styles.stageTitle}>Vector Search</div>
            <div className={styles.dataBlock}>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Querying</span>
                <span className={styles.dataValue}>6 Active DBs</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Candidates</span>
                <span className={styles.dataValue}>142 Schemes</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.dataLabel}>Filtered</span>
                <span className={styles.dataValue}>12 Potential</span>
              </div>
            </div>
          </div>

          {/* Stage 2: EVALUATION */}
          <div className={`${styles.stage} ${currentStage === 2 ? styles.active : ""}`}>
            <div className={styles.stageTitle}>Running Rule Engine</div>
            <div className={styles.ruleCheck}>
              <div className={`${styles.ruleIcon} ${styles.pass}`}>✓</div>
              <div className={styles.ruleText}>Sector == 'Manufacturing' (Pass)</div>
            </div>
            <div className={styles.ruleCheck}>
              <div className={`${styles.ruleIcon} ${styles.pass}`}>✓</div>
              <div className={styles.ruleText}>Age &gt;= 18 (Pass)</div>
            </div>
            <div className={styles.ruleCheck}>
              <div className={`${styles.ruleIcon} ${styles.pending}`}></div>
              <div className={styles.ruleText}>Verifying PMEGP Guidelines...</div>
            </div>
          </div>

          {/* Stage 3: MATCH */}
          <div className={`${styles.stage} ${currentStage === 3 ? styles.active : ""}`}>
            <div className={styles.stageTitle}>Result</div>
            <div className={styles.matchCard}>
              <div className={styles.matchBadge}>HIGH CONFIDENCE</div>
              <div className={styles.matchTitle}>PMEGP</div>
              <div className={styles.matchTags}>
                <span className={styles.matchTag}>Manufacturing</span>
                <span className={styles.matchTag}>Subsidy</span>
              </div>
              <div className={styles.matchData}>
                <div className={styles.dataRow} style={{ margin: 0, flexDirection: 'column', gap: '4px' }}>
                  <span className={styles.dataLabel}>Max Support</span>
                  <span className={styles.dataValue}>₹50 Lakhs</span>
                </div>
                <div className={styles.dataRow} style={{ margin: 0, flexDirection: 'column', gap: '4px' }}>
                  <span className={styles.dataLabel}>Margin</span>
                  <span className={styles.dataValue}>15% - 35%</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
