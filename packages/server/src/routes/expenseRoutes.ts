import { Router, Request, Response } from 'express';
import {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpensesSummary,
  CreateExpenseSchema
} from '../services/expenseService';
import { getUserSettings } from '../services/userService';
import { getCycleDates } from '../utils/cycleUtils';
import { ZodError } from 'zod';

const router = Router();

const DEFAULT_USER_ID = 'default-user';

router.get('/', async (_req: Request, res: Response) => {
  try {
    const user = await getUserSettings(DEFAULT_USER_ID);
    const { startDate, endDate } = getCycleDates(user.cycleStartDay, user.cycleEndDay);
    const expenses = await getExpenses(DEFAULT_USER_ID, startDate, endDate);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get expenses' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const input = CreateExpenseSchema.parse(req.body);
    const expense = await createExpense(DEFAULT_USER_ID, input);
    res.status(201).json(expense);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else if (error instanceof Error && error.message === 'Expense item not found') {
      res.status(404).json({ error: 'Expense item not found' });
    } else {
      res.status(500).json({ error: 'Failed to create expense' });
    }
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deleteExpense(req.params.id, DEFAULT_USER_ID);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'Expense not found') {
      res.status(404).json({ error: 'Expense not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  }
});

router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const user = await getUserSettings(DEFAULT_USER_ID);
    const { startDate, endDate } = getCycleDates(user.cycleStartDay, user.cycleEndDay);
    const summary = await getExpensesSummary(DEFAULT_USER_ID, startDate, endDate);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

export default router;
