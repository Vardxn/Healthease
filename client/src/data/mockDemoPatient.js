export const createMockDemoPatient = () => ({
  profile: {
    name: 'Alex Mercer (Guest Demo)',
    status: 'Active Outpatient Mode',
    age: 42,
    bloodGroup: 'B+',
    chronicConditions: ['Mild Hypertension', 'Prediabetes'],
    allergies: ['Penicillin']
  },
  ocrScanHistory: [
    {
      medicine: 'Amoxicillin 500mg',
      schedule: 'TID (Three times daily)',
      prescribingPhysician: 'Dr. Sarah Jenkins',
      date: '2026-07-10',
      status: 'Verified'
    },
    {
      medicine: 'Lisinopril 10mg',
      schedule: 'OD (Once daily)',
      prescribingPhysician: 'Dr. Sarah Jenkins',
      date: '2026-07-08',
      status: 'Verified'
    },
    {
      medicine: 'Metformin HCl 500mg',
      schedule: 'BID (Twice daily)',
      prescribingPhysician: 'Dr. Sarah Jenkins',
      date: '2026-07-08',
      status: 'Verified'
    },
    {
      medicine: 'Vitamin D3 60000 IU',
      schedule: 'Weekly after lunch',
      prescribingPhysician: 'Dr. Sarah Jenkins',
      date: '2026-07-03',
      status: 'Verified'
    }
  ],
  telemetryTrackingLogs: {
    adherenceFactor: 94,
    missedDoses: 2,
    takenDoses: 26,
    days: Array.from({ length: 14 }, (_, index) => ({
      date: `Day ${index + 1}`,
      status: index === 4 || index === 10 ? 'missed' : 'taken'
    }))
  },
  biometricVitalsSeries: [
    { date: 'Wk 1', systolic: 122, diastolic: 81, bloodSugar: 98, heartRate: 72, weight: 78.5 },
    { date: 'Wk 2', systolic: 120, diastolic: 80, bloodSugar: 95, heartRate: 74, weight: 78.2 },
    { date: 'Wk 3', systolic: 119, diastolic: 79, bloodSugar: 102, heartRate: 71, weight: 77.9 },
    { date: 'Wk 4', systolic: 121, diastolic: 80, bloodSugar: 96, heartRate: 72, weight: 78.0 },
    { date: 'Wk 5', systolic: 118, diastolic: 78, bloodSugar: 94, heartRate: 70, weight: 77.6 },
    { date: 'Wk 6', systolic: 117, diastolic: 77, bloodSugar: 92, heartRate: 69, weight: 77.3 }
  ],
  aiConversationHistory: [
    {
      sender: 'user',
      text: 'Can I take Amoxicillin with my current BP medicine?',
      timestamp: '2026-07-11T10:15:00.000Z'
    },
    {
      sender: 'ai',
      text: 'Your demo profile shows Lisinopril 10mg daily. No major interaction is flagged with Amoxicillin, but your Penicillin allergy needs clinician confirmation before use.',
      timestamp: '2026-07-11T10:15:08.000Z'
    },
    {
      sender: 'user',
      text: 'Why is my adherence score high despite two missed doses?',
      timestamp: '2026-07-12T18:30:00.000Z'
    },
    {
      sender: 'ai',
      text: 'The 14-day telemetry log shows 26 taken and 2 missed doses, producing a 94% adherence factor. Keep the evening Metformin reminder active.',
      timestamp: '2026-07-12T18:30:09.000Z'
    }
  ],
  completedTelemedicineConsultations: [
    {
      id: 'demo-consult-001',
      status: 'completed',
      roomType: 'video',
      physician: 'Dr. Sarah Jenkins',
      completedAt: '2026-07-13T15:30:00.000Z',
      report: {
        fileName: 'alex-mercer-demo-clinical-report.pdf',
        downloadUrl: '/exports',
        summary: 'BP trend improving. Continue Lisinopril 10mg, monitor fasting glucose, and repeat HbA1c before next follow-up.'
      }
    }
  ]
});

export const cloneMockDemoPatient = () => structuredClone(createMockDemoPatient());

export default createMockDemoPatient();
