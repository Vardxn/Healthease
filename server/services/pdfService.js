const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

exports.generateMedicalReportPDF = async (patientData) => {
  // 1. Render HTML using EJS template
  const templatePath = path.join(__dirname, '../templates/medical_report.ejs');
  const html = await ejs.renderFile(templatePath, { patient: patientData });

  // 2. Launch Puppeteer
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // 3. Set content and generate PDF buffer
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '15mm', right: '12mm', bottom: '15mm', left: '12mm' },
    printBackground: true
  });

  await browser.close();
  return pdfBuffer;
};
