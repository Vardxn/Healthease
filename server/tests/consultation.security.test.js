const express = require('express');
const request = require('supertest');

// Mock auth middleware to inject req.user from headers for each test request.
jest.mock('../middleware/auth', () => {
  return (req, res, next) => {
    req.user = {
      id: req.header('x-user-id'),
      role: req.header('x-user-role')
    };
    next();
  };
});

const mockSave = jest.fn();

// Mock Consultation model constructor + static methods used by the controller.
jest.mock('../models/Consultation', () => {
  const ConsultationModel = jest.fn(function ConsultationModel(data) {
    Object.assign(this, data);
    this._id = this._id || 'consultation-123';
    this.save = mockSave.mockImplementation(async () => this);
  });

  ConsultationModel.countDocuments = jest.fn();
  ConsultationModel.find = jest.fn();

  return ConsultationModel;
});

const Consultation = require('../models/Consultation');
const consultationRoutes = require('../routes/consultationRoutes');

describe('Consultation Security Integration', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/api/consultations', consultationRoutes);
  });

  describe('POST /api/consultations', () => {
    it('uses patientId from auth token and ignores malicious req.body.patientId', async () => {
      Consultation.countDocuments.mockResolvedValue(2);

      const tokenPatientId = 'patient-token-abc';
      const maliciousPatientId = 'patient-malicious-xyz';

      const payload = {
        patientId: maliciousPatientId,
        doctorId: 'doctor-777',
        consultationType: 'video',
        scheduledAt: '2026-05-01T10:00:00.000Z',
        fee: 900
      };

      const response = await request(app)
        .post('/api/consultations')
        .set('x-user-id', tokenPatientId)
        .set('x-user-role', 'patient')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verifies constructor input used token-based patientId, not body patientId.
      expect(Consultation).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: tokenPatientId,
          doctorId: payload.doctorId,
          consultationType: payload.consultationType,
          fee: payload.fee
        })
      );

      expect(Consultation).not.toHaveBeenCalledWith(
        expect.objectContaining({ patientId: maliciousPatientId })
      );

      // Verifies persisted/returned resource also reflects token patient id.
      expect(response.body.data.patientId).toBe(tokenPatientId);
      expect(response.body.data.patientId).not.toBe(maliciousPatientId);
    });
  });

  describe('GET /api/consultations/queue/:doctorId', () => {
    it('returns 403 when authenticated doctor id does not match requested :doctorId', async () => {
      const response = await request(app)
        .get('/api/consultations/queue/doctor-owner-2')
        .set('x-user-id', 'doctor-owner-1')
        .set('x-user-role', 'doctor');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.msg).toMatch(/access denied/i);

      // No DB lookup should happen when authorization fails early.
      expect(Consultation.find).not.toHaveBeenCalled();
    });
  });
});
