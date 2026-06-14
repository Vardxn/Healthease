export function calculateMedicineScore(medicines = []) {
  if (medicines.length === 0) return 25; // default full marks if no meds assigned yet
  
  // calculate average mock progress ratio or compliance status
  let totalAdherence = 0;
  medicines.forEach((med) => {
    if (med.status === 'completed' || med.status === 'active') {
      totalAdherence += 90; // mock base adherence
    } else if (med.status === 'paused') {
      totalAdherence += 60;
    } else {
      totalAdherence += 30;
    }
  });

  const avgAdherence = totalAdherence / medicines.length;
  return Math.round((avgAdherence / 100) * 25);
}

export function calculateConsultationScore(consultations = []) {
  if (consultations.length === 0) return 18; // base compliance score if no visits scheduled yet
  
  const completed = consultations.filter(c => c.status === 'completed').length;
  const total = consultations.length;
  const ratio = completed / total;
  
  return Math.round(ratio * 20);
}

export function calculateVitalsScore(vitals = []) {
  let bpScore = 15;
  let sugarScore = 15;
  let weightScore = 10;
  let consistencyScore = 15;

  if (vitals.length === 0) {
    return {
      bpScore: 12,
      sugarScore: 12,
      weightScore: 8,
      consistencyScore: 5
    };
  }

  // Get latest vital entry
  const latest = vitals[vitals.length - 1];

  // BP Stability (15%)
  if (latest.bloodPressure) {
    const parts = latest.bloodPressure.split('/');
    if (parts.length === 2) {
      const systolic = parseInt(parts[0], 10);
      const diastolic = parseInt(parts[1], 10);
      if (systolic > 140 || diastolic > 90 || systolic < 90 || diastolic < 60) {
        bpScore = 8; // High/low BP penalty
      }
    }
  } else {
    bpScore = 10;
  }

  // Blood Sugar Stability (15%)
  if (latest.bloodSugar) {
    const sugar = parseFloat(latest.bloodSugar);
    if (sugar > 140 || sugar < 70) {
      sugarScore = 9; // High/low glucose penalty
    }
  } else {
    sugarScore = 10;
  }

  // Weight Consistency (10%)
  if (latest.weight) {
    weightScore = 10; // logged
  } else {
    weightScore = 7;
  }

  // Vitals Logging Consistency (15%)
  if (vitals.length >= 4) {
    consistencyScore = 15;
  } else if (vitals.length >= 2) {
    consistencyScore = 11;
  } else {
    consistencyScore = 7;
  }

  return { bpScore, sugarScore, weightScore, consistencyScore };
}

export function calculateHealthScore(medicines = [], vitals = [], consultations = []) {
  const medicinePoints = calculateMedicineScore(medicines);
  const consultationPoints = calculateConsultationScore(consultations);
  const { bpScore, sugarScore, weightScore, consistencyScore } = calculateVitalsScore(vitals);

  const totalScore = medicinePoints + consultationPoints + bpScore + sugarScore + weightScore + consistencyScore;
  const score = Math.max(0, Math.min(100, totalScore));

  let status = 'Needs Attention';
  if (score >= 90) {
    status = 'Excellent';
  } else if (score >= 75) {
    status = 'Good';
  } else if (score >= 60) {
    status = 'Average';
  }

  // Generate recommendations
  const recommendations = [];
  
  if (medicinePoints < 22) {
    recommendations.push({
      text: 'Missed medication doses detected. Align notifications and timers to prevent gaps.',
      action: 'Set Reminders',
      link: '/medicine-tracker'
    });
  } else {
    recommendations.push({
      text: 'Excellent medication compliance observed. Keep maintaining the consistency.',
      action: 'View Meds',
      link: '/medicine-tracker'
    });
  }

  if (bpScore < 12) {
    recommendations.push({
      text: 'Blood pressure variability is increasing. Reduce sodium intake and consult doctor.',
      action: 'Check Vitals',
      link: '/vitals'
    });
  }

  if (consultationPoints < 16) {
    recommendations.push({
      text: 'Missed consultation sessions detected. Reschedule queue appointments.',
      action: 'Book Doctor',
      link: '/doctors'
    });
  } else {
    recommendations.push({
      text: 'Good attendance rate for clinical consultations.',
      action: 'Find Specialists',
      link: '/doctors'
    });
  }

  if (consistencyScore < 12) {
    recommendations.push({
      text: 'Vitals tracking is irregular. Log vitals at least twice a week for accurate scores.',
      action: 'Log Vitals Now',
      link: '/vitals'
    });
  } else {
    recommendations.push({
      text: 'Vitals logging frequency is consistent.',
      action: 'Analytics History',
      link: '/vitals'
    });
  }

  return {
    score,
    status,
    factors: {
      medicine: { score: medicinePoints, max: 25 },
      consultation: { score: consultationPoints, max: 20 },
      bp: { score: bpScore, max: 15 },
      sugar: { score: sugarScore, max: 15 },
      weight: { score: weightScore, max: 10 },
      consistency: { score: consistencyScore, max: 15 }
    },
    recommendations: recommendations.slice(0, 3)
  };
}
