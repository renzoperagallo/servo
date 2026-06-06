import { Router, Request, Response } from 'express';
import {
  getExpenseItems,
  createExpenseItem,
  updateExpenseItem,
  deleteExpenseItem,
  CreateExpenseItemSchema,
  UpdateExpenseItemSchema
} from '../services/expenseItemService';
import { ZodError } from 'zod';

const router = Router();

const DEFAULT_USER_ID = 'default-user';

router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await getExpenseItems(DEFAULT_USER_ID);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get expense items' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const input = CreateExpenseItemSchema.parse(req.body);
    const item = await createExpenseItem(DEFAULT_USER_ID, input);
    res.status(201).json(item);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create expense item' });
    }
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const input = UpdateExpenseItemSchema.parse(req.body);
    const item = await updateExpenseItem(req.params.id, DEFAULT_USER_ID, input);
    res.json(item);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else if (error instanceof Error && error.message === 'Expense item not found') {
      res.status(404).json({ error: 'Expense item not found' });
    } else {
      res.status(500).json({ error: 'Failed to update expense item' });
    }
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deleteExpenseItem(req.params.id, DEFAULT_USER_ID);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'Expense item not found') {
      res.status(404).json({ error: 'Expense item not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete expense item' });
    }
  }
});

export default router;
