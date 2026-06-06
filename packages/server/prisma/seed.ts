import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a default user
  const user = await prisma.user.create({
    data: {
      cycleStartDay: 1,
      cycleEndDay: 31
    }
  });

  console.log('Created user:', user.id);

  // Create some expense items
  const items = await Promise.all([
    prisma.expenseItem.create({
      data: {
        name: 'Supermercado',
        monthlyBudget: 100000,
        userId: user.id
      }
    }),
    prisma.expenseItem.create({
      data: {
        name: 'Restaurantes',
        monthlyBudget: 50000,
        userId: user.id
      }
    }),
    prisma.expenseItem.create({
      data: {
        name: 'Transporte',
        monthlyBudget: 30000,
        userId: user.id
      }
    })
  ]);

  console.log('Created expense items:', items.map(i => i.name));

  // Create some sample expenses
  const now = new Date();
  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        amount: 25000,
        description: 'Compra semanal',
        date: new Date(now.getFullYear(), now.getMonth(), 5),
        expenseItemId: items[0].id,
        userId: user.id
      }
    }),
    prisma.expense.create({
      data: {
        amount: 15000,
        description: 'Cena con amigos',
        date: new Date(now.getFullYear(), now.getMonth(), 10),
        expenseItemId: items[1].id,
        userId: user.id
      }
    }),
    prisma.expense.create({
      data: {
        amount: 8000,
        description: 'Metro bus',
        date: new Date(now.getFullYear(), now.getMonth(), 15),
        expenseItemId: items[2].id,
        userId: user.id
      }
    })
  ]);

  console.log('Created expenses:', expenses.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
