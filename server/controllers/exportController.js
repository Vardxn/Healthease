const { generateMedicalReportPDF } = require('../services/pdfService');
const User = require('../models/User'); // Assuming unified User model

exports.downloadMedicalRecord = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    // Fetch full relational data for the PDF
    const patientData = await User.findById(patientId)
      // Assuming you might have these fields. Adjust based on real schema.
      // .populate('healthProfile')
      // .populate('medications')
      .lean();

    if (!patientData) return res.status(404).json({ error: 'Patient not found' });

    // Generate PDF Buffer
    const pdfBuffer = await generateMedicalReportPDF(patientData);

    // Set headers for file download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="HealthEase_Record_${(patientData.name || 'Patient').replace(/\s+/g, '_')}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

exports.exportFHIRRecord = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const patientData = await User.findById(patientId).lean();
    if (!patientData) return res.status(404).json({ error: 'Patient not found' });

    // Construct a basic FHIR R4 Patient Resource Document Bundle
    const fhirBundle = {
      resourceType: "Bundle",
      type: "document",
      entry: [
        {
          resourceType: "Patient",
          id: patientData._id.toString(),
          name: [
            {
              use: "official",
              text: patientData.name || "Unknown Patient"
            }
          ],
          telecom: [
            {
              system: "email",
              value: patientData.email || ""
            }
          ]
        }
        // Note: For MVP, we map the base Patient resource. 
        // Future iterations map Prescriptions -> MedicationRequest, Vitals -> Observation.
      ]
    };

    res.set({
      'Content-Type': 'application/fhir+json',
      'Content-Disposition': `attachment; filename="FHIR_Record_${patientId}.json"`
    });

    res.send(fhirBundle);
  } catch (error) {
    next(error);
  }
};
