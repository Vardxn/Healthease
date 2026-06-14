import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  FileText, 
  Video, 
  Activity, 
  Check, 
  X, 
  AlertCircle, 
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function AdminDashboard() {
  const [pendingDoctors, setPendingDoctors] = useState([
    { id: 1, name: 'Dr. Sarah Jenkins', specialty: 'General Physician', experience: '12 Years', license: 'MCI-199203', status: 'pending' },
    { id: 2, name: 'Dr. John Miller', specialty: 'Cardiologist', experience: '8 Years', license: 'MCI-884021', status: 'pending' },
    { id: 3, name: 'Dr. Lisa Wong', specialty: 'Dermatologist', experience: '15 Years', license: 'MCI-300481', status: 'pending' },
  ]);

  const [logs, setLogs] = useState([
    { id: 101, user: 'Admin System', action: 'Approved license for Dr. Robert Carter', time: '10 mins ago', type: 'system' },
    { id: 102, user: 'AI OCR Parser', action: 'Processed prescription RX-4982 for Patient John Doe', time: '45 mins ago', type: 'ocr' },
    { id: 103, user: 'Video Router', action: 'Completed consultation room #549', time: '1 hour ago', type: 'call' }
  ]);

  const kpis = [
    { label: 'Total Patients', value: '1,482', change: '+12% this month', icon: Users, color: 'text-primary bg-primary/10' },
    { label: 'Active Doctors', value: '82', change: '+3 new requests', icon: UserCheck, color: 'text-secondary bg-secondary/10' },
    { label: 'AI Prescriptions Extracted', value: '6,491', change: '98% OCR accuracy', icon: FileText, color: 'text-accent bg-accent/10' },
    { label: 'Consultations Completed', value: '3,840', change: 'Zero drop rate', icon: Video, color: 'text-success bg-success/10' }
  ];

  const handleVerify = (id, approved) => {
    setPendingDoctors(prev => prev.filter(d => d.id !== id));
    
    // Add verification audit log
    const docName = pendingDoctors.find(d => d.id === id)?.name || 'Doctor';
    const newLog = {
      id: Date.now(),
      user: 'Admin Dashboard',
      action: `${approved ? 'Approved' : 'Rejected'} credentials for ${docName}`,
      time: 'Just now',
      type: approved ? 'system' : 'warning'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Alert Ribbon for Admin context */}
      <div className="bg-gradient-to-r from-[#0F766E]/10 to-[#14B8A6]/10 border border-[#0F766E]/30 p-4 rounded-custom flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-primary flex-shrink-0" size={20} />
          <div>
            <p className="font-bold text-xs text-text-primary">System Administration Panel</p>
            <p className="text-[10px] text-text-secondary mt-0.5">Role-Based Access Control Structure verified. Showing global database indicators.</p>
          </div>
        </div>
        <Badge variant="success">Role: System Owner</Badge>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-5 flex items-center justify-between border border-border">
              <div className="space-y-1">
                <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider block">{kpi.label}</span>
                <span className="text-2xl font-black text-text-primary block">{kpi.value}</span>
                <span className="text-[10px] text-text-secondary font-medium block">{kpi.change}</span>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.color}`}>
                <Icon size={20} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Pending Doctors & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Doctor verification requests */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-border p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <h3 className="font-black text-sm text-text-primary tracking-tight">Pending Doctor Certifications</h3>
                <p className="text-[10px] text-text-secondary mt-0.5">Approve licenses to add specialists to the public marketplace.</p>
              </div>
              <Badge variant="warning">{pendingDoctors.length} Verification Requests</Badge>
            </div>

            {pendingDoctors.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-secondary">
                🎉 All verification requests have been cleared!
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {pendingDoctors.map((doc) => (
                  <div key={doc.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-text-primary">{doc.name}</span>
                        <Badge variant="secondary">{doc.specialty}</Badge>
                      </div>
                      <p className="text-[10px] text-text-secondary">Exp: {doc.experience} • License ID: <span className="font-mono text-text-primary">{doc.license}</span></p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(doc.id, true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-success text-white hover:bg-success/90 rounded-[10px] text-xs font-bold transition-all"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleVerify(doc.id, false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-danger/30 text-danger hover:bg-danger/5 rounded-[10px] text-xs font-bold transition-all"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* User and Consultation analytics charts mock */}
          <Card className="border border-border p-6 space-y-4">
            <h3 className="font-black text-sm text-text-primary tracking-tight pb-3 border-b border-border">System Load & Growth Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase">Consultation Volume (Weekly)</span>
                <div className="flex items-end gap-1.5 h-24 pt-4">
                  {[35, 45, 60, 50, 75, 90, 110].map((val, i) => (
                    <div key={i} className="flex-1 bg-primary/20 hover:bg-primary rounded-t-md transition-colors" style={{ height: `${val}%` }} title={`${val} calls`} />
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-text-secondary font-bold">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Sun</span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase">OCR Extractor Load</span>
                <div className="flex items-end gap-1.5 h-24 pt-4">
                  {[20, 30, 40, 35, 50, 72, 85].map((val, i) => (
                    <div key={i} className="flex-1 bg-secondary/20 hover:bg-secondary rounded-t-md transition-colors" style={{ height: `${val}%` }} title={`${val} documents`} />
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-text-secondary font-bold">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Recent Activity Logs */}
        <div className="lg:col-span-1">
          <Card className="border border-border p-6 space-y-4 h-full flex flex-col">
            <h3 className="font-black text-sm text-text-primary tracking-tight pb-3 border-b border-border">Audit Log & Feed</h3>
            
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    log.type === 'system' ? 'bg-success' : log.type === 'ocr' ? 'bg-accent' : 'bg-primary'
                  }`} />
                  <div className="space-y-0.5">
                    <p className="text-text-secondary leading-tight">
                      <span className="font-bold text-text-primary">{log.user}:</span> {log.action}
                    </p>
                    <span className="text-[9px] text-text-secondary/70">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border mt-auto">
              <button className="w-full text-center text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
                View Full Audit Logs <ChevronRight size={14} />
              </button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
