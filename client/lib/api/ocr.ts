/**
 * API client for interacting with the HealthEase OCR Scanner backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface OCRResult {
  success: boolean;
  msg?: string;
  processingMode?: string;
  meta?: {
    vitals?: {
      bloodPressure?: string;
      heartRate?: string;
      temperature?: string;
      weight?: string;
      spO2?: string;
      sugar?: string;
    };
    [key: string]: any;
  };
  data?: {
    _id?: string;
    ocrRawText?: string;
    doctorName?: string;
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
    notes?: string;
  };
}

export async function uploadPrescriptionImage(file: File): Promise<OCRResult> {
  try {
    const formData = new FormData();
    // prescriptionController expects 'image'
    formData.append('image', file);

    const token = localStorage.getItem('token');
    
    // Call the correct endpoint that runs digitizePrescription
    const response = await fetch(`${API_URL}/prescriptions/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.msg || 'Failed to process image');
    }

    return data;
  } catch (error: any) {
    console.error('API OCR Error:', error);
    throw new Error(error.message || 'Network error occurred while uploading image');
  }
}
