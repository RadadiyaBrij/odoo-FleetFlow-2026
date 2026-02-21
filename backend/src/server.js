import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import authRoutes from './routes/auth.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import tripRoutes from './routes/trip.routes.js';
import driverRoutes from './routes/driver.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import errorHandler from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.middleware.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const prisma = new PrismaClient();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', authMiddleware, vehicleRoutes);
app.use('/api/trips', authMiddleware, tripRoutes);
app.use('/api/drivers', authMiddleware, driverRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

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
