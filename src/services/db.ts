import * as SQLite from 'expo-sqlite';

export interface Item {
  id: number;
  name: string;
  expiryDate: string; // YYYY-MM-DD
  location: string;
  createdAt: number;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('expirytracker.db').then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          expiryDate TEXT NOT NULL,
          location TEXT NOT NULL,
          createdAt INTEGER NOT NULL
        );
      `);
      return db;
    });
  }
  return dbPromise;
}

export async function addItem(name: string, expiryDate: string, location: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO items (name, expiryDate, location, createdAt) VALUES (?, ?, ?, ?)',
    name,
    expiryDate,
    location,
    Date.now()
  );
}

export async function getAllItems(): Promise<Item[]> {
  const db = await getDb();
  return db.getAllAsync<Item>('SELECT * FROM items ORDER BY expiryDate ASC');
}

export async function deleteItem(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM items WHERE id = ?', id);
}
