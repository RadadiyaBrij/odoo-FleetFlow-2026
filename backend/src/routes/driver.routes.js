import express from 'express';
import { driverService } from '../services/driverService.js';
import { roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All roles can view drivers
router.get('/', async (req, res, next) => {
  try {
    const drivers = await driverService.getDrivers(req.query);
    res.json(drivers);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (error) { next(error); }
});

// MANAGER can add drivers
router.post('/', roleMiddleware(['MANAGER']), async (req, res, next) => {
  try {
    const driver = await driverService.addDriver(req.body);
    res.status(201).json(driver);
  } catch (error) { next(error); }
});

// MANAGER and SAFETY_OFFICER can update drivers
router.put('/:id', roleMiddleware(['MANAGER', 'SAFETY_OFFICER']), async (req, res, next) => {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body);
    res.json(driver);
  } catch (error) { next(error); }
});

// SAFETY_OFFICER & MANAGER can update duty status
router.patch('/:id/status', roleMiddleware(['SAFETY_OFFICER', 'MANAGER']), async (req, res, next) => {
  try {
    const driver = await driverService.updateDriverStatus(req.params.id, req.body.status);
    res.json(driver);
  } catch (error) { next(error); }
});

// Only MANAGER can delete drivers
router.delete('/:id', roleMiddleware(['MANAGER']), async (req, res, next) => {
  try {
    await driverService.deleteDriver(req.params.id);
    res.status(204).end();
  } catch (error) { next(error); }
});

export default router;
