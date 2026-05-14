import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doctorConsultationAPI } from '../services/api';

const emptyMedicine = {
  name: '',
  dosage: '',
  frequency: '',
  duration: ''
};

const emptyTest = {
  testName: '',
  urgency: '',
  reason: ''
};

const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const DoctorConsultationNotes = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [consultation, setConsultation] = useState(null);

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }]);
  const [tests, setTests] = useState([{ ...emptyTest }]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [improvementObserved, setImprovementObserved] = useState(false);
  const [improvementDetails, setImprovementDetails] = useState('');

  useEffect(() => {
    const doctorToken = localStorage.getItem('doctorToken');
    if (!doctorToken) {
      navigate('/doctor/login');
      return;
    }

    const loadConsultation = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await doctorConsultationAPI.getById(id);

        const data = response?.data?.data;
        setConsultation(data || null);

        const notes = data?.notes || {};
        setChiefComplaint(notes?.chiefComplaint || '');
        setDiagnosis(notes?.diagnosis || '');
        setMedicines(Array.isArray(notes?.prescribedMedicines) && notes.prescribedMedicines.length ? notes.prescribedMedicines.map((m) => ({
          name: m?.name || '',
          dosage: m?.dosage || '',
          frequency: m?.frequency || '',
          duration: m?.duration || ''
        })) : [{ ...emptyMedicine }]);
        setTests(Array.isArray(notes?.testsOrdered) && notes.testsOrdered.length ? notes.testsOrdered.map((t) => ({
          testName: t?.testName || '',
          urgency: t?.urgency || '',
          reason: t?.reason || ''
        })) : [{ ...emptyTest }]);
        setFollowUpDate(toInputDate(notes?.followUpDate));
        setPrivateNotes(notes?.doctorPrivateNotes || '');
        setImprovementObserved(!!notes?.improvementObserved?.observed);
        setImprovementDetails(notes?.improvementObserved?.details || '');
      } catch (err) {
        setError(err.response?.data?.msg || 'Unable to load consultation details');
      } finally {
        setLoading(false);
      }
    };

    loadConsultation();
  }, [doctorToken, id, navigate]);

  const patientName = consultation?.patientId?.name || 'Unknown';
  const patientAge = consultation?.patientId?.profile?.age ?? 'N/A';
  const patientBloodGroup = consultation?.patientId?.profile?.bloodGroup || 'N/A';

  const updateMedicine = (index, field, value) => {
    setMedicines((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  };

  const addMedicine = () => setMedicines((prev) => [...prev, { ...emptyMedicine }]);
  const removeMedicine = (index) => {
    setMedicines((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)));
  };

  const updateTest = (index, field, value) => {
    setTests((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  };

  const addTest = () => setTests((prev) => [...prev, { ...emptyTest }]);
  const removeTest = (index) => {
    setTests((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const cleanedMedicines = medicines
        .map((m) => ({
          name: String(m.name || '').trim(),
          dosage: String(m.dosage || '').trim(),
          frequency: String(m.frequency || '').trim(),
          duration: String(m.duration || '').trim()
        }))
        .filter((m) => m.name);

      const cleanedTests = tests
        .map((t) => ({
          testName: String(t.testName || '').trim(),
          urgency: String(t.urgency || '').trim(),
          reason: String(t.reason || '').trim()
        }))
        .filter((t) => t.testName);

      await doctorConsultationAPI.addNotes(id, {
        chiefComplaint,
        diagnosis,
        prescribedMedicines: cleanedMedicines,
        testsOrdered: cleanedTests,
        followUpDate: followUpDate || null,
        doctorPrivateNotes: privateNotes,
        improvementObserved: {
          observed: improvementObserved,
          details: improvementDetails
        }
      });

      setSuccess('Consultation notes saved successfully. Redirecting...');
      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to save consultation notes');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-300">
        Loading consultation notes form...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 text-gray-100">
      <header className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h1 className="text-3xl font-bold">Consultation Notes</h1>
        <p className="mt-1 text-sm text-gray-400">Fill structured notes for this completed consultation.</p>
      </header>

      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="text-lg font-semibold">Patient Information</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-700 bg-gray-950/70 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Name</p>
            <p className="text-sm text-gray-200">{patientName}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-950/70 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Age</p>
            <p className="text-sm text-gray-200">{patientAge}</p>
          </div>
          <div className="rounded-lg border border-gray-700 bg-gray-950/70 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">Blood Group</p>
            <p className="text-sm text-gray-200">{patientBloodGroup}</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
        ) : null}

        {success ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>
        ) : null}

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-300">Chief Complaint</label>
            <textarea
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
              rows={3}
              placeholder="Patient's primary complaint"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Diagnosis</label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
              rows={3}
              placeholder="Final diagnosis"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Prescribed Medicines</h3>
            <button type="button" onClick={addMedicine} className="rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-gray-950 hover:bg-cyan-400">Add Medicine</button>
          </div>

          {medicines.map((med, index) => (
            <div key={`medicine-${index}`} className="grid grid-cols-1 gap-2 rounded-xl border border-gray-700 bg-gray-950/70 p-3 md:grid-cols-5">
              <input value={med.name} onChange={(e) => updateMedicine(index, 'name', e.target.value)} placeholder="Name" className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-cyan-500 focus:outline-none" />
              <input value={med.dosage} onChange={(e) => updateMedicine(index, 'dosage', e.target.value)} placeholder="Dosage" className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-cyan-500 focus:outline-none" />
              <input value={med.frequency} onChange={(e) => updateMedicine(index, 'frequency', e.target.value)} placeholder="Frequency" className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-cyan-500 focus:outline-none" />
              <input value={med.duration} onChange={(e) => updateMedicine(index, 'duration', e.target.value)} placeholder="Duration" className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-cyan-500 focus:outline-none" />
              <button type="button" onClick={() => removeMedicine(index)} className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/20">Remove</button>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tests Ordered</h3>
            <button type="button" onClick={addTest} className="rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-gray-950 hover:bg-cyan-400">Add Test</button>
          </div>

          {tests.map((test, index) => (
            <div key={`test-${index}`} className="grid grid-cols-1 gap-2 rounded-xl border border-gray-700 bg-gray-950/70 p-3 md:grid-cols-4">
              <input value={test.testName} onChange={(e) => updateTest(index, 'testName', e.target.value)} placeholder="Test Name" className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-cyan-500 focus:outline-none" />
              <input value={test.urgency} onChange={(e) => updateTest(index, 'urgency', e.target.value)} placeholder="Urgency" className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-cyan-500 focus:outline-none" />
              <input value={test.reason} onChange={(e) => updateTest(index, 'reason', e.target.value)} placeholder="Reason" className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-cyan-500 focus:outline-none" />
              <button type="button" onClick={() => removeTest(index)} className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/20">Remove</button>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-300">Follow-up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Doctor Private Notes</label>
            <textarea
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
              placeholder="Internal notes not shown to patient initially"
            />
          </div>

          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={improvementObserved}
                onChange={(e) => setImprovementObserved(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-cyan-400 focus:ring-cyan-400"
              />
              Improvement Observed
            </label>

            {improvementObserved ? (
              <textarea
                value={improvementDetails}
                onChange={(e) => setImprovementDetails(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
                placeholder="Describe improvement from last visit"
              />
            ) : null}
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/doctor/dashboard')}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-gray-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorConsultationNotes;
