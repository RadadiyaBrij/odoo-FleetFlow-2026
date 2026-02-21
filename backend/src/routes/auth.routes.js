import express from 'express';
import { authService } from '../services/authService.js';

const router = express.Router();

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: { message: 'Username and password are required', status: 400 } });
    }
    const result = await authService.login(username, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, firstName } = req.body;
    if (!username || !email || !password || !firstName) {
      return res.status(400).json({ error: { message: 'Username, email, password, and first name are required', status: 400 } });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: { message: 'Invalid email address', status: 400 } });
    }
    const result = await authService.register(req.body);
    res.status(201).json({ ...result, message: 'Account created! Please check your email to verify your account before logging in.' });
  } catch (error) {
    next(error);
  }
});

// Verify email
router.get('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: { message: 'Token is required', status: 400 } });
    }
    const result = await authService.verifyEmail(token);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Forgot password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: { message: 'Email is required', status: 400 } });
    }
    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: { message: 'Token and new password are required', status: 400 } });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: { message: 'Password must be at least 6 characters', status: 400 } });
    }
    const result = await authService.resetPassword(token, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
