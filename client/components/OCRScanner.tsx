'use client';

import React, { useState, useRef } from 'react';
import { uploadPrescriptionImage, OCRResult } from '@/lib/api/ocr';
import { UploadCloud, FileText, Pill, FileImage, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OCRScanner() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG).');
      return;
    }
    
    setFile(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
    setError(null);
    setResult(null);
  };

  const processImage = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await uploadPrescriptionImage(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during OCR processing.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          AI Prescription Scanner
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Drag and drop a messy handwritten doctor's note, and we'll extract the medications using Optical Character Recognition.
        </p>
      </div>

      <div className="p-6">
        {!file ? (
          /* Dropzone State */
          <div 
            className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer ${
              dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
            <UploadCloud className={`w-12 h-12 mb-4 ${dragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
            <p className="text-slate-700 font-medium mb-1">Click or drag image to upload</p>
            <p className="text-slate-400 text-sm">Supports JPG, PNG, WEBP</p>
          </div>
        ) : (
          /* Processing State */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Image Preview */}
            <div className="space-y-4">
              <div className="aspect-[3/4] w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
                <img 
                  src={preview!} 
                  alt="Prescription preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" onClick={clearSelection}>Change Image</Button>
                </div>
              </div>
              
              {!result && !isLoading && (
                <Button 
                  onClick={processImage} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Extract Data
                </Button>
              )}
              {isLoading && (
                <Button disabled className="w-full bg-indigo-400 text-white">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing via Tesseract & Gemini AI...
                </Button>
              )}
            </div>

            {/* Right: Results or Error */}
            <div className="h-full">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {isLoading && (
                <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-400">
                  <FileImage className="w-12 h-12 animate-pulse text-indigo-200" />
                  <p className="animate-pulse">Scanning handwriting...</p>
                </div>
              )}

              {result && !isLoading && (
                <div className="h-full bg-emerald-50/50 border border-emerald-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6 text-emerald-700">
                    <CheckCircle2 className="w-6 h-6" />
                    <h3 className="font-semibold text-lg">Extraction Complete</h3>
                  </div>

                  {result.meta?.vitals && Object.keys(result.meta.vitals).length > 0 && (
                    <div className="space-y-4 mb-6">
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Extracted Vitals</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(result.meta.vitals).map(([key, value]) => {
                          if (!value) return null;
                          const labels: Record<string, string> = {
                            bloodPressure: 'Blood Pressure',
                            heartRate: 'Heart Rate',
                            temperature: 'Temperature',
                            weight: 'Weight',
                            spO2: 'SpO2',
                            sugar: 'Blood Sugar'
                          };
                          return (
                            <div key={key} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                              <p className="text-xs text-slate-500 font-medium mb-1">{labels[key] || key}</p>
                              <p className="text-sm font-bold text-slate-900">{String(value)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {result.data?.medications && result.data.medications.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Identified Medications</h4>
                      <div className="space-y-3">
                        {result.data.medications.map((med, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                              <Pill className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{med.name}</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {med.dosage && (
                                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                    {med.dosage}
                                  </span>
                                )}
                                {med.frequency && (
                                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                    {med.frequency}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Raw Extracted Text</h4>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap font-mono">
                        {result.data?.ocrRawText || "No readable text found."}
                      </p>
                    </div>
                  )}

                  {result.data?.notes && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Doctor's Notes</h4>
                      <p className="text-sm text-slate-600 italic bg-white p-4 rounded-lg border border-slate-200">
                        "{result.data.notes}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
