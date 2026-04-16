const Patient = require('../models/Patient');

const parseStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const buildProfilePayload = (body = {}) => ({
  fullName: typeof body.fullName === 'string' ? body.fullName.trim() : '',
  dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
  gender: body.gender || undefined,
  bloodGroup: body.bloodGroup || undefined,
  height: parseNumber(body.height),
  weight: parseNumber(body.weight),
  allergies: parseStringArray(body.allergies),
  chronicConditions: parseStringArray(body.chronicConditions),
  emergencyContact: {
    name: body.emergencyContact?.name ? String(body.emergencyContact.name).trim() : '',
    phone: body.emergencyContact?.phone ? String(body.emergencyContact.phone).trim() : '',
    relation: body.emergencyContact?.relation ? String(body.emergencyContact.relation).trim() : ''
  }
});

exports.getProfile = async (req, res) => {
  try {
    const profile = await Patient.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        msg: 'Patient profile not found'
      });
    }

    return res.json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error('Get patient profile error:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server Error'
    });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const existingProfile = await Patient.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        msg: 'Patient profile already exists'
      });
    }

    const payload = buildProfilePayload(req.body);
    if (!payload.fullName) {
      return res.status(400).json({
        success: false,
        msg: 'fullName is required'
      });
    }

    const profile = await Patient.create({
      userId: req.user.id,
      ...payload,
      emergencyContact: payload.emergencyContact,
      vitals: []
    });

    return res.status(201).json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error('Create patient profile error:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server Error'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const payload = buildProfilePayload(req.body);
    if (!payload.fullName) {
      return res.status(400).json({
        success: false,
        msg: 'fullName is required'
      });
    }

    const profile = await Patient.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          ...payload,
          emergencyContact: payload.emergencyContact,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        msg: 'Patient profile not found'
      });
    }

    return res.json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error('Update patient profile error:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server Error'
    });
  }
};

exports.addVitals = async (req, res) => {
  try {
    const vitalsEntry = {
      recordedAt: req.body.recordedAt ? new Date(req.body.recordedAt) : new Date(),
      bloodPressure: typeof req.body.bloodPressure === 'string' ? req.body.bloodPressure.trim() : '',
      heartRate: parseNumber(req.body.heartRate),
      temperature: parseNumber(req.body.temperature),
      sugarLevel: parseNumber(req.body.sugarLevel),
      oxygenLevel: parseNumber(req.body.oxygenLevel)
    };

    const profile = await Patient.findOneAndUpdate(
      { userId: req.user.id },
      {
        $push: { vitals: vitalsEntry },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        msg: 'Patient profile not found'
      });
    }

    return res.json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error('Add vitals error:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server Error'
    });
  }
};

exports.getVitals = async (req, res) => {
  try {
    const profile = await Patient.findOne({ userId: req.user.id }).select('vitals');

    if (!profile) {
      return res.status(404).json({
        success: false,
        msg: 'Patient profile not found'
      });
    }

    const vitals = Array.isArray(profile.vitals)
      ? [...profile.vitals]
          .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
          .slice(0, 10)
      : [];

    return res.json({
      success: true,
      data: vitals
    });
  } catch (err) {
    console.error('Get vitals error:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server Error'
    });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Patient.findOneAndDelete({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        msg: 'Patient profile not found'
      });
    }

    return res.json({
      success: true,
      msg: 'Patient profile deleted'
    });
  } catch (err) {
    console.error('Delete patient profile error:', err);
    return res.status(500).json({
      success: false,
      msg: 'Server Error'
    });
  }
};
