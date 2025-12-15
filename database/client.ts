import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

export const expoDb = openDatabaseSync('sensor.db');
export const db = drizzle(expoDb, { schema });

export const initDatabase = () => {
  try {
    // We execute a raw SQL command to create the table manually
    // This matches the schema definition in schema.ts
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS sensor_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_hash TEXT,
        start_time INTEGER,
        end_time INTEGER,
        avg_value REAL,
        is_synced INTEGER DEFAULT 0
      );
    `);
    console.log("✅ Database initialized: 'sensor_batches' table checked/created.");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
};

