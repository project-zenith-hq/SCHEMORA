"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { JourneyTracker, JourneyStep } from "./JourneyTracker";

export function JourneyTrackerWrapper() {
  const pathname = usePathname();

  // Determine current step based on route
  let currentStep: JourneyStep | null = null;
  
  if (pathname.includes("/assessment")) {
    currentStep = "profile";
  } else if (pathname.includes("/explore")) {
    currentStep = "discovery";
  } else if (pathname.includes("/eligibility")) {
    currentStep = "eligibility";
  } else if (pathname.includes("/financial")) {
    currentStep = "financial";
  } else if (pathname.includes("/documents")) {
    currentStep = "documents";
  } else if (pathname.includes("/application")) {
    currentStep = "application";
  }

  // Only show the tracker on journey pages
  if (!currentStep) {
    return null;
  }

  return <JourneyTracker currentStep={currentStep} />;
}
