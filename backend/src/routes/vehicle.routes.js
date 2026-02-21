import express from 'express';
import { vehicleService } from '../services/vehicleService.js';
import { roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All roles can view vehicles
router.get('/', async (req, res, next) => {
  try {
    const vehicles = await vehicleService.getVehicles(req.query);
    res.json(vehicles);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) { next(error); }
});

// Only MANAGER can create vehicles
router.post('/', roleMiddleware(['MANAGER']), async (req, res, next) => {
  try {
    const vehicle = await vehicleService.addVehicle(req.body, req.user.userId);
    res.status(201).json(vehicle);
  } catch (error) { next(error); }
});

// Only MANAGER can update vehicles
router.put('/:id', roleMiddleware(['MANAGER']), async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    res.json(vehicle);
  } catch (error) { next(error); }
});

// Only MANAGER can delete vehicles
router.delete('/:id', roleMiddleware(['MANAGER']), async (req, res, next) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    res.status(204).end();
  } catch (error) { next(error); }
});

export default router;
