import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const sensorBatches = sqliteTable('sensor_batches',{
    id:integer('id').primaryKey({ autoIncrement:true}),
    batchHash:text('batch_hash'),
    startTime:integer('start_time'),
    endTime:integer('end_time'),
    avgTemp:real('avg_temp'),
    avgHumidity:real('avg_humidity'),
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
  farmerName: text('farmer_name'), // NEW: For ConfirmPickup
  pickupLocation: text('pickup_location'), // NEW: For ConfirmPickup

  // 3. Audit Metadata
  notes: text('notes'),
  recordedAt: integer('recorded_at').notNull(), // Timestamp
  
  // 4. Trip Stats (Aggregated at end of trip)
  minTemp: real('min_temp'),
  maxTemp: real('max_temp'),
  avgTempAggregate: real('avg_temp_aggregate'),
  
  // Humidity Stats
  minHumidity: real('min_humidity'),
  maxHumidity: real('max_humidity'),
  avgHumidityAggregate: real('avg_humidity_aggregate'),
  
  // 5. State Management
  isTripCompleted: integer('is_trip_completed').default(0), // 0: No, 1: Yes
  
  // 4. Sync State (Critical for your offline flow)
  syncStatus: text('sync_status', { enum: ['PENDING', 'SYNCED', 'FAILED'] })
    .default('PENDING')
    .notNull(),
  merkleRoot: text('merkle_root'), // For later use
});

export type HarvestBatch = typeof harvestBatches.$inferSelect;