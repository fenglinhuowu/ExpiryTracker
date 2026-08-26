import * as SQLite from 'expo-sqlite';

export interface Item {
  id: number;
  name: string | null;
  expiryDate: string; // YYYY-MM-DD
  location: string;
  photoUri: string | null;
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
          name TEXT,
          expiryDate TEXT NOT NULL,
          location TEXT,
          photoUri TEXT,
          createdAt INTEGER NOT NULL
        );
      `);
      // Migration: add photoUri column if it doesn't exist
      try {
        await db.execAsync(`ALTER TABLE items ADD COLUMN photoUri TEXT;`);
      } catch {
        // column already exists
      }
      return db;
    });
  }
  return dbPromise;
}

export async function addItem(
  name: string,
  expiryDate: string,
  location: string,
  photoUri: string | null
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO items (name, expiryDate, location, photoUri, createdAt) VALUES (?, ?, ?, ?, ?)',
    name,
    expiryDate,
    location,
    photoUri,
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
