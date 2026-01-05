import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { prescriptionAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const PrescriptionList = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchPrescriptions();
  }, [isAuthenticated, navigate]);

  const fetchPrescriptions = async () => {
    try {
      const response = await prescriptionAPI.getAll();
      setPrescriptions(response.data.data);
    } catch (err) {
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      await prescriptionAPI.delete(id);
      setPrescriptions(prescriptions.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete prescription');
    }
  };

  const handleVerify = async (id) => {
    try {
      await prescriptionAPI.update(id, { isVerified: true });
      setPrescriptions(prescriptions.map(p => 
        p._id === id ? { ...p, isVerified: true } : p
      ));
    } catch (err) {
      alert('Failed to verify prescription');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-4xl animate-spin">⚙️</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          📋 My Prescriptions
        </h1>
        <button
          onClick={() => navigate('/upload')}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
        >
          + Upload New
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No prescriptions yet
          </h3>
          <p className="text-gray-600 mb-6">
            Upload your first prescription to get started
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-medium"
          >
            Upload Prescription
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((prescription) => (
            <div 
              key={prescription._id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      Prescription
                    </h3>
                    {prescription.isVerified ? (
                      <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">
                        ⚠ Unverified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(prescription.uploadDate).toLocaleDateString()}
                  </p>
                  {prescription.doctorName && (
                    <p className="text-sm text-gray-600 mt-1">
                      Doctor: {prescription.doctorName}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!prescription.isVerified && (
                    <button
                      onClick={() => handleVerify(prescription._id)}
                      className="text-green-600 hover:text-green-800 font-medium text-sm"
                    >
                      ✓ Verify
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(prescription._id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-2">Medications:</p>
                {prescription.medications?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {prescription.medications.map((med, idx) => (
                      <div 
                        key={idx}
                        className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <p className="font-semibold text-gray-800">{med.name}</p>
                        <p className="text-sm text-gray-600">
                          {med.dosage} - {med.frequency}
                        </p>
                        {med.duration && (
                          <p className="text-xs text-gray-500 mt-1">
                            Duration: {med.duration}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No medications found</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionList;
