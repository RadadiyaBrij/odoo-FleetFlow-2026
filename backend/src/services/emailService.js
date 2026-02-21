import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
     host: process.env.SMTP_HOST || 'smtp.gmail.com',
     port: parseInt(process.env.SMTP_PORT || '587'),
     secure: false,
     auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
     }
});

const appUrl = process.env.APP_URL || 'http://localhost:5173';
const from = `"FleetFlow" <${process.env.SMTP_USER}>`;

export async function sendVerificationEmail(email, token) {
     const link = `${appUrl}/verify-email?token=${token}`;
     await transporter.sendMail({
          from,
          to: email,
          subject: 'Verify your FleetFlow account',
          html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">Welcome to FleetFlow 🚛</h2>
        <p style="color:#475569;">Click the button below to verify your email address. This link expires in <strong>24 hours</strong>.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#3b82f6;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Verify Email</a>
        <p style="color:#94a3b8;font-size:12px;">If you didn't create a FleetFlow account, you can safely ignore this email.</p>
      </div>
    `
     });
}

export async function sendPasswordResetEmail(email, token) {
     const link = `${appUrl}/reset-password?token=${token}`;
     await transporter.sendMail({
          from,
          to: email,
          subject: 'Reset your FleetFlow password',
          html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">Password Reset</h2>
        <p style="color:#475569;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#3b82f6;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Reset Password</a>
        <p style="color:#94a3b8;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
     });
}
