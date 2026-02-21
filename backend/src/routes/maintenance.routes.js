import express from 'express';
import { maintenanceService } from '../services/maintenanceService.js';
import { roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// MANAGER, DISPATCHER, SAFETY_OFFICER can view (ANALYST: No Access)
router.get('/', roleMiddleware(['MANAGER', 'DISPATCHER', 'SAFETY_OFFICER']), async (req, res, next) => {
  try {
    const logs = await maintenanceService.getMaintenanceLogs(req.query);
    res.json(logs);
  } catch (error) { next(error); }
});

// Only MANAGER can create maintenance logs (sets vehicle to In Shop)
router.post('/', roleMiddleware(['MANAGER']), async (req, res, next) => {
  try {
    const log = await maintenanceService.createMaintenanceLog(req.body);
    res.status(201).json(log);
  } catch (error) { next(error); }
});

// Only MANAGER can complete maintenance (sets vehicle back to Available)
router.patch('/:id/complete', roleMiddleware(['MANAGER']), async (req, res, next) => {
  try {
    const { completedDate, technicianName } = req.body;
    const log = await maintenanceService.completeMaintenance(req.params.id, completedDate, technicianName);
    res.json(log);
  } catch (error) { next(error); }
});

export default router;
