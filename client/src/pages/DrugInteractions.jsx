import { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ChevronDown, Loader2, Plus, X } from 'lucide-react';
import { aiAPI, prescriptionAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const severityRank = { HIGH: 0, MODERATE: 1, LOW: 2 };

const pillClasses = {
  HIGH: 'bg-red-500/20 text-red-200 border-red-500/30',
  MODERATE: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  LOW: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
};

function normalizeMedicationName(value) {
  return String(value || '').trim();
}

function normalizeMedicationPayload(medications) {
  return Array.isArray(medications)
    ? medications.map((medication) => ({
      name: normalizeMedicationName(medication),
      dosage: '',
      frequency: ''
    })).filter((medication) => medication.name)
    : [];
}

const DrugInteractions = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [input, setInput] = useState('');
  const [medications, setMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [showWarningsModal, setShowWarningsModal] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [hasAttemptedCheck, setHasAttemptedCheck] = useState(false);

  const sortedResults = useMemo(() => {
    const interactionWarnings = Array.isArray(warnings) ? [...warnings] : [];
    return interactionWarnings.sort(
      (a, b) => (severityRank[(a?.severity || '').toUpperCase()] ?? 99) - (severityRank[(b?.severity || '').toUpperCase()] ?? 99)
    );
  }, [warnings]);

  const loadPrescriptions = async () => {
    try {
      setLoadingPrescriptions(true);
      const response = await prescriptionAPI.getAll();
      setPrescriptions(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load prescriptions');
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const resetInteractionState = () => {
    setResults(null);
    setWarnings([]);
    setShowWarningsModal(false);
    setError('');
    setStatusMessage('');
    setHasAttemptedCheck(false);
  };

  const verifyInteractions = async (medicationList = medications) => {
    const normalizedMedications = Array.from(
      new Set(normalizeMedicationPayload(medicationList).map((item) => item.name))
    );

    if (!user?._id || normalizedMedications.length < 2) {
      return;
    }

    try {
      setChecking(true);
      setError('');
      setStatusMessage('');
      setHasAttemptedCheck(true);

      const response = await aiAPI.verifyInteractions(user._id, normalizedMedications);
      const payload = response?.data?.data || response?.data || {};
      const nextWarnings = Array.isArray(payload.warnings) ? payload.warnings : [];

      setResults(payload);
      setWarnings(nextWarnings);

      if (payload.conflictsFound) {
        setShowWarningsModal(true);
        setStatusMessage(payload.summary || 'Potential interactions found.');
      } else {
        setShowWarningsModal(false);
        setStatusMessage(payload.summary || 'No known interactions detected.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.msg || 'Failed to verify interactions');
    } finally {
      setChecking(false);
    }
  };

  const loadImportedMedications = async (nextMedications, statusText) => {
    const normalized = Array.from(new Set(nextMedications.map((item) => normalizeMedicationName(item)).filter(Boolean)));
    setMedications(normalized);
    resetInteractionState();
    if (statusText) {
      setStatusMessage(statusText);
    }

    if (normalized.length >= 2) {
      await verifyInteractions(normalized);
    }
  };

  useEffect(() => {
    loadPrescriptions();

    const pending = localStorage.getItem('pendingInteractionCheck');
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        const pendingMedications = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.medications)
            ? parsed.medications
            : [];
        if (pendingMedications.length) {
          void loadImportedMedications(pendingMedications, 'Medications loaded from your recent upload.');
        }
      } catch {
        const fallback = pending
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        if (fallback.length) {
          void loadImportedMedications(fallback, 'Medications loaded from your recent upload.');
        }
      }
      localStorage.removeItem('pendingInteractionCheck');
    }

    const params = new URLSearchParams(location.search);
    const queryMeds = params.get('medications');
    if (!medications.length && queryMeds) {
      const parsed = queryMeds.split(',').map((item) => item.trim()).filter(Boolean);
      if (parsed.length) {
        void loadImportedMedications(parsed, 'Medications loaded from the selected prescription.');
      }
    }
  }, []);

  const addMedication = () => {
    const value = input.trim();
    if (!value) return;

    const nextMedications = Array.from(new Set([...medications, value]));
    setMedications(nextMedications);
    setInput('');
    resetInteractionState();
    if (user?._id && nextMedications.length >= 2) {
      void verifyInteractions(nextMedications);
    }
  };

  const removeMedication = (name) => {
    setMedications((prev) => prev.filter((item) => item !== name));
  };

  const clearAll = () => {
    setMedications([]);
    setSelectedPrescriptionId('');
    resetInteractionState();
  };

  const handlePrescriptionChange = (prescriptionId) => {
    setSelectedPrescriptionId(prescriptionId);
    const selected = prescriptions.find((item) => item._id === prescriptionId);
    if (!selected) return;

    const meds = Array.isArray(selected.medications)
      ? selected.medications
          .map((med) => med?.name || med?.medicineName || med?.medicine_name)
          .filter(Boolean)
      : [];

    void loadImportedMedications(meds, 'Medications imported from selected prescription.');
  };

  const handleCheckInteractions = async () => {
    await verifyInteractions(medications);
  };

  const hasEnoughMedications = medications.length >= 2;
  const hasNoKnownInteractions = hasAttemptedCheck && results && !results.conflictsFound;

  return (
    <>
    <div className="max-w-6xl mx-auto text-white space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Drug Interaction Checker</h1>
        <p className="text-gray-400 mt-2">Check for interactions between your medications before you take them together.</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Add medication</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMedication();
                }
              }}
              placeholder="Type a medicine name"
              className="flex-1 rounded-xl bg-gray-900 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="button"
              onClick={addMedication}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold transition-colors"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm text-gray-400">Medications to check</p>
            <button type="button" onClick={clearAll} className="text-sm text-cyan-300 hover:text-cyan-200">
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-12">
            {medications.length ? medications.map((medication) => (
              <span key={medication} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500 text-white border border-cyan-400/40">
                {medication}
                <button type="button" onClick={() => removeMedication(medication)} className="text-white/90 hover:text-white">
                  <X size={14} />
                </button>
              </span>
            )) : <p className="text-gray-500">No medications added yet.</p>}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-400">Or import from a prescription →</p>
            {loadingPrescriptions ? <span className="text-xs text-gray-500">Loading saved prescriptions...</span> : null}
          </div>
          <div className="relative">
            <select
              value={selectedPrescriptionId}
              onChange={(e) => handlePrescriptionChange(e.target.value)}
              className="w-full appearance-none rounded-xl bg-gray-900 border border-gray-700 text-white px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Select a saved prescription</option>
              {prescriptions.map((prescription) => (
                <option key={prescription._id} value={prescription._id}>
                  {new Date(prescription.uploadDate || prescription.createdAt).toLocaleDateString()} · {prescription.doctorName || 'Doctor not specified'}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {statusMessage && (
          <div className="px-4 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-100 text-sm">
            {statusMessage}
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl border border-red-700 bg-red-900/30 text-red-200 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleCheckInteractions}
          disabled={!hasEnoughMedications || checking}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-950 font-semibold transition-colors"
        >
          {checking ? <Loader2 size={16} className="animate-spin" /> : null}
          {checking ? 'Analyzing interactions...' : 'Check Interactions'}
        </button>
      </div>

      <div className="space-y-4">
        {hasNoKnownInteractions && (
          <div className="bg-emerald-900/30 border border-emerald-700 text-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 size={18} />
            <span>No known interactions detected</span>
          </div>
        )}

        {!showWarningsModal && warnings.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 font-semibold text-sm">
                {warnings.length} warnings found
              </span>
            </div>

            <div className="space-y-4">
              {sortedResults.map((interaction, index) => (
                <div key={`${interaction.subject || interaction.detail}-${index}`} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {interaction.subject || 'Medication warning'}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">Medication interaction detected</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${pillClasses[interaction.severity] || pillClasses.LOW}`}>
                      {interaction.severity || 'LOW'}
                    </span>
                  </div>

                  <p className="text-gray-200 leading-relaxed">{interaction.detail || 'No details provided.'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {showWarningsModal && (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-2xl rounded-3xl bg-white text-slate-900 shadow-2xl overflow-hidden border border-amber-200">
          <div className="bg-gradient-to-r from-amber-500 to-red-500 px-6 py-5 text-white">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold">Interaction warning</h2>
                <p className="mt-1 text-sm text-amber-50/90">
                  We found possible medication conflicts. Review these before proceeding.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <p className="text-sm text-slate-600">
              {results?.summary || 'One or more medication warnings were returned by the backend.'}
            </p>

            <div className="space-y-3">
              {sortedResults.map((warning, index) => (
                <div key={`${warning.subject || warning.detail}-${index}`} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-amber-800 uppercase tracking-wide">
                        {String(warning.type || 'warning').replace(/-/g, ' ')}
                      </p>
                      <h3 className="mt-1 text-base font-bold text-slate-900">
                        {warning.subject || 'Medication warning'}
                      </h3>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${pillClasses[(warning.severity || '').toUpperCase()] || pillClasses.MODERATE}`}>
                      {(warning.severity || 'MODERATE').toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-700 leading-relaxed">{warning.detail}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowWarningsModal(false);
                  setStatusMessage(results?.summary || 'Warnings reviewed.');
                }}
                className="rounded-xl bg-slate-950 px-5 py-3 text-white font-semibold hover:bg-slate-800"
              >
                Review complete
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default DrugInteractions;
