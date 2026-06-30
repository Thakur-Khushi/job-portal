const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
// For testing: use ethereal email service
// For production: use SendGrid, Gmail, or another email service
const createTransporter = async () => {
  // Development: prefer Ethereal. If ETHEREAL creds are present, use them,
  // otherwise create a temporary test account so devs can view the message preview URL.
  if (process.env.NODE_ENV !== 'production') {
    if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS) {
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.ETHEREAL_USER,
          pass: process.env.ETHEREAL_PASS,
        },
      });
    }

    // Create a test account for development if none provided
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Production: Gmail or equivalent SMTP provider
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
};

/**
 * Send email verification link to user's email
 * @param {string} email - User's email address
 * @param {string} verificationToken - Verification token
 * @param {string} baseUrl - Base URL of the application (e.g., http://localhost:3000)
 * @returns {Promise}
 */
const sendVerificationEmail = async (email, verificationToken, baseUrl) => {
  try {
    const transporter = await createTransporter();

    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.GMAIL_USER || 'jobportal@example.com',
      to: email,
      subject: 'Email Verification - Job Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Welcome to Job Portal! 🎉</h2>
          
          <p>Hi there,</p>
          
          <p>Thank you for creating an account with us. To complete your registration and start using Job Portal, please verify your email address.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <p style="color: #007bff; word-break: break-all; font-size: 12px;">${verificationLink}</p>
          
          <p style="color: #666;">This link will expire in 24 hours.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px;">
            If you didn't create this account, please ignore this email.
          </p>
          
          <p style="color: #999; font-size: 12px;">
            © 2026 Job Portal. All rights reserved.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', result.messageId);
    // If using a test account (Ethereal), log the preview URL so developers can open the email
    const preview = nodemailer.getTestMessageUrl(result);
    if (preview) console.log('Preview URL:', preview);
    return result;
  } catch (err) {
    console.error('Error sending verification email:', err);
    throw err;
  }
};

/**
 * Send password reset email to user
 * @param {string} email - User's email address
 * @param {string} resetToken - Password reset token
 * @param {string} baseUrl - Base URL of the application
 * @returns {Promise}
 */
const sendPasswordResetEmail = async (email, resetToken, baseUrl) => {
  try {
    const transporter = await createTransporter();

    const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: process.env.GMAIL_USER || 'jobportal@example.com',
      to: email,
      subject: 'Password Reset - Job Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          
          <p>Hi,</p>
          
          <p>We received a request to reset the password for your Job Portal account. Click the button below to create a new password.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <p style="color: #007bff; word-break: break-all; font-size: 12px;">${resetLink}</p>
          
          <p style="color: #666;">This link will expire in 1 hour.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px;">
            If you didn't request this, please ignore this email and your password will remain unchanged.
          </p>
          
          <p style="color: #999; font-size: 12px;">
            © 2026 Job Portal. All rights reserved.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    const preview = nodemailer.getTestMessageUrl(result);
    if (preview) console.log('Preview URL:', preview);
    return result;
  } catch (err) {
    console.error('Error sending password reset email:', err);
    throw err;
  }
};

/**
 * Send welcome email to verified user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @returns {Promise}
 */
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.GMAIL_USER || 'jobportal@example.com',
      to: email,
      subject: 'Welcome to Job Portal!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Welcome to Job Portal, ${name}! 🚀</h2>
          
          <p>Hi ${name},</p>
          
          <p>Your email has been verified successfully! You can now access all features of Job Portal.</p>
          
          <h3 style="color: #333; margin-top: 20px;">Get Started:</h3>
          <ul style="color: #666;">
            <li>Complete your profile to attract recruiters</li>
            <li>Browse and apply for job opportunities</li>
            <li>Connect with potential employers</li>
            <li>Track your applications in real-time</li>
          </ul>
          
          <p style="margin-top: 20px; color: #666;">
            If you have any questions, please don't hesitate to contact our support team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px;">
            © 2026 Job Portal. All rights reserved.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', result.messageId);
    const preview = nodemailer.getTestMessageUrl(result);
    if (preview) console.log('Preview URL:', preview);
    return result;
  } catch (err) {
    console.error('Error sending welcome email:', err);
    throw err;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
