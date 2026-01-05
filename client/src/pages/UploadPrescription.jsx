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
  const [dragActive, setDragActive] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
      setResult(null);
    }
  };

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
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-3">
          📤 Upload Prescription
        </h1>
        <p className="text-gray-600 text-lg">Digitize your prescription with AI in seconds</p>
      </div>

      <div className="glass-effect rounded-2xl shadow-2xl p-10">
        <form onSubmit={handleUpload}>
          {/* File Upload Area */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-4 text-lg">
              📸 Select Prescription Image
            </label>
            <div 
              className={`border-3 border-dashed ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'} rounded-2xl p-12 text-center hover:border-primary-400 hover:bg-primary-50 transition-all duration-300 ${file ? 'border-primary-500 bg-primary-50' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="bg-gradient-primary text-white w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-glow">
                  📷
                </div>
                <p className="text-gray-700 mb-2 text-lg font-semibold">
                  {file ? `Selected: ${file.name}` : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </label>
            </div>
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="mb-8 animate-slideUp">
              <p className="text-gray-700 font-semibold mb-4 text-lg">✨ Preview:</p>
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-w-2xl mx-auto rounded-2xl shadow-2xl border-4 border-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-4 right-4 bg-red-500 text-white w-10 h-10 rounded-full hover:bg-red-600 transition shadow-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 animate-slideUp">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full gradient-primary text-white py-5 rounded-xl font-bold text-lg hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
          >
            {loading ? '🔍 Processing with AI...' : '🚀 Upload & Digitize Now'}
          </button>
        </form>

        {/* Processing Info */}
        {loading && (
          <div className="mt-8 gradient-accent text-white rounded-xl p-6 animate-slideUp">
            <div className="flex items-center gap-4">
              <div className="animate-spin text-4xl">⚙️</div>
              <div>
                <p className="font-bold text-lg mb-1">Processing your prescription...</p>
                <p className="text-sm text-white/90">
                  🎭 Demo Mode: Generating sample prescription data
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 animate-slideUp shadow-xl">
            <h3 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-3">
              <span className="text-4xl">✅</span>
              Prescription Digitized Successfully!
            </h3>
            
            {result.doctorName && (
              <div className="mb-6 bg-white rounded-xl p-4 shadow-md">
                <p className="text-gray-600 font-medium text-sm mb-1">👨‍⚕️ Doctor:</p>
                <p className="text-gray-900 font-bold text-xl">{result.doctorName}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-gray-700 font-bold mb-4 text-lg">💊 Medications:</p>
              {result.medications?.length > 0 ? (
                <div className="grid gap-4">
                  {result.medications.map((med, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-primary-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg mb-2">{med.name}</p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">💊 Dosage:</span> {med.dosage}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">🕐 Frequency:</span> {med.frequency}
                            </p>
                            {med.duration && (
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">⏱️ Duration:</span> {med.duration}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 bg-white p-4 rounded-xl">No medications found</p>
              )}
            </div>

            <button
              onClick={() => navigate('/prescriptions')}
              className="w-full gradient-primary text-white py-4 rounded-xl hover:shadow-glow transition-all font-bold text-lg transform hover:scale-[1.02]"
            >
              📋 View All Prescriptions
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 glass-effect rounded-2xl p-8 shadow-lg">
        <h3 className="font-bold text-primary-800 mb-4 text-xl flex items-center gap-3">
          <span className="text-3xl">📋</span>
          How it works:
        </h3>
        <div className="space-y-3">
          {[
            'Upload a clear image of your handwritten prescription',
            'Our AI preprocesses the image for optimal clarity',
            'Google Vision extracts text using advanced OCR',
            'GPT-4o parses medications, dosages, and instructions',
            'Review and verify the digitized prescription'
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white/50 p-3 rounded-xl">
              <div className="bg-primary-100 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {idx + 1}
              </div>
              <p className="text-gray-700">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-accent-50 border-2 border-accent-200 rounded-xl p-4">
          <p className="text-sm text-accent-800">
            <strong>🎭 Demo Mode Active:</strong> This version uses mock data. To enable real OCR, add your OpenAI and Google Vision API keys to the .env file.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadPrescription;
