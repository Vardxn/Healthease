import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { prescriptionAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const UploadPrescription = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('prescription', file);

    try {
      const response = await prescriptionAPI.upload(formData);
      setResult(response.data.data);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        📤 Upload Prescription
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleUpload}>
          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              Select Prescription Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </label>
            </div>
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-3">Preview:</p>
              <img 
                src={preview} 
                alt="Preview" 
                className="max-w-md mx-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? '🔍 Processing with AI...' : '🚀 Upload & Digitize'}
          </button>
        </form>

        {/* Processing Info */}
        {loading && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin text-2xl">⚙️</div>
              <div>
                <p className="font-semibold text-blue-800">Processing your prescription...</p>
                <p className="text-sm text-blue-600">
                  Using Google Vision OCR and OpenAI GPT-4o for accurate extraction
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">
              ✅ Prescription Digitized Successfully!
            </h3>
            
            {result.doctorName && (
              <div className="mb-4">
                <p className="text-gray-700 font-medium">Doctor:</p>
                <p className="text-gray-900">{result.doctorName}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-gray-700 font-medium mb-2">Medications:</p>
              {result.medications?.length > 0 ? (
                <div className="space-y-3">
                  {result.medications.map((med, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-green-200">
                      <p className="font-semibold text-gray-800">{med.name}</p>
                      <p className="text-sm text-gray-600">
                        Dosage: {med.dosage} | Frequency: {med.frequency}
                        {med.duration && ` | Duration: ${med.duration}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No medications found</p>
              )}
            </div>

            <button
              onClick={() => navigate('/prescriptions')}
              className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition font-medium"
            >
              View All Prescriptions
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-800 mb-3">📋 How it works:</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>Upload a clear image of your handwritten prescription</li>
          <li>Our AI preprocesses the image for optimal clarity</li>
          <li>Google Vision extracts text using advanced OCR</li>
          <li>GPT-4o parses medications, dosages, and instructions</li>
          <li>Review and verify the digitized prescription</li>
        </ol>
      </div>
    </div>
  );
};

export default UploadPrescription;
