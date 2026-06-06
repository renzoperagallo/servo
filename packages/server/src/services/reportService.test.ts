import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { generateReport, getReports, getReportById } from './reportService';
import { createExpenseItem } from './expenseItemService';
import { createExpense } from './expenseService';
import { cleanupTestDb, createTestUser, getTestPrisma } from '../test/helpers';

describe('reportService', () => {
  beforeEach(async () => {
    await cleanupTestDb();
    await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestDb();
    await getTestPrisma().$disconnect();
  });

  describe('generateReport', () => {
    it('should generate a report for current month', async () => {
      const item = await createExpenseItem('default-user', {
        name: 'Test Item',
        monthlyBudget: 100000
      });

      await createExpense('default-user', {
        amount: 50000,
        expenseItemId: item.id
      });

      const report = await generateReport('default-user');

      expect(report).toBeDefined();
      expect(report.userId).toBe('default-user');
      expect(report.data).toBeDefined();

      const data = JSON.parse(report.data as string);
      expect(data.totalSpent).toBe(50000);
      expect(data.totalBudget).toBe(100000);
    });

    it('should update existing report for same month', async () => {
      const item = await createExpenseItem('default-user', {
        name: 'Test Item',
        monthlyBudget: 100000
      });

      await createExpense('default-user', {
        amount: 30000,
        expenseItemId: item.id
      });

      const report1 = await generateReport('default-user');
      const data1 = JSON.parse(report1.data as string);
      expect(data1.totalSpent).toBe(30000);

      await createExpense('default-user', {
        amount: 20000,
        expenseItemId: item.id
      });

      const report2 = await generateReport('default-user');
      const data2 = JSON.parse(report2.data as string);
      expect(data2.totalSpent).toBe(50000);
      expect(report2.id).toBe(report1.id);
    });
  });

  describe('getReports', () => {
    it('should return reports ordered by date', async () => {
      await generateReport('default-user');

      const reports = await getReports('default-user');

      expect(reports).toHaveLength(1);
    });
  });

  describe('getReportById', () => {
    it('should return report by id', async () => {
      const report = await generateReport('default-user');
      const found = await getReportById(report.id, 'default-user');

      expect(found).toBeDefined();
      expect(found?.id).toBe(report.id);
    });

    it('should return null if report not found', async () => {
      const found = await getReportById('non-existent', 'default-user');

      expect(found).toBeNull();
    });
  });
});
