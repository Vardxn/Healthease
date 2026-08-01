const Vitals = require('../models/Vitals');

exports.addVitals = async (req, res, next) => {
  try {
    const { patientId, doctorId, heartRate, systolic, diastolic, spo2 } = req.body;
    
    const newVitals = new Vitals({
      patientId,
      doctorId,
      heartRate,
      systolic,
      diastolic,
      spo2
    });

    await newVitals.save();
    res.status(201).json({ success: true, data: newVitals });
  } catch (error) {
    next(error);
  }
};

exports.getPatientVitals = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    // Fetch the last 30 days of vitals, sorted chronologically
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const vitalsData = await Vitals.find({ 
      patientId, 
      dateRecorded: { $gte: thirtyDaysAgo } 
    }).sort({ dateRecorded: 1 });

    // Map to match Recharts expected format
    const formattedData = vitalsData.map(v => ({
      date: v.dateRecorded.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      heartRate: v.heartRate,
      systolic: v.systolic,
      diastolic: v.diastolic
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    next(error);
  }
};
