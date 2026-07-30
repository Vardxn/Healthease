import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  Plus, 
  Save, 
  X, 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Download, 
  Trash2, 
  Heart, 
  Activity, 
  FileText,
  UserPlus
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { patientAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female', 'Other'];

const emptyDraft = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  height: '',
  weight: '',
  allergies: [],
  chronicConditions: [],
  address: '',
  emergencyContact: {
    name: '',
    phone: '',
    relation: ''
  }
};

const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

const calculateAge = (dob) => {
  if (!dob) return 'N/A';
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return 'N/A';
  const diffMs = Date.now() - date.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

export default function PatientProfile() {
  const { isAuthenticated, loading: authLoading, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'settings'
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [editingSection, setEditingSection] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [savingVitals, setSavingVitals] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    sugarLevel: '',
    oxygenLevel: ''
  });
  const [tagInput, setTagInput] = useState({ allergies: '', chronicConditions: '' });

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    smsNotifications: false,
    mfaEnabled: false,
    currentPassword: '',
    newPassword: ''
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileResponse, vitalsResponse] = await Promise.allSettled([
        patientAPI.getProfile(),
        patientAPI.getVitals()
      ]);

      if (profileResponse.status === 'fulfilled') {
        const data = profileResponse.value.data.data;
        setProfile(data);
        setDraft({
          fullName: data?.fullName || '',
          dateOfBirth: toInputDate(data?.dateOfBirth),
          gender: data?.gender || '',
          bloodGroup: data?.bloodGroup || '',
          height: data?.height || '',
          weight: data?.weight || '',
          allergies: data?.allergies || [],
          chronicConditions: data?.chronicConditions || [],
          address: data?.address || '128 Clinical Parkway, New Delhi',
          emergencyContact: {
            name: data?.emergencyContact?.name || '',
            phone: data?.emergencyContact?.phone || '',
            relation: data?.emergencyContact?.relation || ''
          }
        });
      }

      if (vitalsResponse.status === 'fulfilled') {
        setVitals(vitalsResponse.value.data.data || []);
      }
    } catch (err) {
      setMessage('Failed to load profile parameters');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const payload = {
        fullName: draft.fullName,
        dateOfBirth: draft.dateOfBirth || undefined,
        gender: draft.gender || undefined,
        bloodGroup: draft.bloodGroup || undefined,
        height: draft.height === '' ? undefined : Number(draft.height),
        weight: draft.weight === '' ? undefined : Number(draft.weight),
        allergies: draft.allergies,
        chronicConditions: draft.chronicConditions,
        address: draft.address,
        emergencyContact: draft.emergencyContact
      };

      const response = await patientAPI.updateProfile(payload);
      setProfile(response.data.data);
      setEditingSection('');
      setMessage('Health Profile updated successfully');
      setMessageType('success');
    } catch (err) {
      setMessage('Failed to update clinical profile');
      setMessageType('error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddVitals = async (e) => {
    e.preventDefault();
    try {
      setSavingVitals(true);
      await patientAPI.addVitals({
        bloodPressure: vitalsForm.bloodPressure,
        heartRate: vitalsForm.heartRate === '' ? undefined : Number(vitalsForm.heartRate),
        temperature: vitalsForm.temperature === '' ? undefined : Number(vitalsForm.temperature),
        sugarLevel: vitalsForm.sugarLevel === '' ? undefined : Number(vitalsForm.sugarLevel),
        oxygenLevel: vitalsForm.oxygenLevel === '' ? undefined : Number(vitalsForm.oxygenLevel)
      });
      setVitalsForm({ bloodPressure: '', heartRate: '', temperature: '', sugarLevel: '', oxygenLevel: '' });
      setShowVitalsForm(false);
      await loadProfile();
      setMessage('Telemetry Vitals logged successfully');
      setMessageType('success');
    } catch (err) {
      setMessage('Failed to record vitals log');
      setMessageType('error');
    } finally {
      setSavingVitals(false);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ profile, vitals }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `healthease_clinical_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setMessage('Clinical backup generated and downloaded successfully.');
    setMessageType('success');
  };

  const age = useMemo(() => calculateAge(profile?.dateOfBirth), [profile]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Title block */}
      <div>
        <h2 className="text-xl font-black text-text-primary tracking-tight">Patient Console</h2>
        <p className="text-xs text-text-secondary mt-1">Manage clinical metrics, emergency parameters, or settings.</p>
      </div>

      {message && (
        <div className={`p-4 border rounded-custom text-xs flex items-center gap-2 animate-slideUp ${
          messageType === 'error' 
            ? 'bg-danger/10 border-danger/30 text-danger' 
            : 'bg-success/10 border-success/30 text-success'
        }`}>
          <span>⚠️</span>
          <span>{message}</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all duration-150 ${
            activeTab === 'profile' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <User size={16} /> Health Profile
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all duration-150 ${
            activeTab === 'settings' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Settings size={16} /> Account Settings
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Card: Hero Initials Header */}
          <Card className="p-6 flex flex-col sm:flex-row items-center gap-5 border border-border">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-3xl flex items-center justify-center">
              {profile?.fullName?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div className="space-y-1 text-center sm:text-left flex-1">
              <h3 className="text-lg font-black text-text-primary">{profile?.fullName || 'Anonymous Patient'}</h3>
              <p className="text-xs text-text-secondary">
                Age: {age} • Blood Group: <span className="font-bold text-text-primary">{profile?.bloodGroup || 'N/A'}</span> • Gender: {profile?.gender || 'N/A'}
              </p>
              <p className="text-[10px] text-text-secondary font-mono">{draft.address}</p>
            </div>
            <Button
              onClick={() => setEditingSection(editingSection === 'edit' ? '' : 'edit')}
              className="flex items-center gap-1.5 font-bold rounded-custom text-xs"
            >
              <Edit3 size={14} /> {editingSection === 'edit' ? 'Close Editor' : 'Edit Profile'}
            </Button>
          </Card>

          {/* Form Editor panel */}
          {editingSection === 'edit' && (
            <Card className="p-6 border border-primary/20 space-y-4 animate-slideUp">
              <h4 className="font-bold text-xs text-text-primary">Clinical Metrics Editor</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Input
                  label="Full Name"
                  value={draft.fullName}
                  onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={draft.dateOfBirth}
                  onChange={(e) => setDraft({ ...draft, dateOfBirth: e.target.value })}
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">Gender</label>
                  <select
                    value={draft.gender}
                    onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-card border border-border rounded-custom text-sm focus:outline-none focus:border-primary text-text-primary"
                  >
                    <option value="">Select</option>
                    {genders.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">Blood Group</label>
                  <select
                    value={draft.bloodGroup}
                    onChange={(e) => setDraft({ ...draft, bloodGroup: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-card border border-border rounded-custom text-sm focus:outline-none focus:border-primary text-text-primary"
                  >
                    <option value="">Select</option>
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <Input
                  label="Height (cm)"
                  type="number"
                  value={draft.height}
                  onChange={(e) => setDraft({ ...draft, height: e.target.value })}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={draft.weight}
                  onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
                />
                <div className="sm:col-span-2 md:col-span-3">
                  <Input
                    label="Residential Address"
                    value={draft.address}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Emergency Contact Name"
                  value={draft.emergencyContact.name}
                  onChange={(e) => setDraft({ ...draft, emergencyContact: { ...draft.emergencyContact, name: e.target.value } })}
                />
                <Input
                  label="Emergency Contact Phone"
                  value={draft.emergencyContact.phone}
                  onChange={(e) => setDraft({ ...draft, emergencyContact: { ...draft.emergencyContact, phone: e.target.value } })}
                />
                <Input
                  label="Relationship"
                  value={draft.emergencyContact.relation}
                  onChange={(e) => setDraft({ ...draft, emergencyContact: { ...draft.emergencyContact, relation: e.target.value } })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setEditingSection('')} className="rounded-custom text-xs">
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={savingProfile} className="rounded-custom text-xs">
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </div>
            </Card>
          )}

          {/* Cards Grid: Contact, Allergies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border border-border space-y-4">
              <h4 className="font-extrabold text-xs text-text-primary flex items-center gap-1.5">
                <Heart size={14} className="text-danger" /> Emergency Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-text-secondary block">Contact Name</span>
                  <span className="font-bold text-text-primary block mt-0.5">{profile?.emergencyContact?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-text-secondary block">Relation</span>
                  <span className="font-bold text-text-primary block mt-0.5">{profile?.emergencyContact?.relation || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-text-secondary block">Emergency Phone</span>
                  <span className="font-bold text-text-primary block mt-0.5">{profile?.emergencyContact?.phone || 'N/A'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-border space-y-4">
              <h4 className="font-extrabold text-xs text-text-primary flex items-center gap-1.5">
                <FileText size={14} className="text-primary" /> Allergies & Chronic Conditions
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-text-secondary block mb-1">Known Allergies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.allergies?.length ? profile.allergies.map(a => <Badge key={a} variant="danger">{a}</Badge>) : <span className="text-text-secondary text-[10px]">No allergies recorded.</span>}
                  </div>
                </div>
                <div>
                  <span className="text-text-secondary block mb-1">Chronic Medical Conditions</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.chronicConditions?.length ? profile.chronicConditions.map(c => <Badge key={c} variant="warning">{c}</Badge>) : <span className="text-text-secondary text-[10px]">No chronic conditions.</span>}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Vitals logs table */}
          <Card className="p-6 border border-border space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-xs text-text-primary flex items-center gap-1.5">
                  <Activity size={14} className="text-secondary" /> Historical Vitals Telemetry
                </h4>
                <p className="text-[10px] text-text-secondary mt-0.5">Showing last recorded entries</p>
              </div>
              <Button
                onClick={() => setShowVitalsForm(!showVitalsForm)}
                className="font-bold rounded-custom text-[10px] py-1.5 px-3"
              >
                {showVitalsForm ? 'Hide Form' : 'Log New Vitals'}
              </Button>
            </div>

            {showVitalsForm && (
              <form onSubmit={handleAddVitals} className="p-4 border border-border rounded-custom bg-slate-50 dark:bg-slate-900/30 grid grid-cols-2 sm:grid-cols-5 gap-3 items-end animate-slideUp">
                <Input
                  label="BP (mmHg)"
                  placeholder="120/80"
                  value={vitalsForm.bloodPressure}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })}
                />
                <Input
                  label="Heart Rate"
                  placeholder="72"
                  type="number"
                  value={vitalsForm.heartRate}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, heartRate: e.target.value })}
                />
                <Input
                  label="Temp (°C)"
                  placeholder="36.8"
                  type="number"
                  step="0.1"
                  value={vitalsForm.temperature}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })}
                />
                <Input
                  label="Sugar Level"
                  placeholder="110"
                  type="number"
                  value={vitalsForm.sugarLevel}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, sugarLevel: e.target.value })}
                />
                <Input
                  label="SpO2 (%)"
                  placeholder="98"
                  type="number"
                  value={vitalsForm.oxygenLevel}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, oxygenLevel: e.target.value })}
                />
                <div className="col-span-2 sm:col-span-5 flex justify-end">
                  <Button type="submit" disabled={savingVitals} className="rounded-custom text-xs">
                    {savingVitals ? 'Logging...' : 'Save Vitals Entry'}
                  </Button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto rounded-custom border border-border">
              <table className="min-w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-text-secondary font-bold">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3">Recorded Time</th>
                    <th className="px-4 py-3">Blood Pressure</th>
                    <th className="px-4 py-3">Heart Rate</th>
                    <th className="px-4 py-3">Temp (°C)</th>
                    <th className="px-4 py-3">Sugar Level</th>
                    <th className="px-4 py-3">Oxygen (SpO2)</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  {vitals.length ? vitals.map((v, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-2.5">{formatDateTime(v.recordedAt || v.createdAt)}</td>
                      <td className="px-4 py-2.5 font-bold text-text-primary">{v.bloodPressure || 'N/A'}</td>
                      <td className="px-4 py-2.5">{v.heartRate ? `${v.heartRate} bpm` : 'N/A'}</td>
                      <td className="px-4 py-2.5">{v.temperature ? `${v.temperature} °C` : 'N/A'}</td>
                      <td className="px-4 py-2.5">{v.sugarLevel ? `${v.sugarLevel} mg/dL` : 'N/A'}</td>
                      <td className="px-4 py-2.5 font-semibold text-text-primary">{v.oxygenLevel ? `${v.oxygenLevel}%` : 'N/A'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-text-secondary">No telemetry logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Col: Menu */}
            <div className="md:col-span-2 space-y-6">
              {/* Notification Toggles */}
              <Card className="p-6 border border-border space-y-4">
                <h4 className="font-extrabold text-xs text-text-primary flex items-center gap-1.5">
                  <Bell size={14} className="text-primary" /> Notification Settings
                </h4>
                <div className="space-y-3 text-xs text-text-secondary">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.emailNotifications}
                      onChange={(e) => setSettingsForm({ ...settingsForm, emailNotifications: e.target.checked })}
                      className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                    />
                    <div>
                      <p className="font-bold text-text-primary">Email Notifications</p>
                      <p className="text-[10px] text-text-secondary">Receive medicine reminders and doctor summaries in your inbox.</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.smsNotifications}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smsNotifications: e.target.checked })}
                      className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                    />
                    <div>
                      <p className="font-bold text-text-primary">SMS Alerts</p>
                      <p className="text-[10px] text-text-secondary">Receive urgent vitals alerts and verification notifications via SMS.</p>
                    </div>
                  </label>
                </div>
              </Card>

              {/* Password Change Card */}
              <Card className="p-6 border border-border space-y-4">
                <h4 className="font-extrabold text-xs text-text-primary flex items-center gap-1.5">
                  <Shield size={14} className="text-secondary" /> Change Password
                </h4>
                <form onSubmit={(e) => { e.preventDefault(); setMessage('Security configurations locked for demo purposes.'); setMessageType('success'); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={settingsForm.currentPassword}
                      onChange={(e) => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={settingsForm.newPassword}
                      onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="rounded-custom text-xs">
                    Update Security Password
                  </Button>
                </form>
              </Card>

              {/* Data Exporter & Account removal */}
              <Card className="p-6 border border-border space-y-4">
                <h4 className="font-extrabold text-xs text-text-primary flex items-center gap-1.5">
                  <Trash2 size={14} className="text-danger" /> Danger Zone
                </h4>
                <div className="space-y-3 text-xs">
                  <p className="text-text-secondary">Export all diagnostics records, prescription lists, and vitals parameters as a JSON backup.</p>
                  <Button variant="secondary" onClick={handleExportData} className="flex items-center gap-1.5 rounded-custom text-xs font-bold">
                    <Download size={14} /> Export Backup JSON
                  </Button>
                  
                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="text-danger font-bold">Delete Patient Account</p>
                    <p className="text-text-secondary text-[10px]">Permanently discard account access. This is an irreversible operation.</p>
                    <button
                      onClick={() => {
                        const conf = window.confirm("Are you sure you want to request account deletion? All records will be wiped.");
                        if (conf) {
                          setMessage('Wipe request sent. Accounts in demo state are protected.');
                          setMessageType('error');
                        }
                      }}
                      className="px-4 py-2 border border-danger/30 text-danger hover:bg-danger/5 rounded-custom text-xs font-bold transition-all"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Col: Two Factor */}
            <div className="md:col-span-1">
              <Card className="p-6 border border-border space-y-4">
                <h4 className="font-extrabold text-xs text-text-primary">Two-Factor Authentication</h4>
                <p className="text-text-secondary text-[10px] leading-relaxed">Secure credentials using double verification checks. Highly recommended for clinical portals.</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-text-primary">MFA Authentication</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.mfaEnabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, mfaEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-4 after:width-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
