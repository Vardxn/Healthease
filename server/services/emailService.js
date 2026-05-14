const nodemailer = require('nodemailer');

// Configure Gmail transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-email@gmail.com',
    pass: process.env.GMAIL_PASSWORD || 'your-app-password'
  }
});

// =====================
// EMAIL TEMPLATES
// =====================

const getMedicineReminderEmail = (user, medicine, reminderTime) => {
  return {
    subject: `💊 Medicine Reminder: ${medicine.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <h2 style="color: #2c3e50; margin-bottom: 10px;">💊 Medicine Reminder</h2>
          <p style="color: #7f8c8d; margin: 0 0 20px 0;">It's time to take your medicine!</p>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-left: 4px solid #3498db; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 10px 0; color: #2c3e50;"><strong>Medicine:</strong> ${medicine.name}</p>
            <p style="margin: 10px 0; color: #2c3e50;"><strong>Dosage:</strong> ${medicine.dosage}</p>
            <p style="margin: 10px 0; color: #2c3e50;"><strong>Time:</strong> ${reminderTime}</p>
            <p style="margin: 10px 0; color: #2c3e50;"><strong>Frequency:</strong> ${medicine.frequency}</p>
          </div>

          ${medicine.instructions ? `
          <div style="margin: 20px 0;">
            <p style="color: #2c3e50; margin: 10px 0;"><strong>Instructions:</strong></p>
            <p style="color: #7f8c8d; margin: 10px 0;">${medicine.instructions}</p>
          </div>
          ` : ''}

          ${medicine.takeWithFood ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0;"><strong>⚠️ Take with food</strong></p>
          </div>
          ` : ''}

          ${medicine.sideEffects && medicine.sideEffects.length > 0 ? `
          <div style="margin: 20px 0;">
            <p style="color: #2c3e50; margin: 10px 0;"><strong>Possible Side Effects:</strong></p>
            <ul style="color: #7f8c8d; margin: 10px 0; padding-left: 20px;">
              ${medicine.sideEffects.map(effect => `<li>${effect}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #7f8c8d; font-size: 12px;">This is an automated reminder from HealthEase</p>
            <p style="color: #95a5a6; font-size: 11px;">Please consult your doctor if you have any concerns about your medication.</p>
          </div>

        </div>
      </div>
    `
  };
};

const getMedicineCompletionEmail = (user, medicineTracking) => {
  const { takingCount, skippedCount, missedCount, totalDays } = medicineTracking;
  const adherencePercentage = Math.round((takingCount / totalDays) * 100);

  return {
    subject: `✅ Medicine Course Completion Report`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <h2 style="color: #27ae60; margin-bottom: 10px;">✅ Medicine Course Complete</h2>
          <p style="color: #7f8c8d; margin: 0 0 20px 0;">Your medicine course has been completed.</p>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-left: 4px solid #27ae60; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 10px 0; color: #2c3e50;"><strong>Total Days:</strong> ${totalDays}</p>
            <p style="margin: 10px 0; color: #27ae60;"><strong>✓ Taken:</strong> ${takingCount}</p>
            <p style="margin: 10px 0; color: #f39c12;"><strong>⊘ Skipped:</strong> ${skippedCount}</p>
            <p style="margin: 10px 0; color: #e74c3c;"><strong>✗ Missed:</strong> ${missedCount}</p>
          </div>

          <div style="background-color: #d5f4e6; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="color: #27ae60; font-size: 24px; margin: 0; font-weight: bold;">${adherencePercentage}%</p>
            <p style="color: #27ae60; margin: 10px 0 0 0;">Medication Adherence</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #7f8c8d;">Well done on completing your medicine course!</p>
            <p style="color: #95a5a6; font-size: 12px;">If you need to continue this medication, please consult your doctor.</p>
          </div>

        </div>
      </div>
    `
  };
};

