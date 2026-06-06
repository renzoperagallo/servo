import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createExpense, getExpenses, deleteExpense, getExpensesSummary } from './expenseService';
import { createExpenseItem } from './expenseItemService';
import { cleanupTestDb, createTestUser, getTestPrisma } from '../test/helpers';

describe('expenseService', () => {
  let testItemId: string;

  beforeEach(async () => {
    await cleanupTestDb();
    await createTestUser();
    const item = await createExpenseItem('default-user', {
      name: 'Test Item',
      monthlyBudget: 100000
    });
    testItemId = item.id;
  });

  afterAll(async () => {
    await cleanupTestDb();
    await getTestPrisma().$disconnect();
  });

  describe('createExpense', () => {
    it('should create an expense', async () => {
      const expense = await createExpense('default-user', {
        amount: 25000,
        description: 'Test expense',
        expenseItemId: testItemId
      });

      expect(expense).toBeDefined();
      expect(expense.amount).toBe(25000);
      expect(expense.description).toBe('Test expense');
      expect(expense.expenseItemId).toBe(testItemId);
      expect(expense.userId).toBe('default-user');
    });

    it('should throw error if expense item not found', async () => {
      await expect(
        createExpense('default-user', {
          amount: 1000,
          expenseItemId: 'non-existent'
        })
      ).rejects.toThrow('Expense item not found');
    });
  });

  describe('getExpenses', () => {
    it('should return expenses within date range', async () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await createExpense('default-user', {
        amount: 10000,
        expenseItemId: testItemId
      });

      const expenses = await getExpenses('default-user', startDate, endDate);

      expect(expenses).toHaveLength(1);
      expect(expenses[0].amount).toBe(10000);
    });

    it('should not return expenses outside date range', async () => {
      const pastDate = new Date(2020, 0, 1);
      const futureDate = new Date(2020, 0, 31);

      await createExpense('default-user', {
        amount: 10000,
        expenseItemId: testItemId
      });

      const expenses = await getExpenses('default-user', pastDate, futureDate);

      expect(expenses).toHaveLength(0);
    });
  });

  describe('deleteExpense', () => {
    it('should delete an expense', async () => {
      const expense = await createExpense('default-user', {
        amount: 10000,
        expenseItemId: testItemId
      });

      await deleteExpense(expense.id, 'default-user');

      const now = new Date();
      const expenses = await getExpenses(
        'default-user',
        new Date(now.getFullYear(), now.getMonth(), 1),
        new Date(now.getFullYear(), now.getMonth() + 1, 0)
      );

      expect(expenses).toHaveLength(0);
    });

    it('should throw error if expense not found', async () => {
      await expect(
        deleteExpense('non-existent', 'default-user')
      ).rejects.toThrow('Expense not found');
    });
  });

  describe('getExpensesSummary', () => {
    it('should calculate summary correctly', async () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await createExpense('default-user', {
        amount: 30000,
        expenseItemId: testItemId
      });
      await createExpense('default-user', {
        amount: 20000,
        expenseItemId: testItemId
      });

      const summary = await getExpensesSummary('default-user', startDate, endDate);

      expect(summary.items).toHaveLength(1);
      expect(summary.items[0].spent).toBe(50000);
      expect(summary.items[0].remaining).toBe(50000);
      expect(summary.items[0].percentage).toBe(50);
      expect(summary.totalBudget).toBe(100000);
      expect(summary.totalSpent).toBe(50000);
      expect(summary.totalPercentage).toBe(50);
    });

    it('should handle negative remaining balance', async () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await createExpense('default-user', {
        amount: 120000,
        expenseItemId: testItemId
      });

      const summary = await getExpensesSummary('default-user', startDate, endDate);

      expect(summary.items[0].remaining).toBe(-20000);
      expect(summary.items[0].percentage).toBe(120);
    });
  });
});
