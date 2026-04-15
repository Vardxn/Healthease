import { useState, useEffect } from 'react';
import { reminderAPI } from '../services/api';

const ReminderModal = ({ 
  isOpen, 
  onClose, 
  prescriptionId,
  medications,
  onSaveSuccess 
}) => {
  const [enabled, setEnabled] = useState(false);
  const [reminderTimes, setReminderTimes] = useState(['08:00', '14:00', '21:00']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current reminder configuration when modal opens
  useEffect(() => {
    if (isOpen && prescriptionId) {
      fetchReminderConfig();
    }
  }, [isOpen, prescriptionId]);

  const fetchReminderConfig = async () => {
    try {
      const response = await reminderAPI.getReminder(prescriptionId);
      if (response.data.success) {
        const reminder = response.data.data.reminder;
        setEnabled(reminder.enabled || false);
        setReminderTimes(reminder.times && reminder.times.length > 0 
          ? reminder.times 
          : ['08:00', '14:00', '21:00']
        );
      }
    } catch (err) {
      console.error('Error fetching reminder config:', err);
      // Use defaults if fetch fails
      setEnabled(false);
      setReminderTimes(['08:00', '14:00', '21:00']);
    }
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...reminderTimes];
    newTimes[index] = value;
    setReminderTimes(newTimes);
  };

  const addReminderTime = () => {
    if (reminderTimes.length < 4) {
      setReminderTimes([...reminderTimes, '12:00']);
    }
  };

  const removeReminderTime = (index) => {
    setReminderTimes(reminderTimes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    // Validate reminder times
    if (enabled && reminderTimes.length === 0) {
      setError('Please add at least one reminder time');
      return;
    }

    // Validate time format
    for (let time of reminderTimes) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time)) {
        setError(`Invalid time format: ${time}. Use HH:MM (e.g., 08:00)`);
        return;
      }
    }

    try {
      setLoading(true);
      const response = await reminderAPI.setReminder({
        prescriptionId,
        reminderTimes: enabled ? reminderTimes : [],
        enabled
      });

      if (response.data.success) {
        setSuccess('Reminder saved successfully! ✓');
        setTimeout(() => {
          onSaveSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save reminder');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">💊 Set Medication Reminders</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {/* Medications Display */}
            {medications && medications.length > 0 && (
              <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">Medications in this prescription:</p>
                <ul className="space-y-2">
                  {medications.map((med, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      <span className="font-medium">{med.name}</span>
                      {med.dosage && <span className="text-gray-600"> - {med.dosage}</span>}
                      {med.frequency && <span className="text-gray-600"> ({med.frequency})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Enable/Disable Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center cursor-pointer">
                  <span className="text-gray-800 font-medium">Enable Reminders</span>
                </label>
                <button
                  onClick={() => setEnabled(!enabled)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Reminder Times (shown only if enabled) */}
            {enabled && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Reminder Times</h3>
                  <span className="text-xs text-gray-500">{reminderTimes.length}/4</span>
                </div>

                {/* Time inputs */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {reminderTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {reminderTimes.length > 1 && (
                        <button
                          onClick={() => removeReminderTime(index)}
                          className="text-red-600 hover:text-red-800 transition font-medium text-sm px-3 py-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add more times button */}
                {reminderTimes.length < 4 && (
                  <button
                    onClick={addReminderTime}
                    className="w-full py-2 px-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                  >
                    + Add Another Time (Max 4)
                  </button>
                )}
              </div>
            )}

            {/* Info text */}
            <p className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              ℹ️ Reminders will be sent via email at your scheduled times daily. 
              Make sure your email address in profile is current.
            </p>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Reminders'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReminderModal;
