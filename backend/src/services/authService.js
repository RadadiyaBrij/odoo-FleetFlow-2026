import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService.js';

// Helper to create an error with an HTTP status code
function createError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Hash a raw token for safe DB storage
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const authService = {
  // Register new user
  register: async (userData) => {
    const { username, email, password, firstName, lastName, role } = userData;

    try {
      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] }
      });

      if (existingUser) {
        throw createError('User already exists', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate email verification token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          role: role || 'DISPATCHER',
          isEmailVerified: false,
          emailVerifyToken: tokenHash,
          emailVerifyExpiry: tokenExpiry
        }
      });

      // Send verification email (non-blocking — don't fail registration if email fails)
      sendVerificationEmail(email, rawToken).catch(err =>
        console.error('Failed to send verification email:', err.message)
      );

      return { id: user.id, email: user.email, role: user.role };
    } catch (error) {
      if (error.status) throw error;
      console.error('Register error:', error.message);
      throw createError('Registration failed. Please try again.', 500);
    }
  },

  // Login user
  login: async (username, password) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      });

      if (!user) {
        throw createError('Invalid credentials', 401);
      }

      // Block login if email not verified
      if (!user.isEmailVerified) {
        throw createError('Please verify your email before logging in. Check your inbox for the verification link.', 403);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw createError('Invalid credentials', 401);
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        { expiresIn: '7d' }
      );

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
    } catch (error) {
      if (error.status) throw error;
      console.error('Login error:', error.message);
      throw createError('Login failed. Please try again.', 500);
    }
  },

  // Verify email via token
  verifyEmail: async (rawToken) => {
    try {
      const tokenHash = hashToken(rawToken);

      const user = await prisma.user.findFirst({
        where: {
          emailVerifyToken: tokenHash,
          emailVerifyExpiry: { gt: new Date() }
        }
      });

      if (!user) {
        throw createError('Invalid or expired verification link.', 400);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerifyToken: null,
          emailVerifyExpiry: null
        }
      });

      return { message: 'Email verified successfully. You can now log in.' };
    } catch (error) {
      if (error.status) throw error;
      console.error('Verify email error:', error.message);
      throw createError('Verification failed. Please try again.', 500);
    }
  },

  // Forgot password — send reset link
  forgotPassword: async (email) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });

      // Always return generic message to prevent email enumeration
      if (!user) {
        return { message: 'If an account with that email exists, a reset link has been sent.' };
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: tokenHash,
          resetPasswordExpiry: tokenExpiry
        }
      });

      sendPasswordResetEmail(email, rawToken).catch(err =>
        console.error('Failed to send password reset email:', err.message)
      );

      return { message: 'If an account with that email exists, a reset link has been sent.' };
    } catch (error) {
      if (error.status) throw error;
      console.error('Forgot password error:', error.message);
      throw createError('Could not process request. Please try again.', 500);
    }
  },

  // Reset password via token
  resetPassword: async (rawToken, newPassword) => {
    try {
      const tokenHash = hashToken(rawToken);

      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: tokenHash,
          resetPasswordExpiry: { gt: new Date() }
        }
      });

      if (!user) {
        throw createError('Invalid or expired reset link.', 400);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpiry: null
        }
      });

      return { message: 'Password reset successfully. You can now log in.' };
    } catch (error) {
      if (error.status) throw error;
      console.error('Reset password error:', error.message);
      throw createError('Password reset failed. Please try again.', 500);
    }
  }
};
