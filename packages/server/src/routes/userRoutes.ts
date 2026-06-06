import { Router, Request, Response } from 'express';
import { getUserSettings, updateUserSettings, UpdateSettingsSchema } from '../services/userService';
import { ZodError } from 'zod';

const router = Router();

// For now, use a default user ID
const DEFAULT_USER_ID = 'default-user';

router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const user = await getUserSettings(DEFAULT_USER_ID);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

router.put('/settings', async (req: Request, res: Response) => {
  try {
    const input = UpdateSettingsSchema.parse(req.body);
    const user = await updateUserSettings(DEFAULT_USER_ID, input);
    res.json(user);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
});

export default router;
