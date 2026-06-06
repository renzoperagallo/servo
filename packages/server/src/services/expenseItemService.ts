import { getPrisma } from '../models/prisma';
import { z } from 'zod';

export const CreateExpenseItemSchema = z.object({
  name: z.string().min(1).max(100),
  monthlyBudget: z.number().positive()
});

export const UpdateExpenseItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  monthlyBudget: z.number().positive().optional()
});

export type CreateExpenseItemInput = z.infer<typeof CreateExpenseItemSchema>;
export type UpdateExpenseItemInput = z.infer<typeof UpdateExpenseItemSchema>;

export async function getExpenseItems(userId: string) {
  const prisma = getPrisma();
  return prisma.expenseItem.findMany({
    where: { userId },
    orderBy: { name: 'asc' }
  });
}

export async function getExpenseItemById(id: string, userId: string) {
  const prisma = getPrisma();
  return prisma.expenseItem.findFirst({
    where: { id, userId }
  });
}

export async function createExpenseItem(userId: string, input: CreateExpenseItemInput) {
  const prisma = getPrisma();
  return prisma.expenseItem.create({
    data: {
      name: input.name,
      monthlyBudget: input.monthlyBudget,
      userId
    }
  });
}

export async function updateExpenseItem(id: string, userId: string, input: UpdateExpenseItemInput) {
  const prisma = getPrisma();
  const item = await prisma.expenseItem.findFirst({
    where: { id, userId }
  });

  if (!item) {
    throw new Error('Expense item not found');
  }

  return prisma.expenseItem.update({
    where: { id },
    data: {
      name: input.name,
      monthlyBudget: input.monthlyBudget
    }
  });
}

export async function deleteExpenseItem(id: string, userId: string) {
  const prisma = getPrisma();
  const item = await prisma.expenseItem.findFirst({
    where: { id, userId }
  });

  if (!item) {
    throw new Error('Expense item not found');
  }

  return prisma.expenseItem.delete({
    where: { id }
  });
}
