'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Upload, Loader2, CheckCircle, AlertCircle, FileText, Plus, X } from 'lucide-react';

interface ExtractedMedication {
  name: string;
  dosage: string;
  confidence: number;
}

export default function MedicationsPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [extractedMeds, setExtractedMeds] = useState<ExtractedMedication[]>([]);
  const [error, setError] = useState('');
  const [rawText, setRawText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated progress bar since the API doesn't stream progress yet
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 5;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError('');
    setExtractedMeds([]);
    setRawText('');

    try {
      // 1. Convert file to Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      // 2. Call the Next.js API Route which talks to Gemini
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64,
          mimeType: file.type
        })
      });

      const data = await res.json();
      setScanProgress(100);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process image');
      }

      setExtractedMeds(data.medications || []);
      
      if (!data.medications || data.medications.length === 0) {
        setError('No medications found in the image. Please try a clearer picture.');
      }
      
    } catch (err: any) {
      console.warn("API OCR Failed, falling back to local browser OCR...", err);
      try {
        setError('API Rate Limited. Running Local Browser OCR (may take a moment)...');
        
        // Dynamic import to avoid SSR issues with Tesseract
        const Tesseract = (await import('tesseract.js')).default;
        const result = await Tesseract.recognize(file, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    setScanProgress(Math.round(m.progress * 100));
                }
            }
        });
        
        const text = result.data.text;
        setRawText(text);
        
        const lines = text.split('\n').filter((line: string) => line.trim().length > 0);
        const parsedMeds: any[] = [];
        const dosageRegex = /(\d+)\s*(mg|mcg|g|ml|tbsp|tsp)/i;
        
        lines.forEach((line: string) => {
          const match = line.match(dosageRegex);
          if (match) {
            const index = match.index || 0;
            let possibleName = line.substring(0, index).trim();
            possibleName = possibleName.replace(/[^a-zA-Z\s]/g, '').trim();
            
            if (possibleName.length > 2 && possibleName.split(' ').length <= 4) {
              parsedMeds.push({
                name: possibleName,
                dosage: match[0],
                confidence: result.data.confidence ? result.data.confidence / 100 : 0.8
              });
            }
          }
        });

        if (parsedMeds.length > 0) {
          setExtractedMeds(parsedMeds);
          setError('');
        } else {
          setError('Failed to scan image accurately via local fallback. Please try a clearer picture.');
        }

      } catch (tesseractError: any) {
        console.error("Local OCR also failed:", tesseractError);
        setError(err.message || 'Failed to scan image. Please ensure it is a clear picture of text.');
      }
    } finally {
      setTimeout(() => setIsScanning(false), 500); // Small delay to let user see 100%
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-[family-name:var(--font-heading)]">
          Medications & Prescriptions
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your active medications and scan new prescriptions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Active Medications */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Active Medications</h2>
            <button className="flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-4 py-2 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors">
              <Plus className="w-4 h-4" /> Add Manual
            </button>
          </div>

          <div className="space-y-4">
            {/* Dummy Active Med */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center shrink-0">
                <Pill className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Lisinopril</h3>
                    <p className="text-slate-500 text-sm">10mg • 1 tablet daily</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-medium">Active</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
                  Next dose: <span className="font-semibold text-slate-900 dark:text-slate-200">Tomorrow, 8:00 AM</span>
                </div>
              </div>
            </div>

            {/* Imported from Scan */}
            <AnimatePresence>
              {extractedMeds.map((med, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx}
                  className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-5 border border-purple-200 dark:border-purple-800 shadow-sm flex items-start gap-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                  <div className="w-12 h-12 rounded-xl bg-purple-200 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 text-purple-700 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-purple-900 dark:text-purple-100 text-lg capitalize">{med.name}</h3>
                        <p className="text-purple-700/70 dark:text-purple-300/70 text-sm">{med.dosage}</p>
                      </div>
                      <span className="px-3 py-1 bg-purple-200 text-purple-800 dark:bg-purple-800/50 dark:text-purple-300 rounded-full text-xs font-medium">New Scan</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: AI OCR Scanner */}
        <div className="relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 rounded-3xl p-8 border border-white/40 dark:border-slate-700/50 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/50 flex flex-col h-full">
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">AI Prescription Scanner</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Upload a clear photo of your prescription bottle or doctor's note. Our local AI will extract the medications instantly.
            </p>

            <div 
              className={`flex-1 min-h-[250px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center transition-all ${
                isScanning 
                  ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-500' 
                  : 'border-slate-300 dark:border-slate-700 hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {isScanning ? (
                <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
                    <motion.div 
                      className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <p className="font-semibold text-blue-700 dark:text-blue-400 animate-pulse">Running AI Vision Model...</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                      className="bg-blue-600 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{scanProgress}% complete</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4 shadow-inner">
                    <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 text-lg mb-1">Click or drag image here</h3>
                  <p className="text-sm text-slate-500 mb-6">Supports JPG, PNG, WEBP (Max 5MB)</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                  >
                    Select Image
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-800/50"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {rawText && !isScanning && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6"
                >
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <FileText className="w-4 h-4" /> Raw Extracted Text
                  </h3>
                  <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 text-xs font-mono text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {rawText}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}
