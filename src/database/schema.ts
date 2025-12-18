import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const sensorBatches = sqliteTable('sensor_batches',{
    id:integer('id').primaryKey({ autoIncrement:true}),
    batchHash:text('batch_hash'),
    startTime:integer('start_time'),
    endTime:integer('end_time'),
    avgValue:real('avg_value'),
    isSynced:integer('is_synced').default(0)
})


// This table stores the initial collection data
export const harvestBatches = sqliteTable('harvest_batches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  
  // 1. Traceability Core
  batchId: text('batch_id').notNull().unique(), // e.g., "BATCH-2025-X92"
  produceType: text('produce_type').notNull(), // e.g., "Organic Avocados"
  
  // 2. Quantity & Origin
  weightKg: real('weight_kg').notNull(), 
  supplierId: text('supplier_id').notNull(), // The Farm/Source ID
  
  // 3. Audit Metadata
  notes: text('notes'),
  recordedAt: integer('recorded_at').notNull(), // Timestamp
  
  // 4. Sync State (Critical for your offline flow)
  syncStatus: text('sync_status', { enum: ['PENDING', 'SYNCED', 'FAILED'] })
    .default('PENDING')
    .notNull(),
  merkleRoot: text('merkle_root'), // For later use
});

export type HarvestBatch = typeof harvestBatches.$inferSelect;