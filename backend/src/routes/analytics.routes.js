import express from 'express';
import { analyticsService } from '../services/analyticsService.js';
import { roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// General fleet KPI — all roles
router.get('/kpi', async (req, res, next) => {
  try {
    const kpi = await analyticsService.getFleetKPI();
    res.json(kpi);
  } catch (error) { next(error); }
});

// Operational KPIs — Dispatcher + Manager
router.get('/operational', roleMiddleware(['MANAGER', 'DISPATCHER']), async (req, res, next) => {
  try {
    const kpi = await analyticsService.getOperationalKPI();
    res.json(kpi);
  } catch (error) { next(error); }
});

// Safety KPIs — Safety Officer + Manager
router.get('/safety', roleMiddleware(['MANAGER', 'SAFETY_OFFICER']), async (req, res, next) => {
  try {
    const kpi = await analyticsService.getSafetyKPI();
    res.json(kpi);
  } catch (error) { next(error); }
});

// Financial KPIs — Financial Analyst + Manager
router.get('/financial', roleMiddleware(['MANAGER', 'ANALYST']), async (req, res, next) => {
  try {
    const kpi = await analyticsService.getFinancialKPI();
    res.json(kpi);
  } catch (error) { next(error); }
});

export default router;
