import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

export const expoDbClient = openDatabaseSync("food_traceability.db");
export const db = drizzle(expoDbClient);
