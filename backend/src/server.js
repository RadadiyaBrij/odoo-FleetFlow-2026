// Backend synchronized with Prisma Schema
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import authRoutes from './routes/auth.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import tripRoutes from './routes/trip.routes.js';
import driverRoutes from './routes/driver.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import errorHandler from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import prisma from './lib/prisma.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      const allowed = process.env.FRONTEND_URL;
      allowed && origin === allowed ? callback(null, true) : callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', authMiddleware, vehicleRoutes);
app.use('/api/trips', authMiddleware, tripRoutes);
app.use('/api/drivers', authMiddleware, driverRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);
app.use('/api/maintenance', authMiddleware, maintenanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), message: 'FleetFlow API is active' });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { app, server, prisma };
