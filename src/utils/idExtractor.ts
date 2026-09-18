import Tesseract from 'tesseract.js';
import jsQR from 'jsqr';

export interface ExtractedData {
  fullName?: string;
  age?: number;
  gender?: 'female' | 'male' | 'transgender' | 'prefer_not_to_say';
  state?: string;
  address?: string;
  documentNumber?: string;
  documentType?: string;
  message?: string;
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

  // 1. Detect Document Type & Number
  const aadhaarMatch = fullText.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
  if (aadhaarMatch) {
    data.documentType = 'Aadhaar';
    const numStr = aadhaarMatch[0].replace(/\s/g, '');
    data.documentNumber = `XXXX XXXX ${numStr.slice(-4)}`;
  } else {
    const panMatch = fullText.match(/\b[A-Z]{5}\d{4}[A-Z]\b/);
    if (panMatch) {
      data.documentType = 'PAN';
      const numStr = panMatch[0];
      data.documentNumber = `XXXXX${numStr.slice(5, 9)}X`;
    }
  }

  // 2. Extract Gender
  if (/\bfemale\b/i.test(fullText)) {
    data.gender = 'female';
  } else if (/\bmale\b/i.test(fullText)) {
    data.gender = 'male';
  } else if (/\btransgender\b/i.test(fullText)) {
    data.gender = 'transgender';
  }

  // 3. Extract Date of Birth / Year of Birth
  const dobMatch = text.match(/(?:DOB|Date of Birth|Year of Birth|YOB)[\s:]*([0-9/]+)/i);
  if (dobMatch && dobMatch[1]) {
    data.age = calculateAge(dobMatch[1]);
  } else {
    const datePattern = text.match(/\b\d{2}\/\d{2}\/(19|20)\d{2}\b/);
    if (datePattern) {
      data.age = calculateAge(datePattern[0]);
    }
  }

  // 4. Extract Name
  const isLabel = (str: string) => /government|india|father|dob|year|birth|gender|male|female|address|signature|pan|permanent|account|card/i.test(str);
  const nameLine = lines.find(line => {
    return line.length > 3 && line.length < 30 && !/\d/.test(line) && !isLabel(line) && /^[A-Z][a-zA-Z\s]+$/.test(line);
  });
  if (nameLine) {
    data.fullName = nameLine
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  // 5. Extract Address (very naive heuristic for typical ID layout)
  const addressIndex = lines.findIndex(l => /address/i.test(l));
  if (addressIndex !== -1 && addressIndex + 1 < lines.length) {
    // Take the next few lines as address, stopping if we hit another label or something looking like a different section
    let addressLines = [];
    for (let i = addressIndex; i < lines.length && i < addressIndex + 4; i++) {
      const line = lines[i].replace(/address[\s:]*/i, '').trim();
      if (line.length > 0) addressLines.push(line);
    }
    if (addressLines.length > 0) {
      data.address = addressLines.join(', ');
    }
  } else {
    // Look for Care of / S/O / D/O / W/O pattern
    const careOfIndex = lines.findIndex(l => /(C\/O|S\/O|D\/O|W\/O)/i.test(l));
    if (careOfIndex !== -1) {
      let addressLines = [];
      for (let i = careOfIndex; i < lines.length && i < careOfIndex + 4; i++) {
        addressLines.push(lines[i]);
      }
      data.address = addressLines.join(', ');
    }
  }

  return data;
};

export const extractFromQR = (qrData: string): ExtractedData => {
  const data: ExtractedData = {};
  
  if (qrData.startsWith('http://') || qrData.startsWith('https://')) {
    data.message = `QR contains a URL: ${qrData}. We do not automatically navigate to URLs for security reasons.`;
    return data;
  }

  try {
    // Try to parse JSON first
    if (qrData.startsWith('{')) {
      const parsed = JSON.parse(qrData);
      if (parsed.name) data.fullName = parsed.name;
      if (parsed.dob) data.age = calculateAge(parsed.dob);
      if (parsed.gender) {
        const g = parsed.gender.toLowerCase();
        if (g.startsWith('f')) data.gender = 'female';
        else if (g.startsWith('m')) data.gender = 'male';
      }
      return data;
    }

    // Attempt XML parse (typical Aadhaar format)
    const nameMatch = qrData.match(/name="([^"]+)"/i);
    const yobMatch = qrData.match(/yob="([^"]+)"/i) || qrData.match(/dob="([^"]+)"/i);
    const genderMatch = qrData.match(/gender="([^"]+)"/i);
    const stateMatch = qrData.match(/state="([^"]+)"/i);
    const coMatch = qrData.match(/co="([^"]+)"/i);
    const locMatch = qrData.match(/loc="([^"]+)"/i);
    const vtcMatch = qrData.match(/vtc="([^"]+)"/i);
    const pcMatch = qrData.match(/pc="([^"]+)"/i);

    if (nameMatch) {
      data.fullName = nameMatch[1];
      data.documentType = 'Aadhaar'; // If it has this XML schema, it's likely Aadhaar
    }
    if (yobMatch) data.age = calculateAge(yobMatch[1]);
    if (genderMatch) {
      const g = genderMatch[1].toLowerCase();
      if (g.startsWith('f')) data.gender = 'female';
      else if (g.startsWith('m')) data.gender = 'male';
      else if (g.startsWith('t')) data.gender = 'transgender';
    }
    if (stateMatch) data.state = stateMatch[1];
    
    // Construct address if available
    let addressParts = [];
    if (coMatch) addressParts.push(coMatch[1]);
    if (locMatch) addressParts.push(locMatch[1]);
    if (vtcMatch) addressParts.push(vtcMatch[1]);
    if (stateMatch) addressParts.push(stateMatch[1]);
    if (pcMatch) addressParts.push(pcMatch[1]);
    if (addressParts.length > 0) data.address = addressParts.join(', ');

  } catch (e) {
    console.error("Failed to parse QR data", e);
  }

  // If we couldn't parse it structurally, treat it as text
  if (Object.keys(data).length === 0) {
    return extractFromText(qrData);
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

  if (onProgress) onProgress("Extracting fields...");
  return extractFromText(text);
};
