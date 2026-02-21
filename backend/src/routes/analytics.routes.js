import express from 'express';
import { analyticsService } from '../services/analyticsService.js';

const router = express.Router();

router.get('/kpi', async (req, res, next) => {
  try {
    const kpi = await analyticsService.getFleetKPI();
    res.json(kpi);
  } catch (error) {
    next(error);
  }
});

export default router;
