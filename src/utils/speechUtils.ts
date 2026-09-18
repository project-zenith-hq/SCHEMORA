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

/**
 * Split text into roughly sentence-sized chunks to avoid Chrome's 15-second speech limit bug
 */
export function chunkText(text: string): string[] {
  // Split on punctuation followed by space, or just split long strings safely
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > 200) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(c => c.length > 0);
}

// Global state to track if we are currently playing
let currentChunks: string[] = [];
let chunkIndex = 0;
let isPlaying = false;
let onFinishCallback: (() => void) | null = null;
let currentVoice: SpeechSynthesisVoice | null = null;

// Initialize voice
function getVoice(): SpeechSynthesisVoice | null {
  if (currentVoice) return currentVoice;
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Try to find a natural english voice
  let voice = voices.find(v => v.name.includes('Natural') && v.lang.startsWith('en')) ||
              voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
              voices.find(v => v.lang.startsWith('en')) ||
              voices[0];
              
  currentVoice = voice;
  return voice;
}

// Prefetch voices
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    getVoice();
  };
}

const playNextChunk = () => {
  if (chunkIndex >= currentChunks.length) {
    isPlaying = false;
    if (onFinishCallback) onFinishCallback();
    return;
  }

  const chunk = currentChunks[chunkIndex];
  const utterance = new SpeechSynthesisUtterance(chunk);
  const voice = getVoice();
  if (voice) utterance.voice = voice;
  
  utterance.rate = 1.0; // Natural speed
  utterance.pitch = 1.0;

  utterance.onend = () => {
    if (!isPlaying) return; // Was cancelled
    chunkIndex++;
    playNextChunk();
  };

  utterance.onerror = (e) => {
    console.error("Speech synthesis error", e);
    // Move to next chunk on some errors, or just stop
    if (e.error !== 'canceled') {
      chunkIndex++;
      playNextChunk();
    }
  };

  window.speechSynthesis.speak(utterance);
};

export function stopSpeech() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  isPlaying = false;
  window.speechSynthesis.cancel();
  if (onFinishCallback) {
    onFinishCallback();
    onFinishCallback = null;
  }
}

export function playSpeech(text: string, onFinish?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn("Speech synthesis not supported");
    if (onFinish) onFinish();
    return;
  }

  stopSpeech(); // Stop any currently playing speech

  const cleanedText = cleanTextForSpeech(text);
  if (!cleanedText) {
    if (onFinish) onFinish();
    return;
  }

  currentChunks = chunkText(cleanedText);
  chunkIndex = 0;
  isPlaying = true;
  onFinishCallback = onFinish || null;

  playNextChunk();
}
