import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Loader2, Stethoscope } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { aiAPI } from '../services/api';

const triageStyles = {
  RED: {
    container: 'border-red-200 bg-red-50 text-red-950',
    badge: 'bg-red-600 text-white',
    accent: 'bg-red-600',
    title: 'Alert Crimson'
  },
  YELLOW: {
    container: 'border-amber-200 bg-amber-50 text-amber-950',
    badge: 'bg-amber-500 text-white',
    accent: 'bg-amber-500',
    title: 'Amber Warning'
  },
  GREEN: {
    container: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    badge: 'bg-emerald-600 text-white',
    accent: 'bg-emerald-600',
    title: 'Sage Green'
  }
};

function getTriageTheme(level) {
  return triageStyles[level] || triageStyles.YELLOW;
}

const SymptomChecker = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const triageTheme = useMemo(() => getTriageTheme(result?.triageLevel), [result?.triageLevel]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedSymptoms = symptoms.trim();

    if (!trimmedSymptoms) {
      setError('Please describe the symptoms first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await aiAPI.symptomCheck(trimmedSymptoms);
      setResult(response?.data?.data || null);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to analyze symptoms.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  const recommendedSpecialties = Array.isArray(result?.recommendedSpecialties) ? result.recommendedSpecialties : [];
  const recommendations = Array.isArray(result?.recommendations) ? result.recommendations : [];
  const redFlags = Array.isArray(result?.redFlags) ? result.redFlags : [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-12">
      <div className="rounded-[2rem] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white p-8 md:p-10 shadow-2xl border border-white/10 overflow-hidden relative">
        <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-cyan-500/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="rounded-2xl bg-white/10 p-4">
            <Stethoscope className="h-8 w-8 text-cyan-300" />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Step 2 AI Feature</p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">Symptom Checker</h1>
            <p className="max-w-2xl text-slate-200 md:text-lg">
              Describe symptoms in plain language and get a structured triage response with clear next-step guidance.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-lg p-6 md:p-8 space-y-5">
        <div>
          <label htmlFor="symptoms" className="block text-sm font-semibold text-slate-700 mb-2">
            Symptoms
          </label>
          <textarea
            id="symptoms"
            rows={6}
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
            placeholder="Example: fever, cough, chest discomfort for 2 days"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-white font-semibold hover:bg-slate-800 disabled:bg-slate-400"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? 'Analyzing...' : 'Check Symptoms'}
        </button>
      </form>

      {result && (
        <section className={`mt-8 rounded-3xl border p-6 md:p-8 shadow-lg ${triageTheme.container}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold ${triageTheme.badge}`}>
                {result.triageLevel} · {triageTheme.title}
              </div>
              <h2 className="mt-4 text-2xl md:text-3xl font-bold">Structured triage result</h2>
              <p className="mt-2 max-w-3xl text-sm md:text-base opacity-90">{result.summary}</p>
            </div>
            <div className={`h-3 w-24 rounded-full ${triageTheme.accent}`} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl bg-white/70 p-4 backdrop-blur border border-white/60">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Recommended specialties</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recommendedSpecialties.length ? recommendedSpecialties.map((specialty) => (
                  <span key={specialty} className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white">
                    {specialty}
                  </span>
                )) : <p className="text-sm text-slate-600">General Physician</p>}
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-4 backdrop-blur border border-white/60">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Next steps</p>
              <ul className="mt-3 space-y-2 text-sm">
                {recommendations.length ? recommendations.map((step, index) => (
                  <li key={`${step}-${index}`} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                )) : <li className="text-slate-600">No additional recommendations provided.</li>}
              </ul>
            </div>

            <div className="rounded-2xl bg-white/70 p-4 backdrop-blur border border-white/60">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Red flags</p>
              <ul className="mt-3 space-y-2 text-sm">
                {redFlags.length ? redFlags.map((flag, index) => (
                  <li key={`${flag}-${index}`} className="flex gap-2 text-slate-800">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-600" />
                    <span>{flag}</span>
                  </li>
                )) : <li className="text-slate-600">No specific red flags returned.</li>}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-xs md:text-sm opacity-80">
            {result.disclaimer || 'This result is informational and does not replace a licensed medical professional.'}
          </p>
        </section>
      )}
    </div>
  );
};

export default SymptomChecker;