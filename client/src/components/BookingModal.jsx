import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const DAY_TO_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

const formatPrice = (fee) => `\u20b9${Number(fee || 0).toLocaleString('en-IN')}`;

const getNextAvailableSlot = (doctor) => {
  const now = new Date();
  const days = Array.isArray(doctor?.availability?.daysAvailable) ? doctor.availability.daysAvailable : [];
  const start = doctor?.availability?.workingHours?.start || '09:00';
  const [startHour, startMinute] = start.split(':').map((item) => Number(item));

  if (!days.length || !Number.isFinite(startHour) || !Number.isFinite(startMinute)) {
    const fallback = new Date(now.getTime() + 30 * 60 * 1000);
    return fallback;
  }

  for (let offset = 0; offset < 8; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    candidate.setHours(startHour, startMinute, 0, 0);

    const shortDay = Object.keys(DAY_TO_INDEX).find((key) => DAY_TO_INDEX[key] === candidate.getDay());
    if (!shortDay || !days.includes(shortDay)) {
      continue;
    }

    if (candidate <= now) {
      continue;
    }

    return candidate;
  }

  return new Date(now.getTime() + 30 * 60 * 1000);
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const BookingModal = ({ isOpen, onClose, doctor, user }) => {
  const navigate = useNavigate();
  const [consultationType, setConsultationType] = useState('video');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableTypes = useMemo(() => {
    const types = Array.isArray(doctor?.consultationType) ? doctor.consultationType : [];
    return types.length ? types : ['video'];
  }, [doctor]);

  const nextSlot = useMemo(() => getNextAvailableSlot(doctor), [doctor]);

  if (!isOpen || !doctor) return null;

  const handleBookAndPay = async () => {
    try {
      setLoading(true);
      setError('');

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        setError('Unable to load Razorpay checkout. Please try again.');
        setLoading(false);
        return;
      }

      const createResponse = await paymentAPI.createOrder({
        doctorId: doctor._id,
        consultationType,
        scheduledAt: nextSlot.toISOString()
      });

      const { key, order, consultation } = createResponse.data;

      const razorpay = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'HealthEase',
        description: `${consultationType.toUpperCase()} consultation with Dr. ${doctor.name}`,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        notes: {
          consultationId: consultation.id
        },
        theme: {
          color: '#0ea5a3'
        },
        handler: async (response) => {
          const verifyResponse = await paymentAPI.verify({
            consultationId: consultation.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          const redirectUrl = verifyResponse?.data?.redirectUrl || `/consultation/${consultation.id}`;
          onClose?.();
          navigate(redirectUrl);
        }
      });

      razorpay.on('payment.failed', (event) => {
        setError(event?.error?.description || 'Payment failed. Please try again.');
      });

      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to complete booking right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
            <h2 className="text-xl font-semibold">Confirm Consultation Booking</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-slate-800 px-3 py-1 text-sm text-slate-300 hover:bg-slate-700"
            >
              Close
            </button>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="flex items-start gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
              <img
                src={doctor.profilePhoto || 'https://placehold.co/120x120?text=Doctor'}
                alt={doctor.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-lg font-semibold">Dr. {doctor.name}</p>
                <p className="text-sm text-slate-300">{doctor.specialization || 'General Medicine'}</p>
                <p className="mt-2 text-base font-semibold text-emerald-300">Consultation Fee: {formatPrice(doctor.consultationFee)} INR</p>
                <p className="mt-1 text-sm text-slate-300">
                  Next available slot: {nextSlot.toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">Consultation Type</p>
              <div className="grid grid-cols-3 gap-2">
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setConsultationType(type)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                      consultationType === type
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                        : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
                {error}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-700 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBookAndPay}
              disabled={loading}
              className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Processing...' : `Book & Pay ${formatPrice(doctor.consultationFee)}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingModal;
