import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  getExpenseItems,
  createExpenseItem,
  updateExpenseItem,
  deleteExpenseItem
} from './expenseItemService';
import { cleanupTestDb, createTestUser, getTestPrisma } from '../test/helpers';

describe('expenseItemService', () => {
  beforeEach(async () => {
    await cleanupTestDb();
    await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestDb();
    await getTestPrisma().$disconnect();
  });

  describe('createExpenseItem', () => {
    it('should create an expense item', async () => {
      const item = await createExpenseItem('default-user', {
        name: 'Supermercado',
        monthlyBudget: 100000
      });

      expect(item).toBeDefined();
      expect(item.name).toBe('Supermercado');
      expect(item.monthlyBudget).toBe(100000);
      expect(item.userId).toBe('default-user');
    });
  });

  describe('getExpenseItems', () => {
    it('should return all expense items for user', async () => {
      await createExpenseItem('default-user', { name: 'Item 1', monthlyBudget: 10000 });
      await createExpenseItem('default-user', { name: 'Item 2', monthlyBudget: 20000 });

      const items = await getExpenseItems('default-user');

      expect(items).toHaveLength(2);
      expect(items[0].name).toBe('Item 1');
      expect(items[1].name).toBe('Item 2');
    });

    it('should return items ordered by name', async () => {
      await createExpenseItem('default-user', { name: 'Zebra', monthlyBudget: 10000 });
      await createExpenseItem('default-user', { name: 'Alpha', monthlyBudget: 20000 });

      const items = await getExpenseItems('default-user');

      expect(items[0].name).toBe('Alpha');
      expect(items[1].name).toBe('Zebra');
    });
  });

  describe('updateExpenseItem', () => {
    it('should update an expense item', async () => {
      const item = await createExpenseItem('default-user', {
        name: 'Old Name',
        monthlyBudget: 10000
      });

      const updated = await updateExpenseItem(item.id, 'default-user', {
        name: 'New Name',
        monthlyBudget: 20000
      });

      expect(updated.name).toBe('New Name');
      expect(updated.monthlyBudget).toBe(20000);
    });

    it('should throw error if item not found', async () => {
      await expect(
        updateExpenseItem('non-existent', 'default-user', { name: 'Test' })
      ).rejects.toThrow('Expense item not found');
    });
  });

  describe('deleteExpenseItem', () => {
    it('should delete an expense item', async () => {
      const item = await createExpenseItem('default-user', {
        name: 'To Delete',
        monthlyBudget: 10000
      });

      await deleteExpenseItem(item.id, 'default-user');

      const items = await getExpenseItems('default-user');
      expect(items).toHaveLength(0);
    });

    it('should throw error if item not found', async () => {
      await expect(
        deleteExpenseItem('non-existent', 'default-user')
      ).rejects.toThrow('Expense item not found');
    });
  });
});
