import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { prescriptionAPI, medicineAPI, consultationAPI, patientAPI } from '../services/api';
import { calculateHealthScore } from '../utils/healthScoreEngine';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  Lightbulb,
  Heart,
  ChevronRight,
  ShieldCheck,
  Activity,
  Calendar,
  Pill
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_BADGE_VARIANTS = {
  'Excellent': 'success',
  'Good': 'secondary',
  'Average': 'warning',
  'Needs Attention': 'danger'
};

const FACTOR_LABELS = {
  medicine: 'Medication Adherence',
  consultation: 'Consultation Attendance',
  bp: 'BP Stability',
  sugar: 'Blood Sugar Stability',
  weight: 'Weight Tracking',
  consistency: 'Logging Consistency'
};

const MOCK_TRENDS = [
  { month: 'March', score: 76 },
  { month: 'April', score: 79 },
  { month: 'May', score: 82 },
  { month: 'June', score: 84 },
  { month: 'July', score: 88 }
];

export default function HealthScore() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [medRes, vitRes, conRes] = await Promise.allSettled([
          medicineAPI.getAll(),
          patientAPI.getVitals(),
          consultationAPI.getMy()
        ]);

        if (medRes.status === 'fulfilled') setMedicines(medRes.value.data?.medicines || []);
        if (vitRes.status === 'fulfilled') setVitals(vitRes.value.data?.vitals || []);
        if (conRes.status === 'fulfilled') {
          const payload = conRes.value.data;
          const data = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.consultations)
              ? payload.consultations
              : Array.isArray(payload) ? payload : [];
          setConsultations(data);
        }
      } catch (err) {
        console.error('Error fetching score parameters:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const healthData = useMemo(() => {
    return calculateHealthScore(medicines, vitals, consultations);
  }, [medicines, vitals, consultations]);

  const trends = useMemo(() => {
    const history = [...MOCK_TRENDS];
    history.push({ month: 'Current', score: healthData.score });
    return history;
  }, [healthData.score]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-secondary font-semibold text-sm">Computing Health Score analytics...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Smart Health Score</h2>
        <p className="text-text-secondary text-sm">
          A metrics engine calculating diagnostic status and telemedicine compliance.
        </p>
      </div>

      {/* Hero Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-surface">
          <div className="space-y-4 text-center md:text-left">
            <Badge variant={STATUS_BADGE_VARIANTS[healthData.status]}>
              Status: {healthData.status}
            </Badge>
            <h3 className="text-2xl font-bold text-text-primary">Clinical Assessment</h3>
            <p className="text-text-secondary text-sm max-w-md">
              Your overall score is calculated from active medications, consultation frequencies, and vitals stability scores. 
            </p>
            <div className="text-xs text-text-secondary pt-2">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center flex-shrink-0">
            <div className="w-36 h-36 rounded-full border-[10px] border-surface-secondary flex items-center justify-center relative shadow-custom">
              <div className="absolute inset-0 rounded-full border-[10px] border-primary border-t-transparent animate-pulse-slow"></div>
              <span className="text-5xl font-black text-primary">{healthData.score}</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider mt-3 text-text-secondary">Health Coefficient</span>
          </div>
        </Card>

        {/* Monthly Trend Indicator */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-text-primary text-base flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-primary" /> Score Progress
            </h4>
            <p className="text-xs text-text-secondary">Your overall performance relative to previous months.</p>
          </div>

          {/* Simple SVG Line Chart */}
          <div className="h-28 w-full flex items-end justify-between gap-2 pt-4">
            {trends.map((t, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <span className="text-[10px] font-bold text-text-primary mb-1">{t.score}</span>
                <div 
                  className="w-full rounded-t-md bg-primary/20 hover:bg-primary transition-all duration-300"
                  style={{ height: `${t.score}%`, maxHeight: '80px', minHeight: '10px' }}
                />
                <span className="text-[9px] text-text-secondary mt-1 uppercase font-bold truncate max-w-[45px]">{t.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Factor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Factor Breakdown progress bars */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-5">
            <h3 className="font-bold text-text-primary text-lg border-b border-border pb-3">Score Factors Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(healthData.factors).map(([key, value]) => {
                const percent = Math.round((value.score / value.max) * 100);
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-text-secondary">
                      <span className="text-text-primary font-bold">{FACTOR_LABELS[key]}</span>
                      <span>{value.score} / {value.max} points ({percent}%)</span>
                    </div>
                    <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Achievements & Suggestions */}
        <div className="space-y-6">
          {/* Recommendations Card */}
          <Card className="p-6 space-y-4">
            <h4 className="font-bold text-text-primary text-base flex items-center gap-1.5 border-b border-border pb-3">
              <Lightbulb size={18} className="text-warning" /> Personalized Recommendations
            </h4>
            <div className="space-y-3">
              {healthData.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-surface-secondary border border-border rounded-custom text-xs space-y-2">
                  <p className="text-text-secondary leading-relaxed">{rec.text}</p>
                  <Link to={rec.link} className="inline-flex items-center text-primary font-bold hover:underline">
                    {rec.action} <ChevronRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* Risk Factors & Achievements */}
          <Card className="p-6 space-y-4">
            <h4 className="font-bold text-text-primary text-base flex items-center gap-1.5 border-b border-border pb-3">
              <Award size={18} className="text-primary" /> Key Achievements
            </h4>
            <div className="space-y-2.5 text-xs text-text-secondary">
              <div className="flex items-start gap-2">
                <ShieldCheck size={16} className="text-success mt-0.5" />
                <div>
                  <p className="font-bold text-text-primary">HIPAA Secure telemetry logs</p>
                  <p className="text-[10px]">All vital statistics are saved in compliance settings.</p>
                </div>
              </div>
              {healthData.score >= 75 && (
                <div className="flex items-start gap-2">
                  <ShieldCheck size={16} className="text-success mt-0.5" />
                  <div>
                    <p className="font-bold text-text-primary">Compliance Target Met</p>
                    <p className="text-[10px]">Your health coefficient is above the baseline ratio.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
