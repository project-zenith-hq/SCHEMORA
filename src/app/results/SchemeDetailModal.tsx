import React, { useState, useRef, useEffect } from 'react';
import { SchemeMatchResult } from '@/types/assessment';
import { formatINR, calculateEMI } from '@/lib/engine';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAssessment } from '@/context/AssessmentContext';
import { useTranslation } from '@/context/TranslationContext';
import styles from './results.module.css';

interface Props {
  result: SchemeMatchResult;
  onClose: () => void;
}

export function SchemeDetailModal({ result, onClose }: Props) {
  const { scheme, eligibility } = result;
  const [calcLoan, setCalcLoan] = useState<number>((scheme.maxFundingAmount || 100000) / 2);
  const [calcRate, setCalcRate] = useState<number>(scheme.interestRateMin || 8.0);
  const [calcTenure, setCalcTenure] = useState<number>(scheme.repaymentTenureYears || 5);

  const emiData = calculateEMI(calcLoan, calcRate, calcTenure);

  const { profile } = useAssessment();
  const { language } = useTranslation();

  const [chatMessages, setChatMessages] = useState<{sender: 'user' | 'ai', text: string}[]>([
    { sender: 'ai', text: `Hi! I'm SCHEMORA Assistant. I can help you understand ${scheme.name}, check your eligibility, explain requirements, discuss documents and guide you through the next steps.` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isLoading]);

  const SUGGESTED_QUESTIONS = [
    "Am I eligible for this scheme?",
    "Why am I not eligible?",
    "What documents do I need?",
    "How do I apply?",
    "What requirement am I missing?",
    "Explain this scheme simply"
  ];

  const handleSendQuestion = async (question: string) => {
    if (!question.trim() || isLoading) return;
    
    const newMsgs = [...chatMessages, { sender: 'user' as const, text: question }];
    setChatMessages(newMsgs);
    setChatInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          profileContext: profile,
          schemeContext: result,
          language
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get response');

      setChatMessages([...newMsgs, { sender: 'ai', text: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages([...newMsgs, { sender: 'ai', text: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendQuestion(chatInput);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>&times;</button>
        
        {/* Main Content Area */}
        <div className={styles.modalMain}>
          <div style={{ marginBottom: '2rem' }}>
            <Badge variant="neutral" style={{ marginBottom: '1rem' }}>{scheme.ministry}</Badge>
            <h2 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {scheme.name}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{scheme.tagline}</p>
          </div>

          <h3 className={styles.sectionTitle}>Eligibility Check</h3>
          <ul className={styles.eligibilityList}>
            {eligibility.matchedRules.map((rule, idx) => (
              <li key={`pass-${idx}`} className={styles.eligibilityItem}>
                <span className={styles.checkIcon}>✓</span>
                <span>{rule}</span>
              </li>
            ))}
            {eligibility.failedRules.map((rule, idx) => (
              <li key={`fail-${idx}`} className={styles.eligibilityItem}>
                <span className={styles.crossIcon}>✕</span>
                <span>{rule}</span>
              </li>
            ))}
            {eligibility.pendingCheckRules.map((rule, idx) => (
              <li key={`warn-${idx}`} className={styles.eligibilityItem}>
                <span className={styles.warnIcon}>!</span>
                <span>{rule} (Additional verification required)</span>
              </li>
            ))}
          </ul>

          <h3 className={styles.sectionTitle}>Financial Terms & Calculator</h3>
          <div className={styles.calcBox}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <Input 
                label="Loan Amount (₹)" 
                type="number" 
                value={calcLoan} 
                onChange={e => setCalcLoan(Number(e.target.value))} 
              />
              <Input 
                label="Interest Rate (%)" 
                type="number" 
                step="0.1" 
                value={calcRate} 
                onChange={e => setCalcRate(Number(e.target.value))} 
              />
              <Input 
                label="Tenure (Years)" 
                type="number" 
                value={calcTenure} 
                onChange={e => setCalcTenure(Number(e.target.value))} 
              />
            </div>
            
            <div className={styles.calcResult}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estimated EMI</div>
                <div className={styles.calcValue}>{formatINR(emiData.monthlyEMI)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Repayment</div>
                <div className={styles.calcValue}>{formatINR(emiData.totalPayment)}</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              * ESTIMATE ONLY. Never implies official approval. Verify with the financial institution.
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Where to Apply</h3>
          <div style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {scheme.channelPartners && scheme.channelPartners.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-medium)' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Partner</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500 }}>Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {scheme.channelPartners.map((partner) => (
                    <tr key={partner.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>{partner.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{partner.type}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{partner.distanceKm} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                Channel partner data not yet available for this scheme.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / AI Chat */}
        <div className={styles.modalSidebar}>
          <h3 className={styles.sectionTitle}>Document Checklist</h3>
          {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
              {scheme.requiredDocuments.map((doc, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Document checklist not yet available for this scheme.
            </div>
          )}

          <h3 className={styles.sectionTitle}>Ask SCHEMORA</h3>
          <div className={styles.chatContainer}>
            <div className={styles.chatMessages} ref={chatContainerRef}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`${styles.chatBubble} ${styles[msg.sender]}`}>
                  {msg.text}
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.chatBubble} ${styles.ai}`}>
                  <span className={styles.typingIndicator}>...</span>
                </div>
              )}
            </div>
            
            {chatMessages.length === 1 && (
              <div style={{ padding: '0.5rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  You can ask SCHEMORA:
                </div>
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSendQuestion(q)}
                    disabled={isLoading}
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '100px',
                      color: 'var(--text-secondary)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form className={styles.chatInput} onSubmit={handleChat}>
              <Input 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)} 
                placeholder="Ask about this scheme..." 
                style={{ flex: 1 }}
                disabled={isLoading}
              />
              <Button type="submit" variant="primary" disabled={isLoading || !chatInput.trim()}>
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
