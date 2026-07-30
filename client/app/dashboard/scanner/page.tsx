import { OCRScanner } from '@/components/OCRScanner';

export const metadata = {
  title: 'OCR Scanner | HealthEase',
  description: 'Extract medications from handwritten prescriptions',
};

export default function ScannerPage() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upload Prescription</h1>
        <p className="text-slate-500 mt-2 max-w-3xl">
          Securely upload a photo of your doctor's handwritten prescription. Our AI vision system will automatically extract the medications, dosages, and instructions and save them to your health profile.
        </p>
      </div>

      <OCRScanner />
    </div>
  );
}
