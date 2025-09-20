const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendResetEmail = async (email, firstName, resetToken) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"ManufactureFlow System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Code - ManufactureFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B3F99; margin: 0;">ManufactureFlow</h1>
            <p style="color: #666; margin: 5px 0;">Professional Manufacturing Management System</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #555; font-size: 16px;">Hello ${firstName},</p>
            <p style="color: #555; font-size: 16px;">
              You requested a password reset for your ManufactureFlow account. 
              Use the following code to reset your password:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #8B3F99; color: white; font-size: 32px; font-weight: bold; 
                          padding: 20px; border-radius: 8px; letter-spacing: 8px; 
                          display: inline-block; min-width: 200px;">
                ${resetToken}
              </div>
            </div>

            <p style="color: #555; font-size: 16px;">
              This code will expire in <strong>15 minutes</strong> for security reasons.
            </p>

            <p style="color: #555; font-size: 16px;">
              If you didn't request this password reset, please ignore this email. 
              Your password will remain unchanged.
            </p>
          </div>

          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            <p>This is an automated message from ManufactureFlow. Please do not reply to this email.</p>
            <p>&copy; 2024 ManufactureFlow. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reset email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw new Error('Failed to send reset email');
  }
};

const sendWelcomeEmail = async (email, firstName, username, temporaryPassword) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"ManufactureFlow System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to ManufactureFlow - Your Account is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B3F99; margin: 0;">ManufactureFlow</h1>
            <p style="color: #666; margin: 5px 0;">Professional Manufacturing Management System</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Welcome to ManufactureFlow!</h2>
            <p style="color: #555; font-size: 16px;">Hello ${firstName},</p>
            <p style="color: #555; font-size: 16px;">
              Your ManufactureFlow account has been created successfully. You can now access the system with the following credentials:
            </p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B3F99;">
              <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              ${temporaryPassword ? `<p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${temporaryPassword}</p>` : ''}
            </div>

            <p style="color: #555; font-size: 16px;">
              For security reasons, please change your password after your first login.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="background-color: #8B3F99; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Login to ManufactureFlow
              </a>
            </div>
          </div>

          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            <p>This is an automated message from ManufactureFlow.</p>
            <p>&copy; 2024 ManufactureFlow. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

module.exports = {
  sendResetEmail,
  sendWelcomeEmail
};
