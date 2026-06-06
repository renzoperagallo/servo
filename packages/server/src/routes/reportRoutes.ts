import { Router, Request, Response } from 'express';
import { generateReport, getReports, getReportById } from '../services/reportService';

const router = Router();

const DEFAULT_USER_ID = 'default-user';

router.get('/', async (_req: Request, res: Response) => {
  try {
    const reports = await getReports(DEFAULT_USER_ID);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

router.post('/generate', async (_req: Request, res: Response) => {
  try {
    const report = await generateReport(DEFAULT_USER_ID);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const report = await getReportById(req.params.id, DEFAULT_USER_ID);
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
    } else {
      res.json(report);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get report' });
  }
});

export default router;
