import React, { useState } from "react";
import styles from "./ReasoningPanel.module.css";

export interface RuleEvaluation {
  id: string;
  rule: string;
  status: "passed" | "failed" | "needsInfo";
  detail?: string;
}

interface ReasoningPanelProps {
  evaluations: RuleEvaluation[];
}

export function ReasoningPanel({ evaluations }: ReasoningPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.panelContainer}>
      <button 
        className={styles.toggleBtn} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>Show engine reasoning</span>
        <svg 
          className={`${styles.icon} ${isOpen ? styles.open : ""}`} 
          width="12" height="12" viewBox="0 0 24 24" 
          fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.auditTrail}>
          <div className={styles.auditHeader}>
            <span>Evaluation Check</span>
            <span>Outcome</span>
          </div>
          
          <div className={styles.ruleList}>
            {evaluations.map((evalItem) => {
              const statusClass = evalItem.status === "passed" ? styles.passed
                                : evalItem.status === "failed" ? styles.failed
                                : styles.needsInfo;
                                
              const statusLabel = evalItem.status === "passed" ? "[PASSED]"
                                : evalItem.status === "failed" ? "[FAILED]"
                                : "[NEEDS INFO]";

              return (
                <div key={evalItem.id} className={styles.ruleRow}>
                  <div className={`${styles.statusLabel} ${statusClass}`}>
                    {statusLabel}
                  </div>
                  <div className={styles.ruleDesc}>
                    {evalItem.rule}
                    {evalItem.detail && (
                      <span className={styles.ruleDetail}>{evalItem.detail}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
