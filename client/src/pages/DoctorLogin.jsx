import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    if (token) {
      navigate('/doctor/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/doctors/login', {
        email: formData.email,
        password: formData.password
      });

      const token = response?.data?.token;
      const doctor = response?.data?.doctor;

      if (!token) {
        throw new Error('Token not received');
      }

      localStorage.setItem('doctorToken', token);
      if (doctor?.id) {
        localStorage.setItem('doctorId', doctor.id);
      }
      if (doctor) {
        localStorage.setItem('doctorProfile', JSON.stringify(doctor));
      }

      navigate('/doctor/dashboard');
    } catch (err) {
      const responseData = err.response?.data;
      setError(
        responseData?.msg ||
          responseData?.message ||
          responseData?.error ||
          (err.response
            ? 'Unable to sign in. Please check your doctor credentials and try again.'
            : 'Unable to reach the server. Please make sure the API is running.')
      );
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 text-gray-100 shadow-2xl">
      <h1 className="text-3xl font-bold">Doctor Portal Login</h1>
      <p className="mt-2 text-sm text-gray-400">Sign in with your doctor account credentials.</p>

      {error ? (
        <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
            placeholder="doctor@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-300">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Signing in...' : 'Login to Doctor Dashboard'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-400">
        Looking for patient login?{' '}
        <Link to="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
          Go to patient sign in
        </Link>
      </p>

      <div className="mt-4 border-t border-gray-700 pt-4">
        <p className="text-sm text-gray-400">
          Not registered yet?{' '}
          <Link to="/doctor/register" className="font-medium text-cyan-300 hover:text-cyan-200">
            Register as Doctor
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DoctorLogin;
