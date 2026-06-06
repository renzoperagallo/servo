import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { initDatabase, isSqliteAvailable } from './db';
import { getCycleDates, getCurrentCycleMonth } from './cycleUtils';
import {
  localUserRepo,
  localExpenseItemRepo,
  localExpenseRepo,
  localReportRepo,
  type User,
  type ExpenseItem,
  type Expense,
  type Summary,
  type Report
} from './localRepos';

export type { User, ExpenseItem, Expense, Summary, Report, ItemSummary } from './localRepos';

const STORAGE_KEY = 'servo_server_url';
const MODE_KEY = 'servo_mode';
const DEFAULT_SERVER_URL = 'http://localhost:3000';

export type AppMode = 'local' | 'remote';

export function getAppMode(): AppMode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === 'local' || stored === 'remote') return stored;
    return 'local';
  } catch {
    return 'local';
  }
}

export function setAppMode(mode: AppMode) {
  localStorage.setItem(MODE_KEY, mode);
}

export function getServerUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_SERVER_URL;
  } catch {
    return DEFAULT_SERVER_URL;
  }
}

export function setServerUrl(url: string) {
  localStorage.setItem(STORAGE_KEY, url.replace(/\/+$/, ''));
}

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

let dbReady = false;
let dbAvailable = false;

async function ensureDb(): Promise<boolean> {
  if (!dbReady) {
    dbAvailable = await initDatabase();
    dbReady = true;
  }
  return dbAvailable;
}

function isLocalMode(): boolean {
  return getAppMode() === 'local';
}

function requireDb(): void {
  if (!dbAvailable) {
    throw new Error('SQLite no disponible. Cambia a modo Servidor.');
  }
}

async function remoteFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getServerUrl()}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {})
  };

  if (Capacitor.isNativePlatform()) {
    const response = await CapacitorHttp.request({
      url,
      method: (options?.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE',
      headers,
      data: options?.body ? JSON.parse(options.body as string) : undefined,
    });

    if (response.status === 204) return undefined as T;
    if (response.status >= 400) {
      const err = typeof response.data === 'string' ? JSON.parse(response.data || '{}') : response.data;
      throw new Error(err.error || `HTTP error ${response.status}`);
    }
    return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
  }

  const response = await fetch(url, { headers, ...options });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const userApi = {
  async getSettings(): Promise<User> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      return localUserRepo.getSettings();
    }
    return remoteFetch<User>('/api/user/settings');
  },

  async updateSettings(data: { cycleStartDay?: number; cycleEndDay?: number }): Promise<User> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      return localUserRepo.updateSettings(data);
    }
    return remoteFetch<User>('/api/user/settings', { method: 'PUT', body: JSON.stringify(data) });
  }
};

export const expenseItemsApi = {
  async getAll(): Promise<ExpenseItem[]> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      return localExpenseItemRepo.getAll();
    }
    return remoteFetch<ExpenseItem[]>('/api/expense-items');
  },

  async create(data: { name: string; monthlyBudget: number }): Promise<ExpenseItem> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      return localExpenseItemRepo.create(data);
    }
    return remoteFetch<ExpenseItem>('/api/expense-items', { method: 'POST', body: JSON.stringify(data) });
  },

  async update(id: string, data: { name?: string; monthlyBudget?: number }): Promise<ExpenseItem> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      return localExpenseItemRepo.update(id, data);
    }
    return remoteFetch<ExpenseItem>(`/api/expense-items/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async delete(id: string): Promise<void> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      return localExpenseItemRepo.delete(id);
    }
    return remoteFetch<void>(`/api/expense-items/${id}`, { method: 'DELETE' });
  }
};

export const expensesApi = {
  async getAll(): Promise<Expense[]> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      const user = await localUserRepo.getSettings();
      const { startDate, endDate } = getCycleDates(user.cycleStartDay, user.cycleEndDay);
      return localExpenseRepo.getAll(startDate, endDate);
    }
    return remoteFetch<Expense[]>('/api/expenses');
  },

  async create(data: { amount: number; description?: string; date?: string; expenseItemId: string }): Promise<Expense> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      return localExpenseRepo.create(data);
    }
    return remoteFetch<Expense>('/api/expenses', { method: 'POST', body: JSON.stringify(data) });
  },

  async delete(id: string): Promise<void> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      return localExpenseRepo.delete(id);
    }
    return remoteFetch<void>(`/api/expenses/${id}`, { method: 'DELETE' });
  },

  async getSummary(): Promise<Summary> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      const user = await localUserRepo.getSettings();
      const { startDate, endDate } = getCycleDates(user.cycleStartDay, user.cycleEndDay);
      return localExpenseRepo.getSummary(startDate, endDate);
    }
    return remoteFetch<Summary>('/api/expenses/summary');
  }
};

export const reportsApi = {
  async getAll(): Promise<Report[]> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      return localReportRepo.getAll();
    }
    return remoteFetch<Report[]>('/api/reports');
  },

  async generate(): Promise<Report> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      const user = await localUserRepo.getSettings();
      const { startDate, endDate } = getCycleDates(user.cycleStartDay, user.cycleEndDay);
      const summary = await localExpenseRepo.getSummary(startDate, endDate);
      const { month, year } = getCurrentCycleMonth(user.cycleStartDay);
      return localReportRepo.generate(month, year, summary);
    }
    return remoteFetch<Report>('/api/reports/generate', { method: 'POST' });
  },

  async getById(id: string): Promise<Report | null> {
    if (isLocalMode()) {
      await ensureDb();
      requireDb();
      return localReportRepo.getById(id);
    }
    return remoteFetch<Report>(`/api/reports/${id}`);
  }
};

export async function testConnection(url: string): Promise<boolean> {
  try {
    const response = await CapacitorHttp.request({
      url: `${url}/api/health`,
      method: 'GET',
    });
    return response.status === 200;
  } catch {
    return false;
  }
}
