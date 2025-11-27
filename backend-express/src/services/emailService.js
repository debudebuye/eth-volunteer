const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Service - Handles all email operations
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
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('Email credentials not configured. Email notifications will be disabled.');
      return;
    }

    // Skip if using placeholder password
    if (process.env.EMAIL_PASS === 'your_app_specific_password_here' || 
        process.env.EMAIL_PASS === 'Eth74613') {
      logger.warn('Email password is not configured. Please set up Gmail App-Specific Password. See TROUBLESHOOTING.md');
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter
    this.transporter.verify((error) => {
      if (error) {
        logger.error('Email transporter verification failed:', error);
        logger.warn('Email notifications will be disabled. See TROUBLESHOOTING.md for setup instructions.');
        this.transporter = null;
      } else {
        logger.info('Email transporter is ready');
      }
    });
  }

  /**
   * Send event approval email
   */
  async sendEventApprovalEmail(event) {
    if (!this.transporter) {
      throw new Error('Email transporter not configured');
    }

    if (!event.creatorEmail || !event.creatorName) {
      throw new Error('Event creator email or name is missing');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: event.creatorEmail,
      subject: 'Your Event Has Been Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Event Approved!</h2>
          <p>Dear ${event.creatorName},</p>
          <p>We're pleased to inform you that your event has been approved and is now live on the platform.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${event.name}</h3>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
          </div>
          
          <p>Volunteers can now view and join your event. You'll receive notifications when volunteers sign up.</p>
          
          <p>Thank you for using Ethiopian Volunteer Platform!</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Approval email sent to ${event.creatorEmail}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send approval email:', error);
      throw error;
    }
  }

  /**
   * Send generic email
   */
  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      throw new Error('Email transporter not configured');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
