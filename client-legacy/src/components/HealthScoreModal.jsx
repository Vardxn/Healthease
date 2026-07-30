import React from 'react';
import { 
  X, 
  Activity, 
  TrendingUp, 
  Pill, 
  Video, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

export default function HealthScoreModal({ isOpen, onClose, score = 94 }) {
  if (!isOpen) return null;

  const getStatus = (val) => {
    if (val >= 90) return { label: 'Excellent', color: 'text-success bg-success/10 border-success/30' };
    if (val >= 75) return { label: 'Good', color: 'text-secondary bg-secondary/10 border-secondary/30' };
    if (val >= 50) return { label: 'Average', color: 'text-warning bg-warning/10 border-warning/30' };
    return { label: 'Needs Attention', color: 'text-danger bg-danger/10 border-danger/30' };
  };

  const status = getStatus(score);

  const breakdowns = [
    { label: 'Medication Adherence', val: '94%', desc: 'Based on marked daily reminder logs', icon: Pill, color: 'text-primary bg-primary/10' },
    { label: 'Vitals Logging Frequency', val: '85%', desc: 'Log weekly heart rate & blood pressure', icon: Activity, color: 'text-secondary bg-secondary/10' },
    { label: 'Consultation Attendance', val: '100%', desc: 'Participation rate in booked meetings', icon: Video, color: 'text-success bg-success/10' }
  ];

  const recommendations = [
    { text: 'Refill your Lisinopril 10mg script: only 8 tablets left in current stock.', critical: true },
    { text: 'Log your diastolic BP metric this week to sustain weekly vitals timeline analytics.', critical: false },
    { text: 'Prepare for your upcoming consultation with Dr. Jenkins scheduled for June 18.', critical: false }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-xl bg-white dark:bg-card border border-border shadow-2xl rounded-custom z-50 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-border pb-4">
          <div>
            <h3 className="text-base font-black text-text-primary tracking-tight">Smart Health Score</h3>
            <p className="text-[10px] text-text-secondary mt-0.5">Calculated dynamically based on clinical logs and adherence schedules.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Big Circle Score Display */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border border-border rounded-custom bg-slate-50 dark:bg-slate-900/30">
          <div className="relative w-24 h-24 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-black text-primary">{score}</span>
          </div>
          <div className="space-y-1.5 text-center sm:text-left">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
              <CheckCircle2 size={12} />
              {status.label} Status
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your compliance ratio is in the top 5% of active clinic patients. Regular uploads and prompt consultations sustain high scores.
            </p>
          </div>
        </div>

        {/* Breakdowns list */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs text-text-primary uppercase tracking-wider">Score Parameters</h4>
          <div className="space-y-2.5">
            {breakdowns.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-custom bg-white dark:bg-card">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${b.color}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-text-primary">{b.label}</p>
                      <p className="text-[9px] text-text-secondary">{b.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-text-primary">{b.val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score History Graph Mock */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs text-text-primary uppercase tracking-wider">Monthly Score History</h4>
          <div className="flex items-end gap-3 h-20 pt-4 border-b border-border pb-1">
            {[
              { month: 'April', val: 78 },
              { month: 'May', val: 86 },
              { month: 'June', val: 94 }
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/20 hover:bg-primary rounded-t-sm transition-all" style={{ height: `${item.val}%` }} />
                <span className="text-[8px] text-text-secondary font-bold uppercase">{item.month} ({item.val})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-warning" /> Clinical Guidelines & Actions
          </h4>
          <ul className="space-y-2 text-xs">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/30 rounded-xl border-l-4 border-primary">
                <p className="text-text-secondary leading-relaxed">
                  {rec.critical && <span className="font-bold text-danger">[REFILL WARNING] </span>}
                  {rec.text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} className="rounded-custom text-xs w-full sm:w-auto">
            Close Score Panel
          </Button>
        </div>
      </div>
    </div>
  );
}
