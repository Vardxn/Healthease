"""
Email Reminder Sender
Sends styled HTML emails for medication reminders using SMTP
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_reminder_email(user_email: str, user_name: str, medications: list, reminder_time: str) -> bool:
    """
    Send a styled HTML email with medication reminder
    
    Args:
        user_email: Patient's email address
        user_name: Patient's name
        medications: List of medication dicts with name, dosage, frequency
        reminder_time: Time string (HH:MM format) when reminder was scheduled
    
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Get SMTP config from environment
        smtp_host = os.getenv('SMTP_HOST')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        smtp_user = os.getenv('SMTP_USER')
        smtp_pass = os.getenv('SMTP_PASS')
        smtp_from = os.getenv('SMTP_FROM', smtp_user)
        
        # Validate SMTP config
        if not all([smtp_host, smtp_user, smtp_pass, smtp_from]):
            print("⚠️ SMTP config incomplete, skipping email send")
            return False
        
        # Build medication list HTML
        medications_html = ""
        if medications:
            medications_html = "<ul style='margin: 10px 0; padding-left: 20px;'>"
            for med in medications:
                med_name = med.get('name', 'Unknown')
                med_dosage = med.get('dosage', '')
                med_frequency = med.get('frequency', '')
                med_str = med_name
                if med_dosage:
                    med_str += f" - {med_dosage}"
                if med_frequency:
                    med_str += f" ({med_frequency})"
                medications_html += f"<li style='margin: 5px 0; color: #333;'>{med_str}</li>"
            medications_html += "</ul>"
        else:
            medications_html = "<p style='color: #666;'>No specific medications recorded</p>"
        
        # Create HTML email body
        html_body = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }}
                    .container {{ max-width: 500px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }}
                    .content {{ background: #f8f9fa; padding: 20px; border: 1px solid #e0e0e0; }}
                    .message {{ font-size: 18px; color: #333; font-weight: bold; margin: 15px 0; }}
                    .time {{ font-size: 24px; color: #667eea; font-weight: bold; }}
                    .medications {{ background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea; }}
                    .footer {{ background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }}
                    .footer a {{ color: #667eea; text-decoration: none; }}
                    .brand {{ color: #667eea; font-weight: bold; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">💊 Medication Reminder</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>{user_name}</strong>,</p>
                        
                        <div class="message">
                            ⏰ Time to take your medicine!
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">
                            You have a scheduled medication reminder at:
                        </p>
                        
                        <div class="time">{reminder_time}</div>
                        
                        <div class="medications">
                            <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Your Medications:</p>
                            {medications_html}
                        </div>
                        
                        <p style="font-size: 13px; color: #666; margin: 15px 0 0 0;">
                            Always take your medications as prescribed by your doctor.
                            If you have any questions or concerns, consult your healthcare provider.
                        </p>
                    </div>
                    <div class="footer">
                        <p style="margin: 0 0 8px 0;">
                            This is an automated reminder from <span class="brand">HealthEase</span>
                        </p>
                        <p style="margin: 0;">
                            <a href="https://healthease.example.com">Visit HealthEase</a> | 
                            <a href="https://healthease.example.com/settings">Manage Reminders</a>
                        </p>
                        <p style="margin: 8px 0 0 0; font-size: 11px;">
                            © 2026 HealthEase - Healthcare Management Platform
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "💊 Your Medication Reminder - HealthEase"
        msg['From'] = smtp_from
        msg['To'] = user_email
        
        # Attach HTML version
        msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        
        print(f"✅ Reminder email sent to {user_email} for {reminder_time}")
        return True
        
    except smtplib.SMTPAuthenticationError:
        print(f"❌ SMTP Authentication failed for user {smtp_user}")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ SMTP error sending email to {user_email}: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error sending reminder email to {user_email}: {str(e)}")
        return False
