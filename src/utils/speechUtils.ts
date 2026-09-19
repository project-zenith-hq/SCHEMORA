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

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentPlayingId = null;
  if (onFinishCallback) {
    onFinishCallback();
    onFinishCallback = null;
  }
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
  onError?: (err: string) => void
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
      const voice = voices.find(v => v.lang.startsWith(bcp47Lang) || v.lang.startsWith(bcp47Lang.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onend = () => {
      if (currentPlayingId === messageId) {
        currentPlayingId = null;
        if (onFinishCallback) {
          onFinishCallback();
          onFinishCallback = null;
        }
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error:", e);
      // 'canceled' is fired when stopSpeech() cancels the speech, which is not an actual error to show
      if (e.error !== 'canceled') {
        if (onError) onError("Failed to play audio");
      }
      stopSpeech();
    };

    window.speechSynthesis.speak(utterance);

  } catch (error: any) {
    console.error("TTS Error:", error);
    if (onError) onError(error.message || "Failed to generate speech");
    stopSpeech();
  }
}
