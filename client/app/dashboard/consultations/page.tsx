'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, User, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function ConsultationsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Static dummy data for previous consultations just for UI aesthetics
  const pastConsultations = [
    { id: 3, doctor: 'Dr. Rajesh Kumar', specialty: 'Dermatologist', date: 'Jul 10, 2026', time: '11:15 AM', type: 'Video Call', fee: '₹600', status: 'Completed' }
  ];

  useEffect(() => {
    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Fetch available doctors from database
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        if (res.success && res.data) {
          setDoctors(res.data.doctors || []);
        }
      } catch (err) {
        console.error('Failed to fetch doctors', err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleBookAndPay = async () => {
    if (!selectedDoctor) {
      setError('Please select a doctor to book.');
      return;
    }
    
    setError('');
    setPaymentProcessing(true);
    
    try {
      // 1. Create order on backend
      const res = await api.post('/payments/create-order', {
        doctorId: selectedDoctor,
        consultationType: 'video',
        scheduledAt: new Date(Date.now() + 86400000) // Tomorrow
      });
      
      if (!res.success) throw new Error(res.msg || 'Order creation failed');

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: res.key,
        amount: res.order.amount,
        currency: res.order.currency,
        name: 'HealthEase Consultations',
        description: 'Doctor Consultation Booking',
        order_id: res.order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post('/payments/verify', {
              consultationId: res.consultation.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            if (verifyRes.success) {
              alert('Payment successful and consultation booked!');
              setIsBooking(false);
              // In a real app, refresh the consultations list here
            } else {
              setError('Payment verification failed.');
            }
          } catch (err) {
            setError('Payment verification error.');
          }
        },
        theme: {
          color: '#0D9488'
        }
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description);
      });
      rzp.open();
      
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 font-[family-name:var(--font-sans)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-[family-name:var(--font-heading)]">Consultations</h1>
          <p className="text-slate-500 mt-2">Manage your upcoming appointments and view past visits.</p>
        </div>
        <Button 
          onClick={() => setIsBooking(!isBooking)}
          className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium px-6 py-2 rounded-xl shadow-lg shadow-[#0D9488]/20 transition-all"
        >
          {isBooking ? 'Cancel Booking' : 'Book New Appointment'}
        </Button>
      </div>

      {isBooking && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold mb-4">Select a Doctor</h2>
          {error && <div className="text-rose-500 mb-4 bg-rose-50 p-3 rounded-lg text-sm">{error}</div>}
          
          {loadingDoctors ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-teal-600" /></div>
          ) : doctors.length === 0 ? (
            <p className="text-slate-500 text-sm">No doctors available to book right now.</p>
          ) : (
            <div className="space-y-4">
              <select 
                value={selectedDoctor} 
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map(doc => (
                  <option key={doc._id} value={doc._id}>
                    Dr. {doc.userId?.name} ({doc.specialization?.[0] || 'General'}) - ₹{doc.consultationFee || 500}
                  </option>
                ))}
              </select>
              <Button 
                onClick={handleBookAndPay} 
                disabled={!selectedDoctor || paymentProcessing}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white"
              >
                {paymentProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {paymentProcessing ? 'Processing...' : 'Pay securely with Razorpay'}
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Past Section */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-slate-500" />
          Past Consultations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pastConsultations.map((consult) => (
            <motion.div key={consult.id} whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-4 opacity-70">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{consult.doctor}</h3>
                    <p className="text-sm text-slate-500">{consult.specialty}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                    {consult.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{consult.date}</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{consult.time}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
