import { getPrisma } from '../models/prisma';
import { z } from 'zod';

export const CreateExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().max(255).optional(),
  date: z.string().datetime().optional(),
  expenseItemId: z.string().min(1)
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

export async function getExpenses(userId: string, startDate: Date, endDate: Date) {
  const prisma = getPrisma();
  return prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      expenseItem: true
    },
    orderBy: { date: 'desc' }
  });
}

export async function createExpense(userId: string, input: CreateExpenseInput) {
  const prisma = getPrisma();
  const item = await prisma.expenseItem.findFirst({
    where: { id: input.expenseItemId, userId }
  });

  if (!item) {
    throw new Error('Expense item not found');
  }

  return prisma.expense.create({
    data: {
      amount: input.amount,
      description: input.description,
      date: input.date ? new Date(input.date) : new Date(),
      expenseItemId: input.expenseItemId,
      userId
    },
    include: {
      expenseItem: true
    }
  });
}

export async function deleteExpense(id: string, userId: string) {
  const prisma = getPrisma();
  const expense = await prisma.expense.findFirst({
    where: { id, userId }
  });

  if (!expense) {
    throw new Error('Expense not found');
  }

  return prisma.expense.delete({
    where: { id }
  });
}

export async function getExpensesSummary(userId: string, startDate: Date, endDate: Date) {
  const prisma = getPrisma();
  const items = await prisma.expenseItem.findMany({
    where: { userId },
    include: {
      expenses: {
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    }
  });

  let totalBudget = 0;
  let totalSpent = 0;

  const itemSummaries = items.map(item => {
    const spent = item.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = item.monthlyBudget - spent;
    const percentage = item.monthlyBudget > 0 ? (spent / item.monthlyBudget) * 100 : 0;

    totalBudget += item.monthlyBudget;
    totalSpent += spent;

    return {
      id: item.id,
      name: item.name,
      monthlyBudget: item.monthlyBudget,
      spent,
      remaining,
      percentage: Math.round(percentage * 100) / 100
    };
  });

  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return {
    items: itemSummaries,
    totalBudget,
    totalSpent,
    totalRemaining: totalBudget - totalSpent,
    totalPercentage: Math.round(totalPercentage * 100) / 100
  };
}
