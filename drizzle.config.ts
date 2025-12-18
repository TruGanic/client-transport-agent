import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // 1. Point to schema file
  schema: './src/database/schema.ts', 
  
  // 2. Where to save the generated SQL migrations
  out: './drizzle', 
  
  // 3.  using SQLite
  dialect: 'sqlite',
  
  // 4. This ensures compatibility with Expo
  driver: 'expo', 
});