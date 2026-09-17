import { describe, it, expect } from 'vitest';
import { 
  formatINR, 
  calculateEMI, 
  isSpecialCategory, 
  evaluateDeterministicEligibility,
  computeAIMatch
} from './engine';
import { UserProfile, Scheme } from '../types/assessment';
import { SCHEMES_DATABASE, DEMO_USER_PRESET } from '../data/schemes';

describe('engine.ts', () => {
  describe('formatINR', () => {
    it('formats numbers correctly', () => {
      expect(formatINR(800000).replace(/\s/g, ' ')).toMatch(/8,00,000/);
    });
  });

  describe('calculateEMI', () => {
    it('calculates EMI correctly without moratorium', () => {
      const result = calculateEMI(100000, 10, 1, 0);
      expect(result.netTenureMonths).toBe(12);
      expect(result.monthlyEMI).toBeGreaterThan(8700);
      expect(result.monthlyEMI).toBeLessThan(8800); 
    });

    it('calculates EMI correctly with moratorium', () => {
      const result = calculateEMI(100000, 10, 1, 6);
      expect(result.netTenureMonths).toBe(6);
      // Principal increases with moratorium
      expect(result.totalPayment).toBeGreaterThan(100000);
    });
    
    it('returns 0 for invalid inputs', () => {
      expect(calculateEMI(0, 10, 1, 0).monthlyEMI).toBe(0);
      expect(calculateEMI(100000, 0, 1, 0).monthlyEMI).toBe(0);
    });
  });

  describe('isSpecialCategory', () => {
    it('identifies special categories', () => {
      expect(isSpecialCategory({ category: 'sc', gender: 'male' } as UserProfile)).toBe(true);
      expect(isSpecialCategory({ category: 'general', gender: 'female' } as UserProfile)).toBe(true);
      expect(isSpecialCategory({ category: 'general', gender: 'male' } as UserProfile)).toBe(false);
    });
  });

  describe('evaluateDeterministicEligibility', () => {
    it('evaluates PMEGP correctly for demo user', () => {
      const pmegp = SCHEMES_DATABASE.find(s => s.id === 'pmegp-2024') as Scheme;
      const result = evaluateDeterministicEligibility(DEMO_USER_PRESET, pmegp);
      expect(result.isEligible).toBe(true);
      expect(result.failedRules.length).toBe(0);
      expect(result.calculatedSubsidyPercent).toBe(35); // Special category in rural area
    });

    it('fails when user is under minimum age', () => {
      const pmegp = SCHEMES_DATABASE.find(s => s.id === 'pmegp-2024') as Scheme;
      const underageProfile = { ...DEMO_USER_PRESET, age: 16 };
      const result = evaluateDeterministicEligibility(underageProfile, pmegp);
      expect(result.isEligible).toBe(false);
      expect(result.failedRules.some(r => r.includes('Age must be at least 18'))).toBe(true);
    });
  });

  describe('computeAIMatch', () => {
    it('scores highly for eligible user', () => {
      const pmegp = SCHEMES_DATABASE.find(s => s.id === 'pmegp-2024') as Scheme;
      const eligibility = evaluateDeterministicEligibility(DEMO_USER_PRESET, pmegp);
      const match = computeAIMatch(DEMO_USER_PRESET, pmegp, eligibility);
      
      expect(match.matchScore).toBeGreaterThan(70);
      expect(match.personalizedExplanation).toContain('margin money capital subsidy');
    });

    it('penalizes score heavily for failed rules', () => {
      const pmegp = SCHEMES_DATABASE.find(s => s.id === 'pmegp-2024') as Scheme;
      const ineligibleProfile = { ...DEMO_USER_PRESET, age: 16, projectCost: 100000000 };
      const eligibility = evaluateDeterministicEligibility(ineligibleProfile, pmegp);
      const match = computeAIMatch(ineligibleProfile, pmegp, eligibility);
      
      expect(match.matchScore).toBeLessThan(50); // penalized score
    });
  });
});
