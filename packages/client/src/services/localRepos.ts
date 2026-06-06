import { getDb, DEFAULT_USER_ID, generateId } from './db';

export interface User {
  id: string;
  cycleStartDay: number;
  cycleEndDay: number;
  createdAt: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  monthlyBudget: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  expenseItemId: string;
  userId: string;
  createdAt: string;
  expenseItemName?: string;
}

export interface ItemSummary {
  id: string;
  name: string;
  monthlyBudget: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface Summary {
  items: ItemSummary[];
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  totalPercentage: number;
}

export interface Report {
  id: string;
  month: number;
  year: number;
  data: string;
  userId: string;
  createdAt: string;
}

export const localUserRepo = {
  async getSettings(): Promise<User> {
    const result = await getDb().query(
      'SELECT * FROM User WHERE id = ?',
      [DEFAULT_USER_ID]
    );
    return result.values![0] as User;
  },

  async updateSettings(data: { cycleStartDay?: number; cycleEndDay?: number }): Promise<User> {
    const current = await this.getSettings();
    await getDb().run(
      'UPDATE User SET cycleStartDay = ?, cycleEndDay = ? WHERE id = ?',
      [
        data.cycleStartDay ?? current.cycleStartDay,
        data.cycleEndDay ?? current.cycleEndDay,
        DEFAULT_USER_ID
      ]
    );
    return this.getSettings();
  }
};

export const localExpenseItemRepo = {
  async getAll(): Promise<ExpenseItem[]> {
    const result = await getDb().query(
      'SELECT * FROM ExpenseItem WHERE userId = ? ORDER BY name ASC',
      [DEFAULT_USER_ID]
    );
    return (result.values || []) as ExpenseItem[];
  },

  async create(data: { name: string; monthlyBudget: number }): Promise<ExpenseItem> {
    const id = generateId();
    await getDb().run(
      'INSERT INTO ExpenseItem (id, name, monthlyBudget, userId) VALUES (?, ?, ?, ?)',
      [id, data.name, data.monthlyBudget, DEFAULT_USER_ID]
    );
    const result = await getDb().query('SELECT * FROM ExpenseItem WHERE id = ?', [id]);
    return result.values![0] as ExpenseItem;
  },

  async update(id: string, data: { name?: string; monthlyBudget?: number }): Promise<ExpenseItem> {
    const current = await getDb().query('SELECT * FROM ExpenseItem WHERE id = ? AND userId = ?', [id, DEFAULT_USER_ID]);
    if (!current.values || current.values.length === 0) {
      throw new Error('Expense item not found');
    }
    const item = current.values[0] as ExpenseItem;
    await getDb().run(
      'UPDATE ExpenseItem SET name = ?, monthlyBudget = ?, updatedAt = datetime(\'now\') WHERE id = ?',
      [data.name ?? item.name, data.monthlyBudget ?? item.monthlyBudget, id]
    );
    const result = await getDb().query('SELECT * FROM ExpenseItem WHERE id = ?', [id]);
    return result.values![0] as ExpenseItem;
  },

  async delete(id: string): Promise<void> {
    const current = await getDb().query('SELECT * FROM ExpenseItem WHERE id = ? AND userId = ?', [id, DEFAULT_USER_ID]);
    if (!current.values || current.values.length === 0) {
      throw new Error('Expense item not found');
    }
    await getDb().run('DELETE FROM Expense WHERE expenseItemId = ?', [id]);
    await getDb().run('DELETE FROM ExpenseItem WHERE id = ?', [id]);
  }
};

export const localExpenseRepo = {
  async getAll(startDate: Date, endDate: Date): Promise<Expense[]> {
    const result = await getDb().query(
      `SELECT e.*, ei.name as expenseItemName
       FROM Expense e
       JOIN ExpenseItem ei ON e.expenseItemId = ei.id
       WHERE e.userId = ? AND e.date >= ? AND e.date <= ?
       ORDER BY e.date DESC`,
      [DEFAULT_USER_ID, startDate.toISOString(), endDate.toISOString()]
    );
    return (result.values || []) as Expense[];
  },

  async create(data: { amount: number; description?: string; date?: string; expenseItemId: string }): Promise<Expense> {
    const itemCheck = await getDb().query(
      'SELECT * FROM ExpenseItem WHERE id = ? AND userId = ?',
      [data.expenseItemId, DEFAULT_USER_ID]
    );
    if (!itemCheck.values || itemCheck.values.length === 0) {
      throw new Error('Expense item not found');
    }

    const id = generateId();
    const date = data.date || new Date().toISOString();
    await getDb().run(
      'INSERT INTO Expense (id, amount, description, date, expenseItemId, userId) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.amount, data.description || null, date, data.expenseItemId, DEFAULT_USER_ID]
    );

    const result = await getDb().query(
      `SELECT e.*, ei.name as expenseItemName
       FROM Expense e
       JOIN ExpenseItem ei ON e.expenseItemId = ei.id
       WHERE e.id = ?`,
      [id]
    );
    return result.values![0] as Expense;
  },

  async delete(id: string): Promise<void> {
    const current = await getDb().query('SELECT * FROM Expense WHERE id = ? AND userId = ?', [id, DEFAULT_USER_ID]);
    if (!current.values || current.values.length === 0) {
      throw new Error('Expense not found');
    }
    await getDb().run('DELETE FROM Expense WHERE id = ?', [id]);
  },

  async getSummary(startDate: Date, endDate: Date): Promise<Summary> {
    const items = await localExpenseItemRepo.getAll();

    let totalBudget = 0;
    let totalSpent = 0;

    const expensesResult = await getDb().query(
      `SELECT expenseItemId, SUM(amount) as total
       FROM Expense
       WHERE userId = ? AND date >= ? AND date <= ?
       GROUP BY expenseItemId`,
      [DEFAULT_USER_ID, startDate.toISOString(), endDate.toISOString()]
    );

    const spentMap: Record<string, number> = {};
    for (const row of (expensesResult.values || [])) {
      spentMap[row.expenseItemId as string] = row.total as number;
    }

    const itemSummaries: ItemSummary[] = items.map(item => {
      const spent = spentMap[item.id] || 0;
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
};

export const localReportRepo = {
  async getAll(): Promise<Report[]> {
    const result = await getDb().query(
      'SELECT * FROM Report WHERE userId = ? ORDER BY year DESC, month DESC',
      [DEFAULT_USER_ID]
    );
    return (result.values || []) as Report[];
  },

  async generate(month: number, year: number, summary: Summary): Promise<Report> {
    const id = generateId();
    const data = JSON.stringify(summary);

    const existing = await getDb().query(
      'SELECT * FROM Report WHERE month = ? AND year = ? AND userId = ?',
      [month, year, DEFAULT_USER_ID]
    );

    if (existing.values && existing.values.length > 0) {
      await getDb().run(
        'UPDATE Report SET data = ? WHERE month = ? AND year = ? AND userId = ?',
        [data, month, year, DEFAULT_USER_ID]
      );
      const result = await getDb().query(
        'SELECT * FROM Report WHERE month = ? AND year = ? AND userId = ?',
        [month, year, DEFAULT_USER_ID]
      );
      return result.values![0] as Report;
    }

    await getDb().run(
      'INSERT INTO Report (id, month, year, data, userId) VALUES (?, ?, ?, ?, ?)',
      [id, month, year, data, DEFAULT_USER_ID]
    );
    const result = await getDb().query('SELECT * FROM Report WHERE id = ?', [id]);
    return result.values![0] as Report;
  },

  async getById(id: string): Promise<Report | null> {
    const result = await getDb().query(
      'SELECT * FROM Report WHERE id = ? AND userId = ?',
      [id, DEFAULT_USER_ID]
    );
    return result.values && result.values.length > 0 ? result.values[0] as Report : null;
  }
};
