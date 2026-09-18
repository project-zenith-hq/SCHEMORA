import Tesseract from 'tesseract.js';
import jsQR from 'jsqr';

export interface ExtractedData {
  fullName?: string;
  age?: number;
  gender?: 'female' | 'male' | 'transgender' | 'prefer_not_to_say';
  state?: string;
}

// Calculate age from YYYY or DD/MM/YYYY
const calculateAge = (dobString: string): number | undefined => {
  const currentYear = new Date().getFullYear();
  // Try to find a 4-digit year
  const yearMatch = dobString.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0], 10);
    return currentYear - year;
  }
  return undefined;
};

export const extractFromText = (text: string): ExtractedData => {
  const data: ExtractedData = {};

  // Clean text and split into lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const fullText = text.replace(/\s+/g, ' ');

  // 1. Extract Gender
  if (/female/i.test(fullText)) {
    data.gender = 'female';
  } else if (/male/i.test(fullText)) {
    data.gender = 'male';
  } else if (/transgender/i.test(fullText)) {
    data.gender = 'transgender';
  }

  // 2. Extract Date of Birth / Year of Birth
  // Look for DD/MM/YYYY or YOB
  const dobMatch = text.match(/(?:DOB|Date of Birth|Year of Birth|YOB)[\s:]*([0-9/]+)/i);
  if (dobMatch && dobMatch[1]) {
    data.age = calculateAge(dobMatch[1]);
  } else {
    // Just look for a date pattern if labels are missing
    const datePattern = text.match(/\b\d{2}\/\d{2}\/(19|20)\d{2}\b/);
    if (datePattern) {
      data.age = calculateAge(datePattern[0]);
    }
  }

  // 3. Extract Name
  // This is tricky via simple OCR without layout analysis.
  // For this prototype, we'll try a very naive approach: look for lines that look like a full name
  const isLabel = (str: string) => /government|india|father|dob|year|birth|gender|male|female/i.test(str);
  const nameLine = lines.find(line => {
    return line.length > 3 && line.length < 30 && !/\d/.test(line) && !isLabel(line) && /^[A-Z][a-zA-Z\s]+$/.test(line);
  });
  if (nameLine) {
    data.fullName = nameLine
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  return data;
};

export const extractFromQR = (qrData: string): ExtractedData => {
  const data: ExtractedData = {};
  
  try {
    // Attempt XML parse
    const nameMatch = qrData.match(/name="([^"]+)"/i);
    const yobMatch = qrData.match(/yob="([^"]+)"/i) || qrData.match(/dob="([^"]+)"/i);
    const genderMatch = qrData.match(/gender="([^"]+)"/i);
    const stateMatch = qrData.match(/state="([^"]+)"/i);

    if (nameMatch) data.fullName = nameMatch[1];
    if (yobMatch) data.age = calculateAge(yobMatch[1]);
    if (genderMatch) {
      const g = genderMatch[1].toLowerCase();
      if (g.startsWith('f')) data.gender = 'female';
      else if (g.startsWith('m')) data.gender = 'male';
      else if (g.startsWith('t')) data.gender = 'transgender';
    }
    if (stateMatch) data.state = stateMatch[1];
  } catch (e) {
    console.error("Failed to parse QR data", e);
  }

  return data;
};

// Orchestrator
export const processImage = async (imageSource: HTMLImageElement | HTMLCanvasElement, onProgress?: (msg: string) => void): Promise<ExtractedData> => {
  let canvas: HTMLCanvasElement;
  if (imageSource instanceof HTMLImageElement) {
    canvas = document.createElement('canvas');
    canvas.width = imageSource.width;
    canvas.height = imageSource.height;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(imageSource, 0, 0);
  } else {
    canvas = imageSource;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get canvas context");

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // 1. Try QR code first
  if (onProgress) onProgress("Checking for QR code...");
  const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
  if (qrCode && qrCode.data) {
    const qrResult = extractFromQR(qrCode.data);
    if (Object.keys(qrResult).length > 0) {
      return qrResult;
    }
  }

  // 2. Fallback to OCR
  if (onProgress) onProgress("Initializing OCR engine...");
  const worker = await Tesseract.createWorker('eng');
  
  if (onProgress) onProgress("Reading document text...");
  const { data: { text } } = await worker.recognize(canvas);
  await worker.terminate();

  const sanitizedText = text.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, 'XXXX XXXX XXXX');

  if (onProgress) onProgress("Extracting fields...");
  return extractFromText(sanitizedText);
};
