import React from 'react';

export const RobotIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Head / Shell */}
      <rect x="2" y="3" width="20" height="18" rx="6" fill="var(--text-primary)" />
      
      {/* Left Eye (Amber) */}
      <circle cx="8" cy="11" r="2" fill="var(--accent)" />
      
      {/* Right Eye (White) */}
      <circle cx="16" cy="11" r="2" fill="var(--bg-primary)" />
      
      {/* Subtle bottom vent line */}
      <rect x="9" y="16" width="6" height="1.5" rx="0.5" fill="var(--bg-primary)" opacity="0.6" />
    </svg>
  );
};
