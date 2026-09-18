import React from "react";
import styles from "./JourneyTracker.module.css";

export type JourneyStep = 
  | "profile"
  | "discovery"
  | "eligibility"
  | "financial"
  | "documents"
  | "application";

const STEPS: { id: JourneyStep; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "discovery", label: "Discovery" },
  { id: "eligibility", label: "Eligibility" },
  { id: "financial", label: "Financial" },
  { id: "documents", label: "Documents" },
  { id: "application", label: "Application" }
];

interface JourneyTrackerProps {
  currentStep: JourneyStep;
}

export function JourneyTracker({ currentStep }: JourneyTrackerProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className={styles.trackerContainer}>
      <ul className={styles.trackerList}>
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          
          let itemClass = styles.stepItem;
          if (isCompleted) itemClass += ` ${styles.completed}`;
          if (isActive) itemClass += ` ${styles.active}`;

          return (
            <li key={step.id} className={itemClass}>
              <div className={styles.stepNode}>
                {isCompleted ? "✓" : (idx + 1)}
              </div>
              <div className={styles.stepLabel}>{step.label}</div>
              {idx < STEPS.length - 1 && <div className={styles.connector} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
