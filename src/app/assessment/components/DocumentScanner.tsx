import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { processImage, ExtractedData } from '@/utils/idExtractor';
import styles from './DocumentScanner.module.css';

interface DocumentScannerProps {
  onDataExtracted: (data: ExtractedData) => void;
  onCancel: () => void;
}

type ScannerState = 'idle' | 'camera_active' | 'processing' | 'success' | 'error';

export function DocumentScanner({ onDataExtracted, onCancel }: DocumentScannerProps) {
  const [state, setState] = useState<ScannerState>('idle');
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Real-time QR scanning interval
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const startCamera = async () => {
    setState('camera_active');
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Setup periodic QR check (fast)
      scanIntervalRef.current = setInterval(scanForQR, 500);
    } catch (err) {
      console.error("Camera error:", err);
      setState('error');
      setErrorMsg("Camera access denied or not available. Please use file upload.");
    }
  };

  const scanForQR = async () => {
    if (!videoRef.current || !canvasRef.current || state !== 'camera_active') return;
    const video = videoRef.current;
    if (video.videoWidth === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Fast QR check only here, to avoid freezing UI with OCR
    try {
      const extracted = await processImage(canvas, undefined); // Pass undefined to avoid progress updates for background QR scan
      if (extracted && Object.keys(extracted).length > 0) {
        handleExtractionSuccess(extracted);
      }
    } catch (e) {
      // Ignore background scan errors
    }
  };

  const captureAndExtract = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Stop background scanning
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    stopCamera();
    setState('processing');
    
    try {
      const extracted = await processImage(canvas, setProgressMsg);
      if (Object.keys(extracted).length > 0) {
        handleExtractionSuccess(extracted);
      } else {
        throw new Error("Could not extract relevant data from the image.");
      }
    } catch (err: any) {
      setState('error');
      setErrorMsg(err.message || "Failed to process image. Try a clearer photo or better lighting.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCamera();
    setState('processing');
    
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = async () => {
      try {
        const extracted = await processImage(img, setProgressMsg);
        URL.revokeObjectURL(objectUrl);
        
        if (Object.keys(extracted).length > 0) {
          handleExtractionSuccess(extracted);
        } else {
          throw new Error("Could not read any fields. Please ensure the ID or QR is clearly visible.");
        }
      } catch (err: any) {
        setState('error');
        setErrorMsg(err.message || "Failed to read file.");
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setState('error');
      setErrorMsg("Invalid image file.");
    };
  };

  const handleExtractionSuccess = (data: ExtractedData) => {
    stopCamera();
    setState('success');
    setTimeout(() => {
      onDataExtracted(data);
    }, 1500);
  };

  return (
    <div className={styles.scannerContainer}>
      <div className={styles.header}>
        <h3>Auto-Fill Profile</h3>
        <button onClick={onCancel} className={styles.closeBtn}><X size={20} /></button>
      </div>

      <div className={styles.disclaimer}>
        <AlertCircle size={16} />
        <p>This is a convenience auto-fill feature only and does not verify your identity with any government system.</p>
      </div>

      <div className={styles.mainArea}>
        {state === 'idle' && (
          <div className={styles.options}>
            <Button variant="primary" onClick={startCamera} className={styles.optionBtn}>
              <Camera size={24} />
              <span>Use Camera</span>
            </Button>
            <div className={styles.divider}>or</div>
            <div 
              className={styles.uploadZone} 
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} />
              <span>Upload Image (Photo or QR)</span>
            </div>
          </div>
        )}

        {state === 'camera_active' && (
          <div className={styles.cameraView}>
            <video ref={videoRef} className={styles.videoElement} playsInline muted />
            <div className={styles.overlay}>
              <div className={styles.bracketTopLeft}></div>
              <div className={styles.bracketTopRight}></div>
              <div className={styles.bracketBottomLeft}></div>
              <div className={styles.bracketBottomRight}></div>
              <div className={styles.scanLine}></div>
            </div>
            <div className={styles.cameraControls}>
              <p>Scanning for QR code...</p>
              <Button variant="primary" onClick={captureAndExtract}>
                Capture & Read Text
              </Button>
            </div>
          </div>
        )}

        {state === 'processing' && (
          <div className={styles.processingState}>
            <div className={styles.spinner}></div>
            <p>{progressMsg || "Processing document..."}</p>
          </div>
        )}

        {state === 'success' && (
          <div className={styles.successState}>
            <CheckCircle size={48} color="var(--accent-amber)" />
            <p>Data extracted successfully!</p>
          </div>
        )}

        {state === 'error' && (
          <div className={styles.errorState}>
            <AlertCircle size={48} color="var(--error-red, #ef4444)" />
            <p>{errorMsg}</p>
            <Button variant="primary" onClick={() => setState('idle')}>Try Again</Button>
          </div>
        )}
      </div>

      {/* Hidden elements */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        style={{ display: 'none' }} 
        onChange={handleFileUpload}
      />
    </div>
  );
}
