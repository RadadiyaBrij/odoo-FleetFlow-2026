import express from 'express';
import { maintenanceService } from '../services/maintenanceService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const logs = await maintenanceService.getMaintenanceLogs(req.query);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const log = await maintenanceService.createMaintenanceLog(req.body);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/complete', async (req, res, next) => {
  try {
    const { completedDate, technicianName } = req.body;
    const log = await maintenanceService.completeMaintenance(req.params.id, completedDate, technicianName);
    res.json(log);
  } catch (error) {
    next(error);
  }
});

export default router;
