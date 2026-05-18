const { VitalsLog, FamilyProfile, Gamification } = require('../models/WellnessProfile');

function toDayString(date) {
  return new Date(date).toISOString().split('T')[0];
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeMetrics(rawMetrics = {}) {
  const rawBP = rawMetrics.bloodPressure || {};
  const bloodPressure = {
    systolic: parseNumber(rawBP.systolic),
    diastolic: parseNumber(rawBP.diastolic)
  };

  const metrics = {
    bloodPressure,
    bloodSugar: parseNumber(rawMetrics.bloodSugar),
    spo2: parseNumber(rawMetrics.spo2),
    weight: parseNumber(rawMetrics.weight)
  };

  return metrics;
}

function validateMetrics(metrics) {
  const errors = [];

  if (metrics.spo2 !== undefined && (metrics.spo2 < 0 || metrics.spo2 > 100)) {
    errors.push('SpO2 must be between 0 and 100.');
  }

  if (metrics.bloodPressure?.systolic !== undefined && (metrics.bloodPressure.systolic < 40 || metrics.bloodPressure.systolic > 300)) {
    errors.push('Systolic blood pressure is out of safe bounds.');
  }

  if (metrics.bloodPressure?.diastolic !== undefined && (metrics.bloodPressure.diastolic < 30 || metrics.bloodPressure.diastolic > 200)) {
    errors.push('Diastolic blood pressure is out of safe bounds.');
  }

  if (
    metrics.bloodPressure?.systolic !== undefined &&
    metrics.bloodPressure?.diastolic !== undefined &&
    metrics.bloodPressure.systolic <= metrics.bloodPressure.diastolic
  ) {
    errors.push('Systolic blood pressure must be greater than diastolic blood pressure.');
  }

  if (metrics.bloodSugar !== undefined && (metrics.bloodSugar < 20 || metrics.bloodSugar > 1000)) {
    errors.push('Blood sugar is out of safe bounds.');
  }

  if (metrics.weight !== undefined && (metrics.weight < 1 || metrics.weight > 500)) {
    errors.push('Weight is out of safe bounds.');
  }

  return errors;
}

async function upsertGamificationForLog(userId, recordedAt) {
  const todayStr = toDayString(recordedAt || new Date());
  let rewardsProfile = await Gamification.findOne({ userId });

  if (!rewardsProfile) {
    rewardsProfile = new Gamification({ userId });
  }

  if (rewardsProfile.lastLoggedDate !== todayStr) {
    rewardsProfile.wellnessPoints += 50;

    const yesterday = new Date(recordedAt || new Date());
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toDayString(yesterday);

    if (rewardsProfile.lastLoggedDate === yesterdayStr) {
      rewardsProfile.currentStreakDays += 1;
    } else {
      rewardsProfile.currentStreakDays = 1;
    }

    rewardsProfile.lastLoggedDate = todayStr;

    if (
      rewardsProfile.currentStreakDays === 7 &&
      !rewardsProfile.unlockedBadges.some((b) => b.badgeId === 'VITALS_STREAK_7')
    ) {
      rewardsProfile.unlockedBadges.push({
        badgeId: 'VITALS_STREAK_7',
        badgeName: '7-Day Health Champion'
      });
      rewardsProfile.wellnessPoints += 200;
    }

    await rewardsProfile.save();
  }

  return rewardsProfile;
}

exports.logVitals = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    const metrics = normalizeMetrics(req.body.metrics || {});
    const source = req.body.source || 'Manual';

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required.' });
    }

    const validationErrors = validateMetrics(metrics);
    if (validationErrors.length) {
      return res.status(400).json({ success: false, message: validationErrors.join(' ') });
    }

    const hasAnyMetric =
      metrics.bloodPressure?.systolic !== undefined ||
      metrics.bloodPressure?.diastolic !== undefined ||
      metrics.bloodSugar !== undefined ||
      metrics.spo2 !== undefined ||
      metrics.weight !== undefined;

    if (!hasAnyMetric) {
      return res.status(400).json({ success: false, message: 'At least one vital metric is required.' });
    }

    const newLog = await VitalsLog.create({
      userId,
      source,
      metrics,
      recordedAt: req.body.recordedAt || new Date()
    });

    const pointsProfile = await upsertGamificationForLog(userId, newLog.recordedAt);

    return res.status(201).json({
      success: true,
      message: 'Metrics logged successfully.',
      data: newLog,
      pointsProfile
    });
  } catch (error) {
    console.error('Vitals Logging Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error logging metrics.' });
  }
};

