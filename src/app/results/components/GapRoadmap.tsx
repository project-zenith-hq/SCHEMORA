import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SchemeMatchResult, UserProfile } from '@/types/assessment';
import { useTranslation } from '@/context/TranslationContext';
import styles from './GapRoadmap.module.css';

interface GapRoadmapProps {
  result: SchemeMatchResult;
  profile: UserProfile;
}

export const GapRoadmap: React.FC<GapRoadmapProps> = ({ result, profile }) => {
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useTranslation();

  const fetchRoadmap = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeName: result.scheme.name,
          failedRules: result.eligibility.failedRules,
          profile,
          language
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setRoadmap(data.roadmap);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setRoadmap("We couldn't generate a roadmap right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Do not render anything if the scheme is eligible (should be handled by parent, but just in case)
  if (result.eligibility.isEligible) return null;

  return (
    <div className={styles.container}>
      <h4 className={styles.heading}>Why are you not eligible?</h4>
      
      {result.dataNotVerified ? (
        <div className={styles.unverifiedMessage}>
          We don't yet have complete eligibility criteria for this scheme to generate a personalized roadmap.
        </div>
      ) : (
        <>
          <ul className={styles.gapsList}>
            {result.eligibility.failedRules.map((rule, idx) => (
              <li key={idx} className={styles.gapItem}>{rule}</li>
            ))}
          </ul>

          {!roadmap && (
            <Button 
              variant="outline" 
              onClick={fetchRoadmap}
              disabled={isLoading}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              {isLoading ? 'Generating Roadmap...' : 'How do I become eligible?'}
            </Button>
          )}

          {roadmap && (
            <div className={styles.roadmapContainer}>
              <h5 className={styles.roadmapTitle}>Eligibility Gap Roadmap</h5>
              <div className={styles.roadmapText}>{roadmap}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
