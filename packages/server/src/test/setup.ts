import { beforeAll, afterAll } from 'vitest';
import { getTestPrisma } from './helpers';
import { setPrisma } from '../models/prisma';

beforeAll(() => {
  const testPrisma = getTestPrisma();
  setPrisma(testPrisma);
});

afterAll(async () => {
  const testPrisma = getTestPrisma();
  await testPrisma.$disconnect();
});
