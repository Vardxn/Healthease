import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ChevronDown, Loader2, Plus, Trash2, X } from 'lucide-react';
import { interactionsAPI, prescriptionAPI } from '../services/api';

const severityRank = { HIGH: 0, MODERATE: 1, LOW: 2 };

const pillClasses = {
  HIGH: 'bg-red-500/20 text-red-200 border-red-500/30',
  MODERATE: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  LOW: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
};

const DrugInteractions = () => {
  const location = useLocation();
  const [input, setInput] = useState('');
  const [medications, setMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const sortedResults = useMemo(() => {
    const interactions = Array.isArray(results?.interactions) ? [...results.interactions] : [];
    return interactions.sort((a, b) => (severityRank[a?.severity] ?? 99) - (severityRank[b?.severity] ?? 99));
  }, [results]);

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
          setMedications(Array.from(new Set(pendingMedications.map((item) => String(item).trim()).filter(Boolean))));
          setStatusMessage('Medications loaded from your recent upload.');
        }
      } catch {
        const fallback = pending
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        if (fallback.length) {
          setMedications(Array.from(new Set(fallback)));
          setStatusMessage('Medications loaded from your recent upload.');
        }
      }
      localStorage.removeItem('pendingInteractionCheck');
    }

    const params = new URLSearchParams(location.search);
    const queryMeds = params.get('medications');
    if (!medications.length && queryMeds) {
      const parsed = queryMeds.split(',').map((item) => item.trim()).filter(Boolean);
      if (parsed.length) {
        setMedications(Array.from(new Set(parsed)));
      }
    }
  }, []);

  const addMedication = () => {
    const value = input.trim();
    if (!value) return;
    setMedications((prev) => Array.from(new Set([...prev, value])));
    setInput('');
    setError('');
    setResults(null);
    setStatusMessage('');
  };

  const removeMedication = (name) => {
    setMedications((prev) => prev.filter((item) => item !== name));
  };

  const clearAll = () => {
    setMedications([]);
    setSelectedPrescriptionId('');
    setResults(null);
    setError('');
    setStatusMessage('');
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

    setMedications(Array.from(new Set(meds.map((item) => String(item).trim()).filter(Boolean))));
    setResults(null);
    setError('');
    setStatusMessage('Medications imported from selected prescription.');
  };

  const handleCheckInteractions = async () => {
    if (medications.length < 2) return;
    try {
      setChecking(true);
      setError('');
      setStatusMessage('');
      const response = await interactionsAPI.check(medications);
      const interactions = Array.isArray(response.data.interactions) ? response.data.interactions : [];
      setResults({
        ...response.data,
        interactions: interactions.sort((a, b) => (severityRank[a?.severity] ?? 99) - (severityRank[b?.severity] ?? 99))
      });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.msg || 'Failed to check interactions');
    } finally {
      setChecking(false);
    }
  };

  const hasEnoughMedications = medications.length >= 2;

  return (
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
        {results?.interactions?.length === 0 && results && (
          <div className="bg-emerald-900/30 border border-emerald-700 text-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 size={18} />
            <span>No interactions found between these medications</span>
          </div>
        )}

        {results?.interactions?.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 font-semibold text-sm">
                {results.interactions.length} interactions found
              </span>
            </div>

            <div className="space-y-4">
              {sortedResults.map((interaction, index) => (
                <div key={`${interaction.drug1}-${interaction.drug2}-${index}`} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {interaction.drug1} ↔ {interaction.drug2}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">Medication interaction detected</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${pillClasses[interaction.severity] || pillClasses.LOW}`}>
                      {interaction.severity || 'LOW'}
                    </span>
                  </div>

                  <p className="text-gray-200 leading-relaxed">{interaction.description || 'No description provided.'}</p>

                  <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-50">
                    <p className="text-sm font-semibold mb-1">Recommendation</p>
                    <p className="text-sm leading-relaxed">{interaction.recommendation || 'Consult your clinician or pharmacist.'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrugInteractions;
