"use client";

import React, { useState } from 'react';
import { useAssessment } from '@/context/AssessmentContext';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SchemeMatchResult } from '@/types/assessment';
import { SchemeDetailModal } from './SchemeDetailModal';
import { GapRoadmap } from './components/GapRoadmap';
import styles from './results.module.css';

export default function ResultsPage() {
  const { matchResults, profile } = useAssessment();
  const [selectedScheme, setSelectedScheme] = useState<SchemeMatchResult | null>(null);

  if (!matchResults || matchResults.length === 0) {
    return (
      <div className={styles.page} style={{ textAlign: 'center', paddingTop: '8rem' }}>
        <h2 className={styles.title}>NO STRONG MATCH FOUND</h2>
        <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
          We couldn't identify a strong match from the available scheme information based on your current profile.
        </p>
        <Button variant="primary" onClick={() => window.history.back()}>&larr; Go Back & Edit Profile</Button>
      </div>
    );
  }

  // Sort results by best match
  const sortedResults = [...matchResults].sort((a, b) => {
    if (a.eligibility.isEligible === b.eligibility.isEligible) {
      if (a.matchScore === null && b.matchScore === null) return 0;
      if (a.matchScore === null) return 1;
      if (b.matchScore === null) return -1;
      return b.matchScore - a.matchScore;
    }
    return a.eligibility.isEligible ? -1 : 1;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your SCHEMORA Results</h1>
        <p className={styles.subtitle}>
          Here are the opportunities that best align with the information you provided for {profile.fullName || 'your business'}.
        </p>
      </div>

      <div className={styles.grid}>
        {sortedResults.map((result, idx) => (
          <Card key={result.scheme.id} hoverable>
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className={styles.matchScore}>
                  {result.matchScore !== null ? (
                    <>
                      {result.matchScore}% 
                      <span className={styles.matchLabel}>Match</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Match: Unavailable
                    </span>
                  )}
                </div>
                <Badge variant={result.eligibility.isEligible ? 'success' : 'error'}>
                  {result.eligibility.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                </Badge>
              </div>
              <h3 className={styles.schemeName}>{result.scheme.name}</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.keyBenefit}>
                {result.keyBenefitHighlight}
              </div>
              <p className={styles.schemeDesc}>{result.scheme.description}</p>
              {!result.eligibility.isEligible && (
                <GapRoadmap result={result} profile={profile} />
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="primary" 
                fullWidth 
                onClick={() => setSelectedScheme(result)}
              >
                View Details &rarr;
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedScheme && (
        <SchemeDetailModal 
          result={selectedScheme} 
          onClose={() => setSelectedScheme(null)} 
        />
      )}
    </div>
  );
}
