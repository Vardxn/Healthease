import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Plus, Save, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { patientAPI } from '../services/api';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female', 'Other'];

const emptyCreateForm = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  height: '',
  weight: '',
  allergiesText: '',
  chronicConditionsText: '',
  emergencyContact: {
    name: '',
    phone: '',
    relation: ''
  }
};

const emptyDraft = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  height: '',
  weight: '',
  allergies: [],
  chronicConditions: [],
  emergencyContact: {
    name: '',
    phone: '',
    relation: ''
  }
};

const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
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
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const asNumberInput = (value) => (value === null || value === undefined ? '' : String(value));

const normalizeArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
};

const fromProfileToDraft = (profile) => ({
  fullName: profile?.fullName || '',
  dateOfBirth: toInputDate(profile?.dateOfBirth),
  gender: profile?.gender || '',
  bloodGroup: profile?.bloodGroup || '',
  height: asNumberInput(profile?.height),
  weight: asNumberInput(profile?.weight),
  allergies: normalizeArray(profile?.allergies),
  chronicConditions: normalizeArray(profile?.chronicConditions),
  emergencyContact: {
    name: profile?.emergencyContact?.name || '',
    phone: profile?.emergencyContact?.phone || '',
    relation: profile?.emergencyContact?.relation || ''
  }
});

const parseCommaSeparated = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const Pill = ({ label, onRemove, removable = false }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 text-sm">
    {label}
    {removable ? (
      <button type="button" onClick={onRemove} className="text-cyan-100 hover:text-white">
        <X size={14} />
      </button>
    ) : null}
  </span>
);

