"use client";

import { useState, useRef } from 'react';
import { Mic, Square, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

export function AmbientScribe() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [soapNote, setSoapNote] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'consultation.webm');

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/scribe/generate-soap`, {
            method: 'POST',
            body: formData,
            // If auth is needed, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const result = await response.json();
          if (result.success) setSoapNote(result.soapNote);
        } catch (error) {
          console.error("Transcription failed", error);
        } finally {
          setIsProcessing(false);
        }
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <Card className="w-full shadow-sm border-slate-200">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
          <Mic className="h-5 w-5 text-sky-500"/> AI Ambient Scribe
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col gap-4">
        <div className="flex gap-4">
          {!isRecording ? (
            <Button className="bg-sky-600 hover:bg-sky-700 text-white" disabled={isProcessing} onClick={startRecording}>
              <Mic className="mr-2 h-4 w-4"/> Start Recording
            </Button>
          ) : (
            <Button className="animate-pulse" onClick={stopRecording} variant="destructive">
              <Square className="mr-2 h-4 w-4"/> Stop & Process
            </Button>
          )}
        </div>
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-slate-500 mt-2">
            <Loader2 className="h-4 w-4 animate-spin"/> Analyzing consultation audio...
          </div>
        )}

        {soapNote && (
          <div className="mt-4 p-4 bg-slate-50 rounded-md border border-slate-200 prose prose-slate max-w-none">
            <h3 className="flex items-center gap-2 text-md font-semibold mb-2">
              <FileText className="h-4 w-4"/> Generated SOAP Note
            </h3>
            <ReactMarkdown>{soapNote}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
