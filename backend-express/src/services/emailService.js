const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Service - Handles sending emails
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      logger.info('Email transporter initialized');
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  /**
   * Send event approval notification to NGO
   */
  async sendEventApprovalEmail(event, ngoEmail) {
    try {
      if (!this.transporter) {
        logger.warn('Email transporter not initialized');
        return { success: false, message: 'Email service not configured' };
      }

      const mailOptions = {
        from: `"Ethiopian Volunteer Platform" <${process.env.EMAIL_USER}>`,
        to: ngoEmail,
        subject: '✅ Your Event Has Been Approved!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .event-details h3 { color: #667eea; margin-top: 0; }
              .detail-row { margin: 10px 0; }
              .detail-label { font-weight: bold; color: #555; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Event Approved!</h1>
              </div>
              <div class="content">
                <p>Great news! Your event has been approved by our admin team and is now live on the platform.</p>
                
                <div class="event-details">
                  <h3>📅 Event Details</h3>
                  <div class="detail-row">
                    <span class="detail-label">Event Name:</span> ${event.name}
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span> ${new Date(event.date).toLocaleDateString()}
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Location:</span> ${event.location}
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Description:</span> ${event.description}
                  </div>
                </div>

                <p>Volunteers can now see and join your event. You can track engagement and manage your event from your dashboard.</p>

                <center>
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/ngo/track-events" class="button">
                    View Event Dashboard
                  </a>
                </center>

                <p>Thank you for using Ethiopian Volunteer Platform to make a difference!</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Ethiopian Volunteer Platform. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully: ${info.messageId}`);
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send event rejection notification to NGO
   */
  async sendEventRejectionEmail(event, ngoEmail, reason = '') {
    try {
      if (!this.transporter) {
        logger.warn('Email transporter not initialized');
        return { success: false, message: 'Email service not configured' };
      }

      const mailOptions = {
        from: `"Ethiopian Volunteer Platform" <${process.env.EMAIL_USER}>`,
        to: ngoEmail,
        subject: '❌ Event Status Update',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Event Status Update</h1>
              </div>
              <div class="content">
                <p>We regret to inform you that your event submission has not been approved at this time.</p>
                
                <div class="event-details">
                  <h3>Event: ${event.name}</h3>
                  ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                </div>

                <p>You can review and resubmit your event with the necessary changes. If you have questions, please contact our support team.</p>

                <p>Thank you for your understanding.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Ethiopian Volunteer Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Rejection email sent: ${info.messageId}`);
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Error sending rejection email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
