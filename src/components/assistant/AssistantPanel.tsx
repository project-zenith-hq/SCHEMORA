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

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: data.response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: error.message || "I'm currently unavailable. Please try again later." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
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
              <div className={`${styles.bubble} ${styles[msg.sender]}`} dir="auto">
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
            dir="auto"
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
