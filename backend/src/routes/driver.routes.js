import express from 'express';
import { driverService } from '../services/driverService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const drivers = await driverService.getDrivers(req.query);
    res.json(drivers);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const driver = await driverService.addDriver(req.body);
    res.status(201).json(driver);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body);
    res.json(driver);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await driverService.deleteDriver(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
