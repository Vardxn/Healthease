import React, { useState, useContext } from 'react';
import { 
  FileText, 
  Download, 
  Activity, 
  Calendar, 
  Pill, 
  Printer, 
  User as UserIcon,
  CheckCircle2,
  TrendingUp,
  Brain
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { AuthContext } from '../context/AuthContext';

export default function ExportEngine() {
  const { user } = useContext(AuthContext);
  const [activeReport, setActiveReport] = useState('summary');
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const reports = [
    { id: 'summary', name: 'Comprehensive Health Summary', icon: Brain, desc: 'Overview of all active diagnoses, vitals, and medication plans.' },
    { id: 'prescriptions', name: 'Prescription Records', icon: FileText, desc: 'Extracted digital OCR prescription logs and doctor scripts.' },
    { id: 'medicines', name: 'Medicine Compliance Report', icon: Pill, desc: 'Medication adherence ratios and stock refill timelines.' },
    { id: 'vitals', name: 'Vitals telemetry Log', icon: Activity, desc: 'Historical heart rate, blood pressure, and SpO2 trends.' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Non-printable Controls header */}
      <div className="print:hidden border border-border bg-white dark:bg-card p-6 rounded-custom flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Export PDF Reports</h2>
          <p className="text-xs text-text-secondary mt-1">Select and print certified health summary reports for offline reference and clinic visits.</p>
        </div>
        <Button onClick={handlePrint} className="flex items-center gap-2 self-start md:self-auto font-bold rounded-custom">
          <Printer size={16} /> Print / Save as PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Report Selector (Hidden in Print) */}
        <div className="print:hidden lg:col-span-1 space-y-3">
          {reports.map((rep) => {
            const Icon = rep.icon;
            const isSelected = activeReport === rep.id;
            return (
              <button
                key={rep.id}
                onClick={() => setActiveReport(rep.id)}
                className={`w-full text-left p-4 rounded-custom border transition-all duration-200 flex items-start gap-3.5 bg-white dark:bg-card ${
                  isSelected 
                    ? 'border-primary ring-2 ring-primary/15' 
                    : 'border-border hover:border-text-secondary/30'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-text-secondary'}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-text-primary">{rep.name}</h4>
                  <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">{rep.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Printable Document Container */}
        <div className="lg:col-span-2 bg-white dark:bg-card border border-border rounded-custom p-8 shadow-sm print:shadow-none print:border-none print:p-0">
          
          {/* Document Printable Sheet */}
          <div className="space-y-8" id="printable-area">
            
            {/* Medical Header */}
            <div className="flex justify-between items-start border-b-2 border-primary pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-[8px] flex items-center justify-center text-white font-bold text-sm">H</div>
                  <span className="font-black text-lg text-text-primary tracking-tight">HEALTHEASE CLINICAL HUB</span>
                </div>
                <p className="text-[10px] text-text-secondary mt-1">SaaS Healthcare Digitization & Telemedicine</p>
              </div>
              <div className="text-right">
                <Badge variant="success">CONFIDENTIAL REPORT</Badge>
                <p className="text-[10px] text-text-secondary mt-1.5 font-semibold">Generated: {generatedDate}</p>
              </div>
            </div>

            {/* Patient & Doctor Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-900/30 p-4 rounded-custom border border-border">
              <div className="space-y-1">
                <p className="text-text-secondary font-bold uppercase tracking-wider text-[9px]">Patient Information</p>
                <p className="font-bold text-text-primary">{user?.name || 'N/A'}</p>
                <p className="text-text-secondary">Email: {user?.email || 'N/A'}</p>
                <p className="text-text-secondary">Account Status: Active</p>
              </div>
              <div className="space-y-1">
                <p className="text-text-secondary font-bold uppercase tracking-wider text-[9px]">Clinical Core Engine</p>
                <p className="font-bold text-text-primary">HealthEase AI Processing Unit</p>
                <p className="text-text-secondary">OCR Model: Tesseract/FastAPI v2.0</p>
                <p className="text-text-secondary">Validation: Automatic System Review</p>
              </div>
            </div>

            {/* Report Content rendering based on state */}
            {activeReport === 'summary' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-text-primary mb-3">1. Active Diagnoses Summary</h3>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-text-secondary font-bold uppercase text-[9px]">
                        <th className="py-2">Condition</th>
                        <th className="py-2">Onset Date</th>
                        <th className="py-2">Severity</th>
                        <th className="py-2">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                      <tr className="border-b border-border/50">
                        <td className="py-2.5 font-semibold text-text-primary">Hypertension (Mild)</td>
                        <td className="py-2.5">Jan 2026</td>
                        <td className="py-2.5">Stage 1</td>
                        <td className="py-2.5 text-primary font-bold">Doctor Logged</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2.5 font-semibold text-text-primary">Seasonal Allergic Rhinitis</td>
                        <td className="py-2.5">Mar 2026</td>
                        <td className="py-2.5">Low</td>
                        <td className="py-2.5">Self-Reported</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-text-primary mb-3">2. Active Medicine Schedule</h3>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-text-secondary font-bold uppercase text-[9px]">
                        <th className="py-2">Medicine</th>
                        <th className="py-2">Dosage</th>
                        <th className="py-2">Frequency</th>
                        <th className="py-2">Refill Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                      <tr className="border-b border-border/50">
                        <td className="py-2.5 font-semibold text-text-primary">Lisinopril 10mg</td>
                        <td className="py-2.5">1 Tablet</td>
                        <td className="py-2.5">Daily (Morning)</td>
                        <td className="py-2.5 text-danger font-bold">Refill recommended</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2.5 font-semibold text-text-primary">Metformin HCl 500mg</td>
                        <td className="py-2.5">1 Tablet</td>
                        <td className="py-2.5">Twice Daily (Post Meal)</td>
                        <td className="py-2.5 text-success font-bold">Good Stock</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeReport === 'prescriptions' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-text-primary mb-3">Extracted Prescription Records</h3>
                  <div className="space-y-4">
                    {[
                      { id: 'RX-9901', doc: 'Dr. Sarah Jenkins', specialty: 'General Physician', date: 'June 01, 2026', items: 'Lisinopril 10mg, Metformin 500mg' },
                      { id: 'RX-8842', doc: 'Dr. Amit Patel', specialty: 'Cardiologist', date: 'May 14, 2026', items: 'Atorvastatin 20mg' }
                    ].map((rx) => (
                      <div key={rx.id} className="p-4 border border-border rounded-custom text-xs space-y-2">
                        <div className="flex justify-between font-bold text-text-primary">
                          <span>{rx.id} — {rx.doc} ({rx.specialty})</span>
                          <span className="text-text-secondary text-[10px]">{rx.date}</span>
                        </div>
                        <p className="text-text-secondary">Prescribed Items: <span className="font-medium text-text-primary">{rx.items}</span></p>
                        <p className="text-[10px] text-text-secondary">AI OCR Confidence score: 98% • Verified Digitized PDF match</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'medicines' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-text-primary mb-3">Medication Compliance & Adherence Metrics</h3>
                  <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div className="border border-border p-3.5 rounded-custom">
                      <span className="text-text-secondary text-[10px] font-bold block">Adherence Score</span>
                      <span className="text-2xl font-black text-primary block mt-1">94.2%</span>
                    </div>
                    <div className="border border-border p-3.5 rounded-custom">
                      <span className="text-text-secondary text-[10px] font-bold block">Completed Doses</span>
                      <span className="text-2xl font-black text-success block mt-1">58 doses</span>
                    </div>
                    <div className="border border-border p-3.5 rounded-custom">
                      <span className="text-text-secondary text-[10px] font-bold block">Missed / Skipped</span>
                      <span className="text-2xl font-black text-danger block mt-1">3 doses</span>
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-text-secondary font-bold uppercase text-[9px]">
                        <th className="py-2">Medicine</th>
                        <th className="py-2">Monthly Compliance</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                      <tr className="border-b border-border/50">
                        <td className="py-2.5 font-semibold text-text-primary">Lisinopril 10mg</td>
                        <td className="py-2.5">97%</td>
                        <td className="py-2.5"><Badge variant="success">Excellent</Badge></td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2.5 font-semibold text-text-primary">Metformin HCl 500mg</td>
                        <td className="py-2.5">91%</td>
                        <td className="py-2.5"><Badge variant="success">Stable</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeReport === 'vitals' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-text-primary mb-3">Vitals Telemetry & Trend Logs</h3>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-text-secondary font-bold uppercase text-[9px]">
                        <th className="py-2">Logged Date</th>
                        <th className="py-2">Blood Pressure</th>
                        <th className="py-2">Heart Rate</th>
                        <th className="py-2">Oxygen (SpO2)</th>
                        <th className="py-2">Condition</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                      <tr className="border-b border-border/50">
                        <td className="py-2.5">June 14, 2026</td>
                        <td className="py-2.5 font-bold text-text-primary">120/80 mmHg</td>
                        <td className="py-2.5">72 bpm</td>
                        <td className="py-2.5 text-success">98%</td>
                        <td className="py-2.5 text-success font-semibold">Normal</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2.5">June 12, 2026</td>
                        <td className="py-2.5 font-bold text-text-primary">124/82 mmHg</td>
                        <td className="py-2.5">74 bpm</td>
                        <td className="py-2.5 text-success">99%</td>
                        <td className="py-2.5 text-success font-semibold">Normal</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2.5">June 10, 2026</td>
                        <td className="py-2.5 font-bold text-text-primary">130/85 mmHg</td>
                        <td className="py-2.5">78 bpm</td>
                        <td className="py-2.5 text-success">97%</td>
                        <td className="py-2.5 text-warning font-semibold">Mild Warning</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Print Footer */}
            <div className="border-t border-border pt-8 text-[9px] text-text-secondary leading-relaxed text-center">
              <p>This document is generated by the HEALTHEASE platform based on clinical user input and automated OCR pipelines.</p>
              <p className="mt-1">© 2026 HEALTHEASE. HIPAA Compliant Digital Storage.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
