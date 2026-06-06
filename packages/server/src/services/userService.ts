import { getPrisma } from '../models/prisma';
import { z } from 'zod';

export const UpdateSettingsSchema = z.object({
  cycleStartDay: z.number().min(1).max(28).optional(),
  cycleEndDay: z.number().min(1).max(31).optional()
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

export async function getUserSettings(userId: string) {
  const prisma = getPrisma();
  let user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    user = await prisma.user.create({
      data: { id: userId }
    });
  }

  return user;
}

export async function updateUserSettings(userId: string, input: UpdateSettingsInput) {
  const prisma = getPrisma();
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      cycleStartDay: input.cycleStartDay,
      cycleEndDay: input.cycleEndDay
    },
    create: {
      id: userId,
      cycleStartDay: input.cycleStartDay ?? 1,
      cycleEndDay: input.cycleEndDay ?? 31
    }
  });

  return user;
}