exports.syncWearableData = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;
    const provider = String(req.body.provider || '').toLowerCase();
    const payload = Array.isArray(req.body.externalMetricsPayload) ? req.body.externalMetricsPayload : [];

    if (!userId || !provider || !payload.length) {
      return res.status(400).json({ success: false, message: 'userId, provider, and externalMetricsPayload are required.' });
    }

    const source = provider === 'apple' ? 'AppleHealth' : 'GoogleFit';

    const transformedLogs = payload
      .map((entry) => {
        const metrics = normalizeMetrics({
          bloodPressure: entry.bp ? { systolic: entry.bp.sys, diastolic: entry.bp.dia } : undefined,
          spo2: entry.oxygenSaturation,
          weight: entry.bodyMass,
          bloodSugar: entry.glucose
        });

        const validationErrors = validateMetrics(metrics);
        if (validationErrors.length) return null;

        const hasAnyMetric =
          metrics.bloodPressure?.systolic !== undefined ||
          metrics.bloodPressure?.diastolic !== undefined ||
          metrics.bloodSugar !== undefined ||
          metrics.spo2 !== undefined ||
          metrics.weight !== undefined;

        if (!hasAnyMetric) return null;

        return {
          userId,
          source,
          metrics,
          recordedAt: entry.timestamp || new Date()
        };
      })
      .filter(Boolean);

    if (!transformedLogs.length) {
      return res.status(400).json({ success: false, message: 'No valid wearable metric entries found in payload.' });
    }

    const inserted = await VitalsLog.insertMany(transformedLogs, { ordered: false });
    await upsertGamificationForLog(userId, new Date());

    return res.status(200).json({
      success: true,
      message: `Successfully synced metrics from ${provider}.`,
      syncedCount: inserted.length
    });
  } catch (error) {
    console.error('Wearable Sync Error:', error);
    return res.status(500).json({ success: false, message: 'Wearable synchronization process failed.' });
  }
};

exports.addDependentProfile = async (req, res) => {
  try {
    const primaryUserId = req.body.primaryUserId || req.user?.id;
    const dependentData = req.body.dependentData;

    if (!primaryUserId || !dependentData?.fullName || !dependentData?.relationship || dependentData?.age === undefined) {
      return res.status(400).json({ success: false, message: 'primaryUserId and dependentData (fullName, relationship, age) are required.' });
    }

    let familyScope = await FamilyProfile.findOne({ primaryUserId });
    if (!familyScope) {
      familyScope = new FamilyProfile({ primaryUserId, dependents: [] });
    }

    familyScope.dependents.push(dependentData);
    familyScope.updatedAt = Date.now();
    await familyScope.save();

    return res.status(201).json({ success: true, data: familyScope });
  } catch (error) {
    console.error('Add Dependent Error:', error);
    return res.status(500).json({ success: false, message: 'Could not establish dependent account connection.' });
  }
};

exports.getEngagementDashboard = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required.' });
    }

    const healthHistory = await VitalsLog.find({ userId }).sort({ recordedAt: -1 }).limit(30);
    const familyTree = await FamilyProfile.findOne({ primaryUserId: userId });
    const gamingScore =
      (await Gamification.findOne({ userId })) ||
      {
        wellnessPoints: 0,
        unlockedBadges: [],
        currentStreakDays: 0,
        lastLoggedDate: null
      };

    return res.status(200).json({
      success: true,
      vitalsHistory30Days: healthHistory,
      familyNetwork: familyTree ? familyTree.dependents : [],
      achievements: gamingScore
    });
  } catch (error) {
    console.error('Dashboard Fetch Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assemble complete analytics metrics view.' });
  }
};
