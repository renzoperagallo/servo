import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export function getTestPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./test.db'
        }
      }
    });
  }
  return prisma;
}

export async function cleanupTestDb() {
  const db = getTestPrisma();
  await db.expense.deleteMany();
  await db.expenseItem.deleteMany();
  await db.report.deleteMany();
  await db.user.deleteMany();
}

export async function createTestUser(data?: { id?: string; cycleStartDay?: number; cycleEndDay?: number }) {
  const db = getTestPrisma();
  return db.user.upsert({
    where: { id: data?.id ?? 'default-user' },
    update: {
      cycleStartDay: data?.cycleStartDay ?? 1,
      cycleEndDay: data?.cycleEndDay ?? 31
    },
    create: {
      id: data?.id ?? 'default-user',
      cycleStartDay: data?.cycleStartDay ?? 1,
      cycleEndDay: data?.cycleEndDay ?? 31
    }
  });
}
