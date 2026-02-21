import express from 'express';
import { expenseService } from '../services/expenseService.js';
import { roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// MANAGER, DISPATCHER, ANALYST can view (SAFETY_OFFICER: No Access)
router.get('/', roleMiddleware(['MANAGER', 'DISPATCHER', 'ANALYST']), async (req, res, next) => {
  try {
    const expenses = await expenseService.getExpenses(req.query);
    res.json(expenses);
  } catch (error) { next(error); }
});

// Only ANALYST can create expenses
router.post('/', roleMiddleware(['ANALYST']), async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.body);
    res.status(201).json(expense);
  } catch (error) { next(error); }
});

// Only ANALYST can update expenses
router.put('/:id', roleMiddleware(['ANALYST']), async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    res.json(expense);
  } catch (error) { next(error); }
});

router.get('/operational-cost/:vehicleId', roleMiddleware(['MANAGER', 'ANALYST']), async (req, res, next) => {
  try {
    const costs = await expenseService.getOperationalCost(req.params.vehicleId);
    res.json(costs);
  } catch (error) { next(error); }
});

export default router;
