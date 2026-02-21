import express from 'express';
import { tripService } from '../services/tripService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const trips = await tripService.getTrips(req.query);
    res.json(trips);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const trip = await tripService.createTrip(req.body);
    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/dispatch', async (req, res, next) => {
  try {
    const { startOdometer } = req.body;
    const trip = await tripService.dispatchTrip(req.params.id, startOdometer);
    res.json(trip);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/complete', async (req, res, next) => {
  try {
    const { endOdometer } = req.body;
    const trip = await tripService.completeTrip(req.params.id, endOdometer);
    res.json(trip);
  } catch (error) {
    next(error);
  }
});

export default router;
