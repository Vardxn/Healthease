/**
 * API client for interacting with the HealthEase OCR Scanner backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface OCRResult {
  success: boolean;
  msg?: string;
  processingMode?: string;
  data?: {
    rawText: string;
    structuredData?: {
      patientName?: string;
      date?: string;
      medications?: Array<{
        name: string;
        dosage: string;
        frequency: string;
      }>;
      notes?: string;
    };
  };
}

export async function uploadPrescriptionImage(file: File): Promise<OCRResult> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/ocr/handwriting`, {
      method: 'POST',
      headers: {
        // Note: Do NOT set Content-Type header manually when using FormData!
        // The browser automatically sets it to multipart/form-data with the correct boundary.
        'Authorization': `Bearer demo-token-placeholder`
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
