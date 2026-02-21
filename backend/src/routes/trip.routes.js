import express from 'express';
import { tripService } from '../services/tripService.js';
import { roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// MANAGER, DISPATCHER, SAFETY_OFFICER can view trips (ANALYST: No Access)
router.get('/', roleMiddleware(['MANAGER', 'DISPATCHER', 'SAFETY_OFFICER']), async (req, res, next) => {
  try {
    const trips = await tripService.getTrips(req.query);
    res.json(trips);
  } catch (error) { next(error); }
});

// Only DISPATCHER can create trips
router.post('/', roleMiddleware(['DISPATCHER']), async (req, res, next) => {
  try {
    const trip = await tripService.createTrip(req.body);
    res.status(201).json(trip);
  } catch (error) { next(error); }
});

// Only DISPATCHER can dispatch trips
router.patch('/:id/dispatch', roleMiddleware(['DISPATCHER']), async (req, res, next) => {
  try {
    const trip = await tripService.dispatchTrip(req.params.id, req.body.startOdometer);
    res.json(trip);
  } catch (error) { next(error); }
});

// Only DISPATCHER can complete trips
router.patch('/:id/complete', roleMiddleware(['DISPATCHER']), async (req, res, next) => {
  try {
    const trip = await tripService.completeTrip(req.params.id, req.body.endOdometer);
    res.json(trip);
  } catch (error) { next(error); }
});

// Only DISPATCHER can cancel trips
router.patch('/:id/cancel', roleMiddleware(['DISPATCHER']), async (req, res, next) => {
  try {
    const trip = await tripService.cancelTrip(req.params.id);
    res.json(trip);
  } catch (error) { next(error); }
});

export default router;
