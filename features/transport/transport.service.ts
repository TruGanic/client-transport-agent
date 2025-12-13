import { db } from '../../database/client';
import { sensorBatches } from '../../database/schema';

// Configuration
const BATCH_SIZE = 10; // For demo purposes

export const TransportService = {
  /**
   * Calculates average and saves to local SQLite
   */
  processBatch: async (buffer: number[], startTime: number) => {
    if (buffer.length === 0) return null;

    // 1. Math Logic (Averaging)
    const sum = buffer.reduce((a, b) => a + b, 0);
    const avgValue = sum / buffer.length;
    const endTime = Date.now();

    // 2. Database Logic (Drizzle ORM)
    try {
      await db.insert(sensorBatches).values({
        startTime: startTime,
        endTime: endTime,
        avgValue: avgValue,
        batchHash: null, // We will generate this in the Merkle Step later
        isSynced: 0
      });

      return { success: true, avg: avgValue };
    } catch (error) {
      console.error("Failed to save batch:", error);
      return { success: false, error };
    }
  },

  /**
   * Helper to determine if buffer is full
   */
  shouldProcessBatch: (bufferLength: number) => {
    return bufferLength >= BATCH_SIZE;
  }
};