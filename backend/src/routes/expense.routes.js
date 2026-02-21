import express from 'express';
import { expenseService } from '../services/expenseService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const expenses = await expenseService.getExpenses(req.query);
    res.json(expenses);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.body);
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
});

router.get('/operational-cost/:vehicleId', async (req, res, next) => {
  try {
    const costs = await expenseService.getOperationalCost(req.params.vehicleId);
    res.json(costs);
  } catch (error) {
    next(error);
  }
});

export default router;
