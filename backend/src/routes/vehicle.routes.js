import express from 'express';
import { vehicleService } from '../services/vehicleService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const vehicles = await vehicleService.getVehicles(req.query);
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const vehicle = await vehicleService.addVehicle(req.body, req.user.userId);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
