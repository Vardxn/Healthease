import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { prescriptionAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const EMPTY_MEDICATION = { name: '', dosage: '', frequency: '', duration: '' };

const UploadPrescription = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reviewDraft, setReviewDraft] = useState(null);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const resetSelectedFile = () => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  };

  const sanitizeMedicationList = (medications = []) => {
    if (!Array.isArray(medications)) {
      return [];
    }

    return medications
      .map((med) => ({
        name: (med?.name || '').trim(),
        dosage: (med?.dosage || '').trim(),
        frequency: (med?.frequency || '').trim(),
        duration: (med?.duration || '').trim()
      }))
      .filter((med) => med.name);
  };

  const initializeReviewDraft = (prescriptionData) => {
    setReviewDraft({
      doctorName: prescriptionData?.doctorName || '',
      notes: prescriptionData?.notes || '',
      isVerified: prescriptionData?.isVerified || false,
      medications: Array.isArray(prescriptionData?.medications) && prescriptionData.medications.length
        ? prescriptionData.medications.map((med) => ({
            name: med?.name || '',
            dosage: med?.dosage || '',
            frequency: med?.frequency || '',
            duration: med?.duration || ''
          }))
        : [{ ...EMPTY_MEDICATION }]
    });
    setReviewMessage('');
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setError('Please upload a valid image file (JPG, PNG, GIF, or WEBP).');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum allowed size is 10MB.');
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError('');
    setResult(null);
    setReviewDraft(null);
    setReviewMessage('');
    setUploadProgress(0);
  };

  const handleDraftFieldChange = (field, value) => {
    setReviewDraft((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setReviewDraft((prev) => {
      const nextMeds = [...prev.medications];
      nextMeds[index] = {
        ...nextMeds[index],
        [field]: value
      };

      return {
        ...prev,
        medications: nextMeds
      };
    });
  };

  const addMedicationRow = () => {
    setReviewDraft((prev) => ({
      ...prev,
      medications: [...prev.medications, { ...EMPTY_MEDICATION }]
    }));
  };

  const removeMedicationRow = (index) => {
    setReviewDraft((prev) => {
      const nextMeds = prev.medications.filter((_, idx) => idx !== index);
      return {
        ...prev,
        medications: nextMeds.length ? nextMeds : [{ ...EMPTY_MEDICATION }]
      };
    });
  };

  const handleReviewSave = async () => {
    if (!result?.data?._id || !reviewDraft) {
      return;
    }

    const payload = {
      doctorName: reviewDraft.doctorName?.trim() || '',
      notes: reviewDraft.notes?.trim() || '',
      isVerified: reviewDraft.isVerified,
      medications: sanitizeMedicationList(reviewDraft.medications)
    };

    setReviewSaving(true);
    setReviewMessage('');

    try {
      const response = await prescriptionAPI.update(result.data._id, payload);
      setResult((prev) => ({
        ...prev,
        data: response.data.data
      }));
      initializeReviewDraft(response.data.data);
      setReviewMessage('Review saved successfully.');
    } catch (err) {
      setReviewMessage(err.response?.data?.msg || 'Failed to save review changes.');
    } finally {
      setReviewSaving(false);
    }
  };

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
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('prescription', file);

    try {
      const response = await prescriptionAPI.upload(formData, {
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      setResult(response.data);
      initializeReviewDraft(response.data.data);
      resetSelectedFile();
      setUploadProgress(100);
    } catch (err) {
      setError(err.response?.data?.msg || 'Upload failed. Please try again.');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const ocrQuality = result?.meta?.quality;
  const ocrWarnings = result?.meta?.warnings || [];
  const ocrRecommendations = ocrQuality?.recommendations || [];
  const qualityLevel = ocrQuality?.confidenceLevel || 'medium';
  const qualityClassName = qualityLevel === 'high'
    ? 'bg-green-100 text-green-800 border-green-300'
    : qualityLevel === 'low'
      ? 'bg-red-100 text-red-800 border-red-300'
      : 'bg-amber-100 text-amber-800 border-amber-300';

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
                  PNG, JPG, GIF, WEBP up to 10MB
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
                  onClick={resetSelectedFile}
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

          <p className="mt-3 text-sm text-gray-600 text-center">
            For best results: place prescription flat, photograph from directly above in good lighting
          </p>
        </form>

        {/* Processing Info */}
        {loading && (
          <div className="mt-8 gradient-accent text-white rounded-xl p-6 animate-slideUp">
            <div className="flex items-center gap-4">
              <div className="animate-spin text-4xl">⚙️</div>
              <div>
                <p className="font-bold text-lg mb-1">Processing your prescription...</p>
                <p className="text-sm text-white/90">
                  Uploading image and running OCR
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/90 mb-2">
                <span>Upload progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result?.data && (
          <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 animate-slideUp shadow-xl">
            <h3 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-3">
              <span className="text-4xl">✅</span>
              Prescription Digitized Successfully!
            </h3>

            <div className="mb-6 bg-white rounded-xl p-4 shadow-md">
              <p className="text-gray-600 font-medium text-sm mb-1">OCR Mode:</p>
              <p className="text-gray-900 font-semibold">
                {result.processingMode === 'demo-fallback' ? 'Demo fallback' : 'Real OCR'}
              </p>
            </div>

            {ocrQuality && (
              <div className="mb-6 bg-white rounded-xl p-4 shadow-md border border-gray-200">
                <p className="text-gray-700 font-bold mb-3 text-lg">🎯 OCR Confidence</p>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`px-3 py-1 text-sm rounded-full border font-semibold uppercase tracking-wide ${qualityClassName}`}>
                    {ocrQuality.confidenceLevel} confidence
                  </span>
                  <span className="text-sm text-gray-700 font-semibold">
                    Score: {ocrQuality.confidenceScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${qualityLevel === 'high' ? 'bg-green-500' : qualityLevel === 'low' ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${ocrQuality.confidenceScore}%` }}
                  />
                </div>
              </div>
            )}

            {(ocrWarnings.length > 0 || ocrRecommendations.length > 0) && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                <p className="text-amber-900 font-bold mb-2">⚠️ Quality Warnings</p>
                {ocrWarnings.length > 0 && (
                  <ul className="text-sm text-amber-900 list-disc ml-5 space-y-1 mb-3">
                    {ocrWarnings.map((warning, idx) => (
                      <li key={`warn-${idx}`}>{warning}</li>
                    ))}
                  </ul>
                )}
                {ocrRecommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">Recommended actions</p>
                    <ul className="text-sm text-amber-900 list-disc ml-5 space-y-1">
                      {ocrRecommendations.map((item, idx) => (
                        <li key={`rec-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {reviewDraft && (
              <div className="mb-6 bg-white rounded-xl p-5 shadow-md">
                <p className="text-gray-700 font-bold mb-3 text-lg">🧾 Review Extracted Prescription</p>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={reviewDraft.doctorName}
                    onChange={(e) => handleDraftFieldChange('doctorName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter doctor name"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={reviewDraft.notes}
                    onChange={(e) => handleDraftFieldChange('notes', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Optional notes about this prescription"
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                  <input
                    type="checkbox"
                    checked={reviewDraft.isVerified}
                    onChange={(e) => handleDraftFieldChange('isVerified', e.target.checked)}
                    className="w-4 h-4"
                  />
                  Mark as verified
                </label>
              </div>
            )}

            {result.data.ocrRawText && (
              <div className="mb-6 bg-white rounded-xl p-4 shadow-md">
                <details>
                  <summary className="text-gray-700 font-bold text-lg cursor-pointer select-none">
                    View Raw OCR Text
                  </summary>
                  <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-gray-700 bg-gray-50 p-3 rounded-lg max-h-80 overflow-y-auto">
                    {result.data.ocrRawText}
                  </pre>
                </details>
              </div>
            )}

            <div className="mb-6">
              <p className="text-gray-700 font-bold mb-4 text-lg">💊 Medications:</p>
              {reviewDraft?.medications?.length > 0 ? (
                <div className="grid gap-4">
                  {reviewDraft.medications.map((med, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-primary-500">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Medicine Name</label>
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => handleMedicationChange(idx, 'name', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. Amoxicillin"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Dosage</label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. 500mg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Frequency</label>
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => handleMedicationChange(idx, 'frequency', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. Twice daily"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Duration</label>
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) => handleMedicationChange(idx, 'duration', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="e.g. 7 days"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeMedicationRow(idx)}
                          className="text-sm text-red-600 hover:text-red-800 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMedicationRow}
                    className="bg-white border-2 border-dashed border-primary-300 text-primary-700 rounded-xl p-4 font-semibold hover:bg-primary-50"
                  >
                    + Add Medication
                  </button>
                </div>
              ) : (
                <p className="text-gray-600 bg-white p-4 rounded-xl">No medications found</p>
              )}
            </div>

            {reviewMessage && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-800 text-sm font-medium">
                {reviewMessage}
              </div>
            )}

            {reviewDraft && (
              <button
                type="button"
                onClick={handleReviewSave}
                disabled={reviewSaving}
                className="w-full mb-4 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-all font-bold text-lg disabled:opacity-60"
              >
                {reviewSaving ? 'Saving Changes...' : 'Save Reviewed Prescription'}
              </button>
            )}

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
            'Our OCR engine preprocesses the image for better clarity',
            'Text is extracted and organized into readable sections',
            'Medicine details are parsed into dosage and schedule fields',
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
            <strong>Note:</strong> If live OCR is unavailable, the app automatically falls back to demo OCR output.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadPrescription;
