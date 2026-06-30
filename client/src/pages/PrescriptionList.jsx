import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileDown,
  Search,
  Filter,
  Plus,
  Bell,
  Check,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  User,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import { prescriptionAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ReminderModal from '../components/ReminderModal';
import { exportPrescriptionPDF } from '../utils/pdfExport';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import SectionHeading from '../components/ui/SectionHeading';

const formatDoctorName = (doctorName) => {
  const cleanName = (doctorName || '').trim().replace(/^(dr\.?\s*)+/i, '').trim();

  if (!cleanName) {
    return 'Unknown Doctor';
  }

  return `Dr. ${cleanName}`;
};

const PrescriptionList = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, verified, unverified
  const [showFilters, setShowFilters] = useState(false);
  const [expandedIds, setExpandedIds] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchPrescriptions();
  }, [isAuthenticated, navigate]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionAPI.getAll();
      setPrescriptions(response.data.data || []);
    } catch (err) {
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription record?')) {
      return;
    }

    try {
      await prescriptionAPI.delete(id);
      setPrescriptions(prescriptions.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete prescription');
    }
  };

  const handleVerify = async (id) => {
    try {
      await prescriptionAPI.update(id, { isVerified: true });
      setPrescriptions(prescriptions.map((p) =>
        p._id === id ? { ...p, isVerified: true } : p
      ));
    } catch (err) {
      alert('Failed to verify prescription');
    }
  };

  const handleOpenReminderModal = (prescription) => {
    setSelectedPrescription(prescription);
    setReminderModalOpen(true);
  };

  const handleCloseReminderModal = () => {
    setReminderModalOpen(false);
    setSelectedPrescription(null);
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Memoized filtered & searched prescriptions list
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      const docName = (p.doctorName || '').toLowerCase();
      const medNames = (p.medications || []).map((m) => (m.name || '').toLowerCase()).join(' ');
      const matchesSearch = docName.includes(searchQuery.toLowerCase()) || medNames.includes(searchQuery.toLowerCase());

      if (statusFilter === 'verified') {
        return matchesSearch && p.isVerified;
      }
      if (statusFilter === 'unverified') {
        return matchesSearch && !p.isVerified;
      }
      return matchesSearch;
    });
  }, [prescriptions, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-text-secondary font-semibold text-sm">Loading your digital records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header and top widgets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Prescription Records</h2>
          <p className="text-text-secondary text-sm">Manage, filter, and review all AI-digitized medical sheets.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-1.5 font-bold rounded-custom"
          >
            <Plus size={16} /> Upload Prescription
          </Button>

          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 rounded-custom"
          >
            <Filter size={16} /> Filters
          </Button>
        </div>
      </div>

      {/* Expanded search/filters */}
      {(showFilters || searchQuery) && (
        <Card className="p-4 bg-surface-secondary border border-border rounded-custom flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by doctor or medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white rounded-[14px] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
            <span className="text-xs font-bold text-text-secondary">Verification:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 bg-white rounded-[14px] text-xs text-slate-900 focus:outline-none focus:border-primary"
            >
              <option value="all">All Records</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
        </Card>
      )}

      {error && (
        <div className="bg-red-50 border border-danger/30 text-danger p-4 rounded-custom font-semibold text-sm">
          {error}
        </div>
      )}

      {filteredPrescriptions.length === 0 ? (
        <Card className="p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-3xl">
            📄
          </div>
          <h3 className="text-xl font-bold text-text-primary">No Prescriptions Found</h3>
          <p className="text-text-secondary text-sm">
            {searchQuery || statusFilter !== 'all'
              ? 'No records match your search query or filters. Try adjusting them.'
              : 'You have not uploaded any prescriptions yet.'}
          </p>
          <Button onClick={() => navigate('/upload')} className="mx-auto rounded-custom">
            Upload Prescription
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredPrescriptions.map((p) => {
            const id = p._id;
            const isExpanded = !!expandedIds[id];
            const doctorDisplayName = formatDoctorName(p.doctorName);
            const date = new Date(p.date || p.uploadDate || p.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <Card
                key={id}
                className="hover:translate-y-[-2px] transition-custom border border-border p-6"
              >
                {/* 1. Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-text-primary">
                        {doctorDisplayName}
                      </h3>
                      {p.isVerified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Pending Verification</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <Calendar size={12} />
                      <span>Digitized: {date}</span>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => exportPrescriptionPDF(p)}
                      className="px-3 py-1.5 text-xs font-bold flex items-center gap-1 border-accent text-accent hover:bg-accent/5 rounded-custom"
                    >
                      <FileDown size={14} /> Export PDF
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => handleOpenReminderModal(p)}
                      className="px-3 py-1.5 text-xs font-bold flex items-center gap-1 border-primary text-primary hover:bg-primary/5 rounded-custom"
                    >
                      <Bell size={14} /> Set Reminders
                    </Button>

                    {!p.isVerified && (
                      <button
                        onClick={() => handleVerify(id)}
                        className="p-2 text-xs font-bold text-green-600 hover:bg-green-50 rounded-custom transition-colors flex items-center gap-1"
                        title="Mark as verified"
                      >
                        <Check size={14} /> Verify
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(id)}
                      className="p-2 text-xs font-bold text-danger hover:bg-red-50 rounded-custom transition-colors flex items-center gap-1"
                      title="Delete prescription"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {/* 2. Mini Summary Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-slate-200 p-4 rounded-custom mb-4 text-xs shadow-sm">
                  <div>
                    <span className="text-slate-500 font-bold">Total Drugs:</span>
                    <p className="font-extrabold text-slate-950 text-sm mt-0.5">{p.medications?.length || 0}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Duration:</span>
                    <p className="font-extrabold text-slate-950 text-sm mt-0.5">{p.medications?.[0]?.duration || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Doctor Signature:</span>
                    <p className="font-extrabold text-slate-950 text-sm mt-0.5 truncate">{doctorDisplayName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Diagnosis Note:</span>
                    <p className="font-extrabold text-slate-950 text-sm mt-0.5 truncate">{p.notes || 'None'}</p>
                  </div>
                </div>

                {/* 3. Medicines List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-text-secondary uppercase">Medications</p>
                    <button
                      onClick={() => toggleExpand(id)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                    >
                      {isExpanded ? (
                        <>Collapse <ChevronUp size={12} /></>
                      ) : (
                        <>Expand Details <ChevronDown size={12} /></>
                      )}
                    </button>
                  </div>

                  {/* Chips for medicines summary */}
                  <div className="flex flex-wrap gap-2">
                    {p.medications?.length > 0 ? (
                      p.medications.map((med, idx) => (
                        <span key={idx} className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/30">
                          {med.name} ({med.dosage})
                        </span>
                      ))
                    ) : (
                      <span className="text-text-secondary text-xs">No medicines logged.</span>
                    )}
                  </div>

                  {/* Collapsible detailed view */}
                  {isExpanded && p.medications?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-border animate-slideUp">
                      {p.medications.map((med, idx) => (
                        <div key={idx} className="bg-surface-secondary p-3.5 border border-border rounded-custom space-y-1">
                          <p className="font-bold text-text-primary text-sm">{med.name}</p>
                          <div className="text-xs text-text-secondary space-y-0.5">
                            <p><span className="font-semibold text-text-primary">Dosage:</span> {med.dosage || 'N/A'}</p>
                            <p><span className="font-semibold text-text-primary">Frequency:</span> {med.frequency || 'N/A'}</p>
                            <p><span className="font-semibold text-text-primary">Duration:</span> {med.duration || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedPrescription && (
        <ReminderModal
          isOpen={reminderModalOpen}
          onClose={handleCloseReminderModal}
          prescriptionId={selectedPrescription._id}
          medications={selectedPrescription.medications}
          onSaveSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default PrescriptionList;
