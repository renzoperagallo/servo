import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import expenseItemRoutes from './routes/expenseItemRoutes';
import expenseRoutes from './routes/expenseRoutes';
import reportRoutes from './routes/reportRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/user', userRoutes);
app.use('/api/expense-items', expenseItemRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servo server running on port ${PORT}`);
    console.log(`Local:   http://localhost:${PORT}`);
    console.log(`Network: http://0.0.0.0:${PORT}`);
  });
}

export default app;
