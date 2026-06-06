import { getPrisma } from '../models/prisma';
import { getExpensesSummary } from './expenseService';
import { getCycleDates, getCurrentCycleMonth } from '../utils/cycleUtils';

export async function generateReport(userId: string, date: Date = new Date()) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const { startDate, endDate } = getCycleDates(user.cycleStartDay, user.cycleEndDay, date);
  const { month, year } = getCurrentCycleMonth(user.cycleStartDay, date);

  const summary = await getExpensesSummary(userId, startDate, endDate);

  const report = await prisma.report.upsert({
    where: {
      month_year_userId: {
        month,
        year,
        userId
      }
    },
    update: {
      data: JSON.stringify(summary)
    },
    create: {
      month,
      year,
      data: JSON.stringify(summary),
      userId
    }
  });

  return report;
}

export async function getReports(userId: string) {
  const prisma = getPrisma();
  return prisma.report.findMany({
    where: { userId },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' }
    ]
  });
}

export async function getReportById(id: string, userId: string) {
  const prisma = getPrisma();
  return prisma.report.findFirst({
    where: { id, userId }
  });
}
