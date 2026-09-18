import React from 'react';
import { Scheme } from '@/types/assessment';
import { useTranslation } from '@/context/TranslationContext';
import styles from './SchemeDetailModal.module.css';
import SchemeEligibilityModal from './SchemeEligibilityModal';
import { useState } from 'react';

interface SchemeDetailModalProps {
  scheme: Scheme;
  onClose: () => void;
}

export default function SchemeDetailModal({ scheme, onClose }: SchemeDetailModalProps) {
  const { t } = useTranslation();
  const [showEligibility, setShowEligibility] = useState(false);

  const formatAmount = (amount?: number) => {
    if (!amount) return 'Not specified in current data';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  if (showEligibility) {
    return <SchemeEligibilityModal scheme={scheme} onClose={() => setShowEligibility(false)} onExit={onClose} />;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div>
            <div className={styles.ministry}>{scheme.ministry || 'Not specified in current data'}</div>
            <h2 className={styles.title}>{scheme.name}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.tagline}>{scheme.tagline || 'Not specified in current data'}</div>
          
          <div className={styles.ctaSection}>
            {scheme.needsVerification && (
              <div className={styles.verificationAlert}>
                ⚠️ <strong>Data Pending Verification:</strong> {scheme.verificationNote || "This scheme's full eligibility rules and financial terms require official source lookup."}
              </div>
            )}
            <button className={styles.primaryBtn} onClick={() => setShowEligibility(true)}>
              Check if you're eligible for this scheme
            </button>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Overview</h3>
            <p className={styles.text}>{scheme.description || 'Not specified in current data'}</p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Target Beneficiaries</h3>
            <p className={styles.text}>{scheme.whoItIsFor || 'Not specified in current data'}</p>
          </div>

          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <div className={styles.gridLabel}>Loan Limit</div>
              <div className={styles.gridValue}>
                {scheme.maxFundingAmount ? `Up to ${formatAmount(scheme.maxFundingAmount)}` : 'Not specified'}
              </div>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.gridLabel}>Interest Rate</div>
              <div className={styles.gridValue}>
                {scheme.interestRateMin ? `${scheme.interestRateMin}% - ${scheme.interestRateMax}%` : 'Not specified'}
              </div>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.gridLabel}>Repayment Tenure</div>
              <div className={styles.gridValue}>
                {scheme.repaymentTenureYears ? `${scheme.repaymentTenureYears} Years` : 'Not specified'}
              </div>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.gridLabel}>Moratorium</div>
              <div className={styles.gridValue}>
                {scheme.moratoriumMonths ? `${scheme.moratoriumMonths} Months` : 'Not specified'}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Required Documents</h3>
            {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? (
              <ul className={styles.list}>
                {scheme.requiredDocuments.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.text}>Not specified in current data</p>
            )}
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Application Process</h3>
            {scheme.applicationSteps && scheme.applicationSteps.length > 0 ? (
              <ol className={styles.list}>
                {scheme.applicationSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className={styles.text}>Not specified in current data</p>
            )}
          </div>
          
          <div className={styles.footerInfo}>
            <div className={styles.confidenceIndicator} style={{ color: scheme.needsVerification ? 'var(--text-secondary)' : 'var(--status-success, #10b981)' }}>
              <span className={styles.indicatorDot} style={{ backgroundColor: scheme.needsVerification ? 'var(--accent)' : 'currentColor' }}></span> 
              {scheme.needsVerification ? 'Data pending official verification' : 'Data verified from official sources'}
            </div>
            {scheme.officialPortalUrl && (
              <a href={scheme.officialPortalUrl} target="_blank" rel="noreferrer" className={styles.sourceLink}>
                Visit Official Portal &rarr;
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