const Card = ({ title, action, children, className = '' }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-lg ${className}`}>
    <div className="flex items-center justify-between gap-4 mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const Field = ({ label, value, editing = false, type = 'text', onChange, placeholder, options = [] }) => (
  <div>
    <label className="block text-sm text-gray-400 mb-1">{label}</label>
    {editing ? (
      type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl bg-gray-900 border border-gray-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-gray-900 border border-gray-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      )
    ) : (
      <p className="text-white font-medium">{value || 'Not set'}</p>
    )}
  </div>
);

const PatientProfile = () => {
  const { isAuthenticated, loading: authLoading, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editingSection, setEditingSection] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

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
        setDraft(fromProfileToDraft(data));
        setShowCreateForm(false);
      } else {
        setProfile(null);
        setDraft(emptyDraft);
      }

      if (vitalsResponse.status === 'fulfilled') {
        setVitals(vitalsResponse.value.data.data || []);
      } else {
        setVitals([]);
      }
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Failed to load profile');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const updateDraftField = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateEmergencyField = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const updateCreateField = (field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateCreateEmergencyField = (field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const startEdit = (section) => {
    setMessage('');
    setMessageType('success');
    setEditingSection(section);
  };

  const cancelEdit = () => {
    if (profile) {
      setDraft(fromProfileToDraft(profile));
    }
    setTagInput({ allergies: '', chronicConditions: '' });
    setEditingSection('');
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      const payload = {
        fullName: draft.fullName,
        dateOfBirth: draft.dateOfBirth || undefined,
        gender: draft.gender || undefined,
        bloodGroup: draft.bloodGroup || undefined,
        height: draft.height === '' ? undefined : Number(draft.height),
        weight: draft.weight === '' ? undefined : Number(draft.weight),
        allergies: normalizeArray(draft.allergies),
        chronicConditions: normalizeArray(draft.chronicConditions),
        emergencyContact: {
          name: draft.emergencyContact.name,
          phone: draft.emergencyContact.phone,
          relation: draft.emergencyContact.relation
        }
      };

      const response = await patientAPI.updateProfile(payload);
      const updatedProfile = response.data.data;
      setProfile(updatedProfile);
      setDraft(fromProfileToDraft(updatedProfile));
      setEditingSection('');
      setMessage('Profile updated successfully');
      setMessageType('success');
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Failed to update profile');
      setMessageType('error');
    } finally {
      setSavingProfile(false);
    }
  };

  const createProfile = async (e) => {
    e.preventDefault();
    try {
      setCreatingProfile(true);
      const payload = {
        fullName: createForm.fullName,
        dateOfBirth: createForm.dateOfBirth || undefined,
        gender: createForm.gender || undefined,
        bloodGroup: createForm.bloodGroup || undefined,
        height: createForm.height === '' ? undefined : Number(createForm.height),
        weight: createForm.weight === '' ? undefined : Number(createForm.weight),
        allergies: parseCommaSeparated(createForm.allergiesText),
        chronicConditions: parseCommaSeparated(createForm.chronicConditionsText),
        emergencyContact: createForm.emergencyContact
      };

      const response = await patientAPI.createProfile(payload);
      const createdProfile = response.data.data;
      setProfile(createdProfile);
      setDraft(fromProfileToDraft(createdProfile));
      setShowCreateForm(false);
      setEditingSection('');
      setMessage('Profile created successfully');
      setMessageType('success');
      await loadProfile();
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Failed to create profile');
      setMessageType('error');
    } finally {
      setCreatingProfile(false);
    }
  };

  const addTag = (field) => {
    const value = tagInput[field].trim();
    if (!value) return;
    setDraft((prev) => ({
      ...prev,
      [field]: Array.from(new Set([...(prev[field] || []), value]))
    }));
    setTagInput((prev) => ({ ...prev, [field]: '' }));
  };

  const removeTag = (field, tag) => {
    setDraft((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((item) => item !== tag)
    }));
  };

  const saveVitals = async (e) => {
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
      setVitalsForm({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        sugarLevel: '',
        oxygenLevel: ''
      });
      setShowVitalsForm(false);
      await loadProfile();
      setMessage('Vitals added successfully');
      setMessageType('success');
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Failed to add vitals');
      setMessageType('error');
    } finally {
      setSavingVitals(false);
    }
  };

  const age = useMemo(() => calculateAge(profile?.dateOfBirth), [profile]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white">
        <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile && !showCreateForm) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-xl w-full bg-gray-800 border border-gray-700 rounded-3xl p-8 text-center shadow-2xl">
          <div className="mx-auto w-20 h-20 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-3xl text-cyan-300 mb-5">
            {user?.name?.charAt(0)?.toUpperCase() || 'H'}
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Complete your health profile</h1>
          <p className="text-gray-400 mb-6">
            Add your personal details, emergency contact, and health history to unlock a more personalized experience.
          </p>
          <button
            type="button"
            onClick={() => {
              setCreateForm((prev) => ({
                ...prev,
                fullName: user?.name || ''
              }));
              setShowCreateForm(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  if (!profile && showCreateForm) {
    return (
      <div className="max-w-5xl mx-auto text-white">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">My Health Profile</h1>
          <p className="text-gray-400 mt-2">Create your patient profile to personalize care and interactions.</p>
        </div>

        <form onSubmit={createProfile} className="bg-gray-800 border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          {message && (
            <div className={`px-4 py-3 rounded-xl border ${messageType === 'error' ? 'bg-red-900/30 border-red-700 text-red-200' : 'bg-emerald-900/30 border-emerald-700 text-emerald-200'}`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Full Name" value={createForm.fullName} editing onChange={(value) => updateCreateField('fullName', value)} placeholder="Your full name" />
            <Field label="Date of Birth" value={createForm.dateOfBirth} editing type="date" onChange={(value) => updateCreateField('dateOfBirth', value)} />
            <Field label="Gender" value={createForm.gender} editing type="select" options={genders} onChange={(value) => updateCreateField('gender', value)} />
            <Field label="Blood Group" value={createForm.bloodGroup} editing type="select" options={bloodGroups} onChange={(value) => updateCreateField('bloodGroup', value)} />
            <Field label="Height (cm)" value={createForm.height} editing type="number" onChange={(value) => updateCreateField('height', value)} placeholder="170" />
            <Field label="Weight (kg)" value={createForm.weight} editing type="number" onChange={(value) => updateCreateField('weight', value)} placeholder="65" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Allergies (comma separated)</label>
              <input
                type="text"
                value={createForm.allergiesText}
                onChange={(e) => updateCreateField('allergiesText', e.target.value)}
                className="w-full rounded-xl bg-gray-900 border border-gray-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Penicillin, Peanuts"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Chronic Conditions (comma separated)</label>
              <input
                type="text"
                value={createForm.chronicConditionsText}
                onChange={(e) => updateCreateField('chronicConditionsText', e.target.value)}
                className="w-full rounded-xl bg-gray-900 border border-gray-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Diabetes, Hypertension"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field label="Emergency Contact Name" value={createForm.emergencyContact.name} editing onChange={(value) => updateCreateEmergencyField('name', value)} />
            <Field label="Emergency Contact Phone" value={createForm.emergencyContact.phone} editing onChange={(value) => updateCreateEmergencyField('phone', value)} />
            <Field label="Relation" value={createForm.emergencyContact.relation} editing onChange={(value) => updateCreateEmergencyField('relation', value)} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-5 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingProfile}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 text-gray-950 font-semibold transition-colors"
            >
              {creatingProfile ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto text-white space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold">My Health Profile</h1>
        <p className="text-gray-400">Manage your personal details, vitals, allergies, and emergency contact in one place.</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl border ${messageType === 'error' ? 'bg-red-900/30 border-red-700 text-red-200' : 'bg-emerald-900/30 border-emerald-700 text-emerald-200'}`}>
          {message}
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-cyan-500 text-gray-950 font-bold text-3xl flex items-center justify-center">
            {profile?.fullName?.charAt(0)?.toUpperCase() || 'H'}
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{profile?.fullName || 'Not specified'}</h2>
                <p className="text-gray-400 mt-1">Age {age} · {profile?.bloodGroup || 'Blood group not set'} · {profile?.gender || 'Gender not set'}</p>
              </div>
              <button
                type="button"
                onClick={() => startEdit('personal')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-600 text-gray-200 hover:bg-gray-700 transition-colors"
              >
                <Edit3 size={16} />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Personal Info"
          action={editingSection === 'personal' ? null : (
            <button type="button" onClick={() => startEdit('personal')} className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 text-sm">
              <Edit3 size={16} /> Edit
            </button>
          )}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" value={draft.fullName} editing={editingSection === 'personal'} onChange={(value) => updateDraftField('fullName', value)} />
            <Field label="Date of Birth" value={formatDate(draft.dateOfBirth)} editing={editingSection === 'personal'} type="date" onChange={(value) => updateDraftField('dateOfBirth', value)} />
            <Field label="Gender" value={draft.gender} editing={editingSection === 'personal'} type="select" options={genders} onChange={(value) => updateDraftField('gender', value)} />
            <Field label="Blood Group" value={draft.bloodGroup} editing={editingSection === 'personal'} type="select" options={bloodGroups} onChange={(value) => updateDraftField('bloodGroup', value)} />
            <Field label="Height (cm)" value={draft.height} editing={editingSection === 'personal'} type="number" onChange={(value) => updateDraftField('height', value)} />
            <Field label="Weight (kg)" value={draft.weight} editing={editingSection === 'personal'} type="number" onChange={(value) => updateDraftField('weight', value)} />
          </div>
          {editingSection === 'personal' && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
              <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
              <button type="button" onClick={saveProfile} disabled={savingProfile} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 text-gray-950 font-semibold transition-colors">
                <Save size={16} /> {savingProfile ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </Card>

        <Card
          title="Emergency Contact"
          action={editingSection === 'emergency' ? null : (
            <button type="button" onClick={() => startEdit('emergency')} className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 text-sm">
              <Edit3 size={16} /> Edit
            </button>
          )}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name" value={draft.emergencyContact.name} editing={editingSection === 'emergency'} onChange={(value) => updateEmergencyField('name', value)} />
            <Field label="Phone" value={draft.emergencyContact.phone} editing={editingSection === 'emergency'} onChange={(value) => updateEmergencyField('phone', value)} />
            <Field label="Relation" value={draft.emergencyContact.relation} editing={editingSection === 'emergency'} onChange={(value) => updateEmergencyField('relation', value)} />
          </div>
          {editingSection === 'emergency' && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
              <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
              <button type="button" onClick={saveProfile} disabled={savingProfile} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 text-gray-950 font-semibold transition-colors">
                <Save size={16} /> {savingProfile ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </Card>

        <Card
          title="Allergies"
          action={editingSection === 'allergies' ? null : (
            <button type="button" onClick={() => startEdit('allergies')} className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 text-sm">
              <Edit3 size={16} /> Edit
            </button>
          )}
        >
          <div className="flex flex-wrap gap-2 mb-4 min-h-11">
            {draft.allergies.length ? draft.allergies.map((item) => (
              <Pill key={item} label={item} removable={editingSection === 'allergies'} onRemove={() => removeTag('allergies', item)} />
            )) : <p className="text-gray-400">No allergies added yet.</p>}
          </div>
          {editingSection === 'allergies' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput.allergies}
                  onChange={(e) => setTagInput((prev) => ({ ...prev, allergies: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('allergies');
                    }
                  }}
                  className="flex-1 rounded-xl bg-gray-900 border border-gray-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Add allergy"
                />
                <button type="button" onClick={() => addTag('allergies')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold">
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="button" onClick={saveProfile} disabled={savingProfile} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 text-gray-950 font-semibold transition-colors">
                  <Save size={16} /> {savingProfile ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </Card>

        <Card
          title="Chronic Conditions"
          action={editingSection === 'conditions' ? null : (
            <button type="button" onClick={() => startEdit('conditions')} className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 text-sm">
              <Edit3 size={16} /> Edit
            </button>
          )}
        >
          <div className="flex flex-wrap gap-2 mb-4 min-h-11">
            {draft.chronicConditions.length ? draft.chronicConditions.map((item) => (
              <Pill key={item} label={item} removable={editingSection === 'conditions'} onRemove={() => removeTag('chronicConditions', item)} />
            )) : <p className="text-gray-400">No chronic conditions added yet.</p>}
          </div>
          {editingSection === 'conditions' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput.chronicConditions}
                  onChange={(e) => setTagInput((prev) => ({ ...prev, chronicConditions: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('chronicConditions');
                    }
                  }}
                  className="flex-1 rounded-xl bg-gray-900 border border-gray-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Add chronic condition"
                />
                <button type="button" onClick={() => addTag('chronicConditions')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold">
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="button" onClick={saveProfile} disabled={savingProfile} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 text-gray-950 font-semibold transition-colors">
                  <Save size={16} /> {savingProfile ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold">Vitals</h3>
            <p className="text-gray-400 text-sm mt-1">Last 10 recorded entries</p>
          </div>
          <button
            type="button"
            onClick={() => setShowVitalsForm((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold transition-colors"
          >
            <Plus size={16} /> {showVitalsForm ? 'Hide Form' : 'Add Vitals'}
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">BP</th>
                <th className="text-left px-4 py-3">Heart Rate</th>
                <th className="text-left px-4 py-3">Temperature</th>
                <th className="text-left px-4 py-3">Sugar</th>
                <th className="text-left px-4 py-3">O2</th>
              </tr>
            </thead>
            <tbody>
              {vitals.length ? vitals.map((entry) => (
                <tr key={`${entry.recordedAt}-${entry.bloodPressure}`} className="border-t border-gray-700">
                  <td className="px-4 py-3 text-gray-200">{formatDateTime(entry.recordedAt)}</td>
                  <td className="px-4 py-3 text-gray-200">{entry.bloodPressure || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-200">{entry.heartRate ?? 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-200">{entry.temperature ?? 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-200">{entry.sugarLevel ?? 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-200">{entry.oxygenLevel ?? 'N/A'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-400">No vitals recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showVitalsForm && (
          <form onSubmit={saveVitals} className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">BP</label>
              <input value={vitalsForm.bloodPressure} onChange={(e) => setVitalsForm((prev) => ({ ...prev, bloodPressure: e.target.value }))} className="w-full rounded-xl bg-gray-900 border border-gray-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="120/80" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Heart Rate</label>
              <input type="number" value={vitalsForm.heartRate} onChange={(e) => setVitalsForm((prev) => ({ ...prev, heartRate: e.target.value }))} className="w-full rounded-xl bg-gray-900 border border-gray-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="72" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Temp (°C)</label>
              <input type="number" step="0.1" value={vitalsForm.temperature} onChange={(e) => setVitalsForm((prev) => ({ ...prev, temperature: e.target.value }))} className="w-full rounded-xl bg-gray-900 border border-gray-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="36.8" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sugar</label>
              <input type="number" value={vitalsForm.sugarLevel} onChange={(e) => setVitalsForm((prev) => ({ ...prev, sugarLevel: e.target.value }))} className="w-full rounded-xl bg-gray-900 border border-gray-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="110" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">O2</label>
              <input type="number" value={vitalsForm.oxygenLevel} onChange={(e) => setVitalsForm((prev) => ({ ...prev, oxygenLevel: e.target.value }))} className="w-full rounded-xl bg-gray-900 border border-gray-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="98" />
            </div>
            <div className="md:col-span-5 flex justify-end">
              <button
                type="submit"
                disabled={savingVitals}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 text-gray-950 font-semibold transition-colors"
              >
                <Save size={16} /> {savingVitals ? 'Saving...' : 'Save Vitals'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
