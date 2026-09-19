export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  return text
    // Remove markdown bold/italic asterisks
    .replace(/\*{1,3}/g, '')
    // Remove markdown headers
    .replace(/#{1,6}\s?/g, '')
    // Replace markdown links with just the text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Replace markdown bullets with a pause
    .replace(/^[\s-]*[-*+]\s+/gm, '. ')
    // Remove code blocks and inline code completely or just the backticks
    .replace(/```[^`]*```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove URLs that weren't caught by markdown link syntax
    .replace(/https?:\/\/[^\s]+/g, '')
    // Replace multiple spaces/newlines with a single space
    .replace(/\s+/g, ' ')
    .trim();
}

let currentPlayingId: string | null = null;
let onFinishCallback: (() => void) | null = null;
const isManualStopRef = { current: false };

export function stopSpeech() {
  isManualStopRef.current = true;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentPlayingId = null;
  // If we manually stopped, we shouldn't trigger the natural finish callback
  onFinishCallback = null;
  isManualStopRef.current = false;
}

// Map site language codes to BCP-47 codes
const langMap: Record<string, string> = {
  'hi': 'hi-IN',
  'bn': 'bn-IN',
  'ta': 'ta-IN',
  'en': 'en-IN',
};

/**
 * Plays speech using the browser's native SpeechSynthesis API.
 */
export async function playSpeech(
  messageId: string, 
  text: string, 
  language: string = 'en', 
  onFinish?: () => void,
  onError?: (err: string) => void,
  preferFemale: boolean = false
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onError) onError("Speech Synthesis is not supported in this browser.");
    return;
  }

  stopSpeech(); // Stop any currently playing speech

  const cleanedText = cleanTextForSpeech(text);
  if (!cleanedText) {
    if (onFinish) onFinish();
    return;
  }

  onFinishCallback = onFinish || null;
  currentPlayingId = messageId;

  try {
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    // Map custom language codes to BCP-47, default to en-IN or fallback
    const bcp47Lang = langMap[language] || language;
    utterance.lang = bcp47Lang;
    
    // Attempt to find best voice matching language
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const langVoices = voices.filter(v => v.lang.startsWith(bcp47Lang) || v.lang.startsWith(bcp47Lang.split('-')[0]));
      let selectedVoice = langVoices[0];
      
      if (preferFemale && langVoices.length > 0) {
        const femaleVoice = langVoices.find(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('zira') || 
          v.name.toLowerCase().includes('samantha') || 
          v.name.toLowerCase().includes('victoria')
        );
        if (femaleVoice) {
          selectedVoice = femaleVoice;
        }
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else if (voices.length > 0) {
        // Fallback to any voice if no language match
        utterance.voice = voices.find(v => preferFemale ? v.name.toLowerCase().includes('female') : true) || voices[0];
      }
    }

    utterance.onend = () => {
      if (isManualStopRef.current) return;
      if (currentPlayingId === messageId) {
        currentPlayingId = null;
        if (onFinishCallback) {
          onFinishCallback();
          onFinishCallback = null;
        }
      }
    };

    utterance.onerror = (e) => {
      const benignReasons = ['canceled', 'interrupted'];
      if (benignReasons.includes(e.error)) {
        if (isManualStopRef.current) return;
        return;
      }
      console.error("Speech Synthesis Error:", e.error || e);
      if (onError) onError("Failed to play audio");
      stopSpeech();
    };

    window.speechSynthesis.speak(utterance);

  } catch (error) {
    console.error("TTS Error:", error);
    if (onError) onError(error instanceof Error ? error.message : "Failed to generate speech");
    stopSpeech();
  }
}
