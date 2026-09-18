import React from "react";
import styles from "./ConfidenceBadge.module.css";

export type ConfidenceState = "matched" | "needsInfo" | "notMatched" | "dataNotVerified";

interface ConfidenceBadgeProps {
  state: ConfidenceState;
  className?: string;
}

export function ConfidenceBadge({ state, className = "" }: ConfidenceBadgeProps) {
  let label = "Matched";
  let stateClass = styles.matched;

  switch (state) {
    case "matched":
      label = "High Confidence";
      stateClass = styles.matched;
      break;
    case "needsInfo":
      label = "Needs More Info";
      stateClass = styles.needsInfo;
      break;
    case "notMatched":
      label = "Not Matched";
      stateClass = styles.notMatched;
      break;
    case "dataNotVerified":
      label = "Data Not Verified";
      stateClass = styles.dataNotVerified;
      break;
  }

  return (
    <div className={`${styles.badge} ${stateClass} ${className}`}>
      <span className={styles.dot} />
      {label}
    </div>
  );
}
