import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { getUserSettings, updateUserSettings } from './userService';
import { cleanupTestDb, createTestUser, getTestPrisma } from '../test/helpers';

describe('userService', () => {
  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await cleanupTestDb();
    await getTestPrisma().$disconnect();
  });

  describe('getUserSettings', () => {
    it('should create a new user if not exists', async () => {
      const user = await getUserSettings('test-user-1');

      expect(user).toBeDefined();
      expect(user.id).toBe('test-user-1');
      expect(user.cycleStartDay).toBe(1);
      expect(user.cycleEndDay).toBe(31);
    });

    it('should return existing user', async () => {
      await createTestUser({ cycleStartDay: 5, cycleEndDay: 25 });
      const user = await getUserSettings('default-user');

      expect(user).toBeDefined();
      expect(user.cycleStartDay).toBe(5);
      expect(user.cycleEndDay).toBe(25);
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings', async () => {
      await createTestUser();
      const user = await updateUserSettings('default-user', {
        cycleStartDay: 10,
        cycleEndDay: 20
      });

      expect(user.cycleStartDay).toBe(10);
      expect(user.cycleEndDay).toBe(20);
    });

    it('should update only cycleStartDay', async () => {
      await createTestUser();
      const user = await updateUserSettings('default-user', {
        cycleStartDay: 15
      });

      expect(user.cycleStartDay).toBe(15);
      expect(user.cycleEndDay).toBe(31);
    });
  });
});
