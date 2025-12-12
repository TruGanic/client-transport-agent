import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const sensorBatches = sqliteTable('sensor_batches',{
    id:integer('id').primaryKey({ autoIncrement:true}),
    batchHash:text('batch_bash'),
    startTime:integer('start_time'),
    endTime:integer('end_time'),
    avgTime:real('avg_value'),
    isSynced:integer('is_stnced').default(0)
})