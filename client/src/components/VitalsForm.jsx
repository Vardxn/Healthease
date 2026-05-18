import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { logVitals } from '../services/api';

const emptyVitals = {
  bloodPressureSystolic: '',
  bloodPressureDiastolic: '',
  bloodSugar: '',
  spo2: '',
  weight: ''
};

const VitalsForm = ({ userId, onLogSuccess, className = '' }) => {
  const [form, setForm] = useState(emptyVitals);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
      setError('User context is required to log vitals.');
      return;
    }

    const systolic = form.bloodPressureSystolic === '' ? undefined : Number(form.bloodPressureSystolic);
    const diastolic = form.bloodPressureDiastolic === '' ? undefined : Number(form.bloodPressureDiastolic);
    const bloodSugar = form.bloodSugar === '' ? undefined : Number(form.bloodSugar);
    const spo2 = form.spo2 === '' ? undefined : Number(form.spo2);
    const weight = form.weight === '' ? undefined : Number(form.weight);

    try {
      setLoading(true);
      setError('');

      await logVitals({
        userId,
        source: 'Manual',
        metrics: {
          bloodPressure: {
            systolic,
            diastolic
          },
          bloodSugar,
          spo2,
          weight
        }
      });

      setForm(emptyVitals);

      if (typeof onLogSuccess === 'function') {
        await onLogSuccess();
      }
    } catch (submitError) {
      setError(submitError?.response?.data?.msg || 'Failed to save vitals.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Field
          label="Systolic"
          value={form.bloodPressureSystolic}
          onChange={(value) => updateField('bloodPressureSystolic', value)}
          placeholder="120"
          type="number"
        />
        <Field
          label="Diastolic"
          value={form.bloodPressureDiastolic}
          onChange={(value) => updateField('bloodPressureDiastolic', value)}
          placeholder="80"
          type="number"
        />
        <Field
          label="Blood Sugar"
          value={form.bloodSugar}
          onChange={(value) => updateField('bloodSugar', value)}
          placeholder="110"
          type="number"
        />
        <Field
          label="SpO2 %"
          value={form.spo2}
          onChange={(value) => updateField('spo2', value)}
          placeholder="98"
          type="number"
          min="0"
          max="100"
        />
        <Field
          label="Weight (kg)"
          value={form.weight}
          onChange={(value) => updateField('weight', value)}
          placeholder="65"
          type="number"
          step="0.1"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-gray-600"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? 'Saving...' : 'Log Vitals'}
        </button>
      </div>
    </form>
  );
};

function Field({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-sm font-medium text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
        {...rest}
      />
    </label>
  );
}

export default VitalsForm;