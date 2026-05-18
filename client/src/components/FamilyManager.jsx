import React, { useMemo, useState } from 'react';
import { Plus, UserPlus, Users } from 'lucide-react';
import * as api from '../services/api';

const initialForm = {
  fullName: '',
  relationship: '',
  age: '',
  gender: '',
  bloodGroup: '',
  knownConditions: ''
};

const relationshipOptions = ['Parent', 'Spouse', 'Child', 'Sibling', 'Grandparent', 'Other'];
const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const FamilyManager = ({ userId, dependents = [], onUpdate }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(initialForm);

  const normalizedDependents = useMemo(
    () => (Array.isArray(dependents) ? dependents : []),
    [dependents]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openForm = () => {
    setError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setIsFormOpen(false);
    setError('');
    setFormData(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) {
      setError('User context is missing. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const conditionsArray = formData.knownConditions
      .split(',')
      .map((condition) => condition.trim())
      .filter(Boolean);

    const payload = {
      primaryUserId: userId,
      dependentData: {
        fullName: formData.fullName,
        relationship: formData.relationship,
        age: Number(formData.age),
        gender: formData.gender || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        knownConditions: conditionsArray
      }
    };

    try {
      const response = await api.addDependent(payload);
      if (response?.data?.success) {
        setFormData(initialForm);
        setIsFormOpen(false);
        if (typeof onUpdate === 'function') {
          await onUpdate();
        }
      } else {
        setError('Unable to add dependent profile right now.');
      }
    } catch (submitError) {
      setError(submitError?.response?.data?.message || submitError?.response?.data?.msg || 'Failed to add dependent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Family Profiles</h2>
          <p className="mt-1 text-sm text-slate-500">Manage dependents under your account for easier shared care tracking.</p>
        </div>
        <button
          type="button"
          onClick={isFormOpen ? closeForm : openForm}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 font-semibold text-indigo-700 transition hover:bg-indigo-100"
        >
          <UserPlus className="h-4 w-4" />
          {isFormOpen ? 'Cancel' : 'Add Dependent'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isFormOpen && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-semibold text-slate-800">New Family Member</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                required
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
              />

              <SelectField
                required
                label="Relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                options={relationshipOptions}
                placeholder="Select relationship"
              />

              <Field
                required
                type="number"
                min="0"
                label="Age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age"
              />

              <SelectField
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={genderOptions}
                placeholder="Select gender"
              />

              <SelectField
                label="Blood Group"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                options={bloodGroupOptions}
                placeholder="Select blood group"
              />

              <Field
                label="Known Conditions"
                name="knownConditions"
                value={formData.knownConditions}
                onChange={handleChange}
                placeholder="Asthma, Hypertension"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Dependent'}
            </button>
          </form>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {normalizedDependents.map((person, index) => (
          <article
            key={`${person?.fullName || 'dependent'}-${index}`}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500" />

            <h3 className="text-lg font-bold text-slate-900">{person.fullName || 'Unnamed profile'}</h3>
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {person.relationship || 'Dependent'}
            </span>

            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>
                <strong className="text-slate-700">Age:</strong> {person.age ?? 'N/A'}
                {person.gender ? ` • ${person.gender}` : ''}
              </p>
              <p>
                <strong className="text-slate-700">Blood Group:</strong>{' '}
                <span className="font-semibold text-rose-600">{person.bloodGroup || 'N/A'}</span>
              </p>
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Known Conditions</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Array.isArray(person.knownConditions) && person.knownConditions.length > 0 ? (
                  person.knownConditions.map((condition, i) => (
                    <span
                      key={`${condition}-${i}`}
                      className="rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700"
                    >
                      {condition}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No conditions noted</span>
                )}
              </div>
            </div>
          </article>
        ))}

        <button
          type="button"
          onClick={openForm}
          className="group rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/60 p-5 text-left transition hover:border-indigo-400 hover:bg-indigo-50"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 transition group-hover:bg-indigo-200">
            <Plus className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-indigo-900">Add New Dependent</h3>
          <p className="mt-1 text-sm text-indigo-700/80">Create a profile for parents, children, spouse, or other family members.</p>
        </button>
      </div>

      {normalizedDependents.length === 0 && !isFormOpen && (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <Users className="h-4 w-4" />
          No family members added yet.
        </div>
      )}
    </section>
  );
};

function Field({ label, name, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        {...rest}
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options = [], placeholder, ...rest }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        {...rest}
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default FamilyManager;
