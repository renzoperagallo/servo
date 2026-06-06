import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

const DB_NAME = 'servo';
const DEFAULT_USER_ID = 'default-user';

let sqlite: SQLiteConnection | null = null;
let db: SQLiteDBConnection | null = null;
let initialized = false;
let sqliteAvailable = false;

export async function initDatabase(): Promise<boolean> {
  if (initialized) return sqliteAvailable;

  try {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not native platform, SQLite not available');
      sqliteAvailable = false;
      initialized = true;
      return false;
    }

    sqlite = new SQLiteConnection(CapacitorSQLite);

    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;

    if (ret.result && isConn) {
      db = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    }

    await db.open();
    await createTables();
    await ensureDefaultUser();
    sqliteAvailable = true;
    initialized = true;
    console.log('SQLite database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize SQLite:', error);
    sqliteAvailable = false;
    initialized = true;
    return false;
  }
}

async function createTables(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      cycleStartDay INTEGER NOT NULL DEFAULT 1,
      cycleEndDay INTEGER NOT NULL DEFAULT 31,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ExpenseItem (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      monthlyBudget REAL NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS Expense (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL DEFAULT (datetime('now')),
      expenseItemId TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (expenseItemId) REFERENCES ExpenseItem(id),
      FOREIGN KEY (userId) REFERENCES User(id)
    );

    CREATE TABLE IF NOT EXISTS Report (
      id TEXT PRIMARY KEY,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      data TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES User(id),
      UNIQUE(month, year, userId)
    );
  `);
}

async function ensureDefaultUser(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.query(
    'SELECT id FROM User WHERE id = ?',
    [DEFAULT_USER_ID]
  );
  if (!result.values || result.values.length === 0) {
    await db.run(
      'INSERT INTO User (id, cycleStartDay, cycleEndDay) VALUES (?, 1, 31)',
      [DEFAULT_USER_ID]
    );
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function getDb(): SQLiteDBConnection {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

export function isSqliteAvailable(): boolean {
  return sqliteAvailable;
}

export { DEFAULT_USER_ID, generateId };
