"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from './VoiceAssistant.module.css';
import { useTranslation } from '@/context/TranslationContext';
import { playSpeech, stopSpeech } from '@/utils/speechUtils';

// SVG Icons
const MicIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="22"></line>
  </svg>
);

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [fallbackInput, setFallbackInput] = useState("");
  
  const [recognitionSupported] = useState(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    }
    return true;
  });

  const { language } = useTranslation();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isRecognitionActiveRef = useRef(false);
  const isStartingRef = useRef(false);
  const voiceAssistantIsOpenRef = useRef(isOpen);

  useEffect(() => {
    voiceAssistantIsOpenRef.current = isOpen;
  }, [isOpen]);

  const langMap = useMemo<Record<string, string>>(() => ({
    'hi': 'hi-IN',
    'bn': 'bn-IN',
    'ta': 'ta-IN',
    'en': 'en-IN',
  }), []);
  
  // Initialize speech recognition ONCE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (isRecognitionActiveRef.current || isStartingRef.current) {
      return; 
    }
    if (!recognitionRef.current || !voiceAssistantIsOpenRef.current) return;
    
    stopSpeech(); 
    
    isStartingRef.current = true;
    try {
      recognitionRef.current.lang = langMap[language] || language;
      recognitionRef.current.start();
    } catch (e) {
      isStartingRef.current = false;
      console.error('Speech recognition error on start:', e);
    }
  }, [language, langMap]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch(e) {}
    }
  }, []);

  // Use refs for callbacks to avoid re-binding handlers
  const handleSendToAIRef = useRef<(text: string) => void>(() => {});
  
  const handleSendToAI = useCallback(async (text: string) => {
    if (!text.trim()) {
      return; // Do nothing, let the error handler or timeout restart
    }

    setVoiceState('thinking');
    setUserText(text);
    setAiText("");
    stopListening();

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language, isVoice: true })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAiText(data.response);
      setVoiceState('speaking');
      
      playSpeech(
        Date.now().toString(),
        data.response,
        language,
        () => {
          if (voiceAssistantIsOpenRef.current) {
            startListening();
          }
        },
        (err) => {
          console.error("TTS Error:", err);
          // If TTS fails, we can optionally restart listening or just idle
          if (voiceAssistantIsOpenRef.current) {
             setVoiceState('idle');
          }
        },
        true
      );
    } catch (error) {
      setAiText("I'm sorry, I'm having trouble connecting right now.");
      setVoiceState('idle');
    }
  }, [language, stopListening, startListening]);

  useEffect(() => {
    handleSendToAIRef.current = handleSendToAI;
  }, [handleSendToAI]);

  // Bind handlers ONCE
  useEffect(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onstart = () => {
      isRecognitionActiveRef.current = true;
      isStartingRef.current = false;
      setVoiceState('listening');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSendToAIRef.current(transcript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognitionRef.current.onerror = (event: any) => {
      isRecognitionActiveRef.current = false;
      isStartingRef.current = false;
      
      const benignErrors = ['no-speech', 'aborted'];
      if (benignErrors.includes(event.error)) {
        setTimeout(() => {
          if (voiceAssistantIsOpenRef.current) {
            startListening();
          }
        }, 300);
        return;
      }
      
      if (event.error === 'not-allowed') {
        alert("Microphone access is needed for the voice assistant. Please allow it in your browser settings.");
        setIsOpen(false);
      } else {
        console.error('Speech recognition error:', event.error);
        setVoiceState('idle');
      }
    };

    recognitionRef.current.onend = () => {
      isRecognitionActiveRef.current = false;
      isStartingRef.current = false;
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        
        if (isRecognitionActiveRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }
      }
      isRecognitionActiveRef.current = false;
      isStartingRef.current = false;
    };
  }, [startListening]);

  // Handle open toggle
  const handleOpenToggle = useCallback((open: boolean) => {
    if (open) {
      setUserText("");
      setAiText("");
      setIsOpen(true);
      // Wait a tick for state to update so ref matches
      setTimeout(() => startListening(), 50);
    } else {
      setIsOpen(false);
      stopListening();
      stopSpeech();
    }
  }, [startListening, stopListening]);

  return (
    <div className={styles.container}>
      <button 
        className={`${styles.triggerBtn} ${isOpen ? styles.open : ''}`}
        onClick={() => handleOpenToggle(true)}
        aria-label="Open Voice Assistant"
      >
        <MicIcon size={28} />
      </button>

      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <MicIcon size={20} />
            <span>Voice Assistant</span>
          </div>
          <button className={styles.closeBtn} onClick={() => handleOpenToggle(false)}>×</button>
        </div>

        <div className={styles.voiceArea}>
          <div className={`${styles.stateLabel} ${voiceState !== 'idle' ? styles.active : ''}`}>
            {voiceState === 'listening' ? 'Listening...' : 
             voiceState === 'thinking' ? 'Thinking...' : 
             voiceState === 'speaking' ? 'Speaking...' : 'Idle'}
          </div>

          <div className={`${styles.visualizerWrapper} ${styles[voiceState]}`}>
            <div className={`${styles.visualizerRing} ${styles[voiceState]}`}></div>
            <div className={styles.micIconCenter} onClick={() => {
              if (voiceState === 'idle') {
                startListening();
              } else if (voiceState === 'speaking') {
                stopSpeech();
                startListening();
              } else if (voiceState === 'listening') {
                stopListening();
              }
            }}>
              <MicIcon size={32} />
            </div>
          </div>

          <div className={styles.transcriptionArea}>
            {userText && <div className={styles.userText}>&quot;{userText}&quot;</div>}
            {aiText && voiceState === 'speaking' && <div className={styles.aiSummary}>{aiText.substring(0, 80)}...</div>}
            {!recognitionSupported && (
              <div className={styles.aiSummary}>Voice recognition is not supported in this browser. Please use the text input.</div>
            )}
          </div>
        </div>

        <div className={styles.controlsArea}>
          <div className={styles.fallbackInput}>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Or type here..." 
              value={fallbackInput}
              onChange={(e) => setFallbackInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && fallbackInput.trim()) {
                  handleSendToAI(fallbackInput);
                  setFallbackInput("");
                }
              }}
            />
            <button 
              className={styles.sendBtn}
              onClick={() => {
                if (fallbackInput.trim()) {
                  handleSendToAI(fallbackInput);
                  setFallbackInput("");
                }
              }}
              disabled={!fallbackInput.trim() || voiceState === 'thinking'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <button className={styles.endBtn} onClick={() => handleOpenToggle(false)}>
            End Conversation
          </button>
        </div>
      </div>
    </div>
  );
};
