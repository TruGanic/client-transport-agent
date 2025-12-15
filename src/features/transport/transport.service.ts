import { db } from "../../database/client";
import { sensorBatches } from "../../database/schema";
import { BLE_CONFIG, ProcessBatchResult } from "../../types/transport.types";

export const TransportService = {
  /**
   * Helper to determine if buffer is full
   */
  shouldProcessBatch: (bufferLength: number): boolean => {
    return bufferLength >= BLE_CONFIG.BATCH_SIZE;
  },

  /**
   * Calculates average and saves to local SQLite
   */
  processBatch: async (
    buffer: number[],
    startTime: number
  ): Promise<ProcessBatchResult> => {
    if (buffer.length === 0) return { success: false, error: "Empty buffer" };

    // 1. Math Logic (Averaging)
    const sum = buffer.reduce((a, b) => a + b, 0);
    const avgValue = sum / buffer.length;
    const endTime = Date.now();

    // 2. Database Logic
    try {
      await db.insert(sensorBatches).values({
        startTime,
        endTime,
        avgValue,
        batchHash: null,
        isSynced: 0,
      });

      return { success: true, avg: avgValue };
    } catch (error) {
      console.error("[TransportService] Failed to save batch:", error);
      return { success: false, error };
    }
  },
};
