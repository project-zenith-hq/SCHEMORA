"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './AssistantPanel.module.css';
import { RobotIcon } from './RobotIcon';

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
};

const SUGGESTED_QUESTIONS = [
  "How does scheme matching work?",
  "What do the match statuses mean?",
  "Relevance score vs Approval probability?",
  "How accurate is the EMI calculator?",
  "How do I apply for a scheme?"
];

const PREDEFINED_ANSWERS: Record<string, string> = {
  "How does scheme matching work?": "SCHEMORA AI evaluates your profile data against our rule engine. We extract eligibility criteria from official scheme documents and algorithmically score your alignment. This provides an explainable match rather than a black-box guess.",
  "What do the match statuses mean?": "• Matched: Your profile passes all known rules.\n• Not Matched: You explicitly fail one or more hard requirements.\n• Needs More Info: We lack the data points needed to verify specific edge-case criteria.",
  "Relevance score vs Approval probability?": "The Relevance Score reflects how perfectly your profile aligns with the scheme's intended audience. It is NOT an approval probability. Official approval is solely determined by the lending bank and nodal agency.",
  "How accurate is the EMI calculator?": "The EMI calculator provides a structural estimate based on standard amortization formulas. Official interest rates, moratorium periods, and final terms will be set by your lending bank.",
  "How do I apply for a scheme?": "Once you find a matched scheme, use the Document Checklist to prepare your file. Then, use the Channel Partner locator on the results page to find certified agents or nodal banks near you."
};

const DEFAULT_ANSWER = "I'm the SCHEMORA App-Literacy Assistant. For specific scheme eligibility, please use the Assessment Flow. Can I help you understand how the platform works?";

export const AssistantPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: "Hello. I am the SCHEMORA Assistant. How can I help you understand the platform today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate network/thinking delay
    setTimeout(() => {
      const answer = PREDEFINED_ANSWERS[text] || DEFAULT_ANSWER;
      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: answer };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  const handleQuickQuestion = (q: string) => {
    handleSend(q);
  };

  return (
    <div className={styles.container}>
      {/* TRIGGER BUTTON */}
      <button 
        className={`${styles.triggerBtn} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open Assistant"
      >
        <RobotIcon size={28} />
      </button>

      {/* PANEL */}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <RobotIcon size={24} />
            <span>SCHEMORA Assistant</span>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close Assistant">
            ×
          </button>
        </div>

        <div className={styles.chatArea}>
          {messages.map((msg) => (
            <div key={msg.id} className={`${styles.messageRow} ${styles[msg.sender]}`}>
              {msg.sender === 'ai' && (
                <div className={styles.avatar}>
                  <RobotIcon size={24} />
                </div>
              )}
              <div className={`${styles.bubble} ${styles[msg.sender]}`}>
                {msg.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className={`${styles.messageRow} ai`}>
              <div className={styles.avatar}>
                <RobotIcon size={24} />
              </div>
              <div className={`${styles.bubble} ${styles.ai}`}>
                <div className={styles.typingIndicator}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
              </div>
            </div>
          )}
          
          {!isTyping && messages.length === 1 && (
            <div className={styles.quickQuestions}>
              {SUGGESTED_QUESTIONS.map(q => (
                <button key={q} className={styles.chip} onClick={() => handleQuickQuestion(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="Ask a question..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
          />
          <button 
            className={styles.sendBtn} 
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
