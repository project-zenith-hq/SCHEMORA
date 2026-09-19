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
  
  const [aiDocGuidance, setAiDocGuidance] = useState<string | null>(null);
  const [isAiDocLoading, setIsAiDocLoading] = useState(false);

  const [aiAppGuidance, setAiAppGuidance] = useState<string | null>(null);
  const [isAiAppLoading, setIsAiAppLoading] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isLoading]);

  useEffect(() => {
    if (!scheme.requiredDocuments || scheme.requiredDocuments.length === 0) {
      setIsAiDocLoading(true);
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "What documents are generally required for this scheme? Give a concise list. Start your response EXACTLY with 'SCHEMORA guidance: ' and explain that the exact checklist should be confirmed with the implementing authority.",
          profileContext: profile,
          schemeContext: result,
          language
        })
      })
      .then(res => res.json())
      .then(data => setAiDocGuidance(data.reply))
      .catch(() => setAiDocGuidance("Could not generate document guidance. Please ask SCHEMORA below."))
      .finally(() => setIsAiDocLoading(false));
    }

    if (!scheme.channelPartners?.length && !scheme.applicationChannel && !scheme.officialPortalUrl) {
      setIsAiAppLoading(true);
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: "How do I apply for this scheme? Where should I go? Give concise general guidance. Start your response EXACTLY with 'SCHEMORA guidance: '.",
          profileContext: profile,
          schemeContext: result,
          language
        })
      })
      .then(res => res.json())
      .then(data => setAiAppGuidance(data.reply))
      .catch(() => setAiAppGuidance("Could not generate application guidance. Please ask SCHEMORA below."))
      .finally(() => setIsAiAppLoading(false));
    }
  }, [scheme, profile, result, language]);

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
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>{scheme.tagline}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {scheme.description && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Overview</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{scheme.description}</p>
                </div>
              )}
              {scheme.purpose && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Purpose</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{scheme.purpose}</p>
                </div>
              )}
              {scheme.whoItIsFor && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Target Audience</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{scheme.whoItIsFor}</p>
                </div>
              )}
              {scheme.officialPortalUrl && (
                <div style={{ marginTop: '0.5rem' }}>
                  <a href={scheme.officialPortalUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                    Official Source / Apply Portal
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem', padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Why this matches you</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              {result.personalizedExplanation}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge variant="success">{result.keyBenefitHighlight}</Badge>
              <Badge variant="warning">{result.recommendedNextStep}</Badge>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Eligibility Check</h3>
          {eligibility.matchedRules.length === 0 && eligibility.failedRules.length === 0 && eligibility.pendingCheckRules.length === 0 ? (
            <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              Detailed eligibility breakdown is not available for your current profile. The scheme may have open eligibility or require manual verification. Ask SCHEMORA for more details.
            </div>
          ) : (
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
          )}

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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {scheme.applicationChannel && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Application Channel</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{scheme.applicationChannel}</p>
              </div>
            )}
            
            {scheme.applicationSteps && scheme.applicationSteps.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Application Steps</h4>
                <ol style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {scheme.applicationSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {scheme.officialPortalUrl && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Official Portal</h4>
                <a href={scheme.officialPortalUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
                  Visit Official Website
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            )}

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
                <div style={{ padding: '1.5rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.9rem' }}>
                  {isAiAppLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <span className={styles.typingIndicator}>...</span>
                      Generating guidance...
                    </div>
                  ) : aiAppGuidance ? (
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      <Badge variant="warning" style={{ marginBottom: '0.75rem' }}>AI Guidance</Badge>
                      <div>{aiAppGuidance}</div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      Specific channel partner data is not available. Please refer to the official portal or ask SCHEMORA below for general application guidance.
                    </div>
                  )}
                </div>
              )}
            </div>
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
                <div style={{ padding: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  {isAiDocLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <span className={styles.typingIndicator}>...</span>
                      Generating guidance...
                    </div>
                  ) : aiDocGuidance ? (
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      <Badge variant="warning" style={{ marginBottom: '0.75rem' }}>AI Guidance</Badge>
                      <div>{aiDocGuidance}</div>
                    </div>
                  ) : (
                    <div>
                      A scheme-specific verified document checklist is not currently available. Please ask SCHEMORA below for general guidance on standard documents.
                    </div>
                  )}
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