const getRefillReminderEmail = (user, medicine) => {
  return {
    subject: `⚕️ Medicine Refill Reminder: ${medicine.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <h2 style="color: #e74c3c; margin-bottom: 10px;">⚕️ Time to Refill Your Medicine</h2>
          <p style="color: #7f8c8d; margin: 0 0 20px 0;">Your medicine stock is running low.</p>
          
          <div style="background-color: #ffe6e6; padding: 20px; border-left: 4px solid #e74c3c; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 10px 0; color: #2c3e50;"><strong>Medicine:</strong> ${medicine.name}</p>
            <p style="margin: 10px 0; color: #2c3e50;"><strong>Dosage:</strong> ${medicine.dosage}</p>
            <p style="margin: 10px 0; color: #e74c3c;"><strong>Remaining Doses:</strong> ${medicine.quantityRemaining}</p>
          </div>

          <p style="color: #7f8c8d; margin: 20px 0;">Please refill your medicine prescription to ensure continuous treatment.</p>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #95a5a6; font-size: 12px;">This is an automated reminder from HealthEase</p>
          </div>

        </div>
      </div>
    `
  };
};

// =====================
// EMAIL SENDING FUNCTIONS
// =====================

/**
 * Send medicine reminder email
 * @param {string} userEmail - User's email address
 * @param {object} user - User object
 * @param {object} medicine - Medicine object
 * @param {string} reminderTime - Time to take medicine (HH:mm)
 */
exports.sendMedicineReminder = async (userEmail, user, medicine, reminderTime) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      console.warn('Gmail credentials not configured. Skipping email notification.');
      return { success: false, message: 'Email service not configured' };
    }

    const emailContent = getMedicineReminderEmail(user, medicine, reminderTime);

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    await transporter.sendMail(mailOptions);

    console.log(`✉️ Medicine reminder sent to ${userEmail}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending medicine reminder email:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send medicine completion report
 * @param {string} userEmail - User's email
 * @param {object} user - User object
 * @param {object} medicineTracking - Tracking data
 */
exports.sendCompletionReport = async (userEmail, user, medicineTracking) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      console.warn('Gmail credentials not configured. Skipping email notification.');
      return { success: false, message: 'Email service not configured' };
    }

    const emailContent = getMedicineCompletionEmail(user, medicineTracking);

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    await transporter.sendMail(mailOptions);

    console.log(`✉️ Completion report sent to ${userEmail}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending completion report email:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send refill reminder email
 * @param {string} userEmail - User's email
 * @param {object} user - User object
 * @param {object} medicine - Medicine object
 */
exports.sendRefillReminder = async (userEmail, user, medicine) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      console.warn('Gmail credentials not configured. Skipping email notification.');
      return { success: false, message: 'Email service not configured' };
    }

    const emailContent = getRefillReminderEmail(user, medicine);

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    await transporter.sendMail(mailOptions);

    console.log(`✉️ Refill reminder sent to ${userEmail}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending refill reminder email:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send bulk email to multiple users
 * @param {array} recipients - Array of {email, user, medicine, reminderTime}
 */
exports.sendBulkReminders = async (recipients) => {
  try {
    const results = [];

    for (const recipient of recipients) {
      const result = await exports.sendMedicineReminder(
        recipient.email,
        recipient.user,
        recipient.medicine,
        recipient.reminderTime
      );
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error('Error sending bulk reminders:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Test email configuration
 */
exports.testEmailConfiguration = async (testEmail) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: testEmail,
      subject: '✅ HealthEase Email Service - Test',
      html: `
        <div style="font-family: Arial; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #27ae60;">✅ Email Service Working!</h2>
            <p>Your HealthEase email notifications are configured correctly.</p>
            <p>You will now receive medicine reminders at the scheduled times.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Test email sent successfully' };
  } catch (error) {
    console.error('Error testing email configuration:', error);
    return { success: false, message: error.message };
  }
};

module.exports = exports;
