import NetInfo from "@react-native-community/netinfo";
import { eq } from "drizzle-orm";
import { db } from "../database/client";
import { harvestBatches } from "../database/schema";
import { useSyncStore } from "../store/sync-store";

// Mock API - Replace with actual Chaincode invocation later
const API = {
    confirmPickup: async (data: any) => {
        console.log("📡 [API] Calling ConfirmPickup...", data);
        await new Promise(r => setTimeout(r, 1000)); // Simulate latency
        return true;
    },
    completeTrip: async (data: any) => {
        console.log("📡 [API] Calling CompleteTrip...", data);
        await new Promise(r => setTimeout(r, 1000));
        return true;
    }
};

export const SyncService = {
  
  /**
   * Called when NetInfo detects connection restored.
   * Scans DB for 'PENDING' records and pushes them.
   */
  async syncPendingData() {
      const { isSyncing } = useSyncStore.getState();
      if (isSyncing) return; // Prevent double sync

      console.log("🔄 [SyncService] Checking for pending data...");
      useSyncStore.getState().setSyncing(true);

      try {
          // 1. Fetch pending items
          const pendingBatches = await db.select()
              .from(harvestBatches)
              .where(eq(harvestBatches.syncStatus, "PENDING"));

          if (pendingBatches.length === 0) {
              console.log("✅ [SyncService] Nothing to sync.");
              useSyncStore.getState().setSyncing(false);
              return;
          }

          console.log(`📦 [SyncService] Found ${pendingBatches.length} pending items.`);

          // 2. Process each
          for (const batch of pendingBatches) {
              // Simple logic: If trip completed, finalizeTrip. If just pickup, confirmPickup.
              // Logic depends on 'isTripCompleted' flag we added to schema
              
              if (batch.isTripCompleted === 1) {
                  // Full Trip Sync
                   await API.completeTrip({
                       batchId: batch.batchId,
                       minTemp: batch.minTemp,
                       maxTemp: batch.maxTemp,
                       avgTemp: batch.avgTempAggregate,
                       minHumidity: batch.minHumidity,
                       maxHumidity: batch.maxHumidity,
                       avgHumidity: batch.avgHumidityAggregate,
                       merkleRoot: batch.merkleRoot
                   });
              } else {
                  // Just Pickup Sync
                  await API.confirmPickup({
                      batchId: batch.batchId,
                      farmerName: batch.farmerName,
                      pickupLocation: batch.pickupLocation,
                      weightKg: batch.weightKg,
                      produceType: batch.produceType,
                      supplierId: batch.supplierId
                  });
              }

              // Update DB
              await db.update(harvestBatches)
                  .set({ syncStatus: "SYNCED" })
                  .where(eq(harvestBatches.id, batch.id));
          }

          useSyncStore.getState().setLastSyncTime(Date.now());
          console.log("✅ [SyncService] All pending data synced.");

      } catch (error: any) {
          console.error("❌ [SyncService] Global Sync Failed:", error);
          useSyncStore.getState().setSyncError(error.message || "Sync failed");
      } finally {
          useSyncStore.getState().setSyncing(false);
      }
  },

  /**
   * Scenario A: Pickup (Optimistic Sync)
   */
  async submitPickup(formData: any) {
    console.log("🔄 [SyncService] Submitting Pickup...", formData);

    // 1. Save Local First (Wait for ID return)
    const result = await db.insert(harvestBatches).values({
        batchId: formData.batchId,
        produceType: formData.produceType,
        weightKg: parseFloat(formData.weightKg),
        supplierId: formData.supplierId,
        farmerName: formData.farmerName,
        pickupLocation: formData.pickupLocation,
        notes: formData.notes,
        recordedAt: Date.now(),
        syncStatus: "PENDING",
    }).returning({ insertedId: harvestBatches.id });

    const localId = result[0].insertedId;

    // 2. Check Connectivity
    const state = await NetInfo.fetch();
    
    if (state.isConnected) {
        useSyncStore.getState().setSyncing(true);
        console.log("✅ [SyncService] Online. Syncing immediately...");
        try {
            await API.confirmPickup(formData);
            
            // 3. Mark as Synced
            await db.update(harvestBatches)
                .set({ syncStatus: "SYNCED" })
                .where(eq(harvestBatches.id, localId));
                
            console.log("✅ [SyncService] Pickup Synced to Chain.");
            useSyncStore.getState().setLastSyncTime(Date.now());
            return { success: true, synced: true };
        } catch (e: any) {
            console.warn("⚠️ [SyncService] Sync failed. Will retry later.", e);
            useSyncStore.getState().setSyncError(e.message);
            return { success: true, synced: false }; 
        } finally {
            useSyncStore.getState().setSyncing(false);
        }
    } else {
        console.log("❌ [SyncService] Offline. Data Queued.");
        return { success: true, synced: false };
    }
  },

  /**
   * Scenario C: Trip Completion
   */
  async finalizeTrip(batchId: string, stats: any) {
     console.log("🔄 [SyncService] Finalizing Trip...", batchId);

     // 1. Save Stats Locally
     await db.update(harvestBatches)
        .set({
            minTemp: stats.minTemp,
            maxTemp: stats.maxTemp,
            avgTempAggregate: stats.avgTemp,
            minHumidity: stats.minHumidity,
            maxHumidity: stats.maxHumidity,
            avgHumidityAggregate: stats.avgHumidity,
            merkleRoot: stats.merkleRoot,
            isTripCompleted: 1,
            // Keep status pending until confirmed below
        })
        .where(eq(harvestBatches.batchId, batchId));

     // 2. Check Connectivity
     const state = await NetInfo.fetch();
     if (!state.isConnected) {
         console.log("❌ [SyncService] Offline. Trip Finalization Queued.");
         return { success: true, synced: false };
     }

     useSyncStore.getState().setSyncing(true);

     // 3. Online Logic: Ensure Order (Heal the Chain)
     try {
         // A. Check if Pickup was synced? 
         const batch = await db.select().from(harvestBatches).where(eq(harvestBatches.batchId, batchId));
         const record = batch[0];

         if (!record) {
             console.error(`❌ [SyncService] Batch record not found for ID: ${batchId}`);
             throw new Error(`Batch record not found for ID: ${batchId}`);
         }

         if (record.syncStatus === 'PENDING') {
              console.log("⚠️ [SyncService] Found pending pickup. Syncing that first...");
              await API.confirmPickup({
                  batchId: record.batchId,
                  farmerName: record.farmerName,
                  pickupLocation: record.pickupLocation,
                  weightKg: record.weightKg,
                  produceType: record.produceType,
                  supplierId: record.supplierId
              });
         }

         // B. Sync Complete Trip
         await API.completeTrip({
             batchId,
             minTemp: stats.minTemp,
             maxTemp: stats.maxTemp,
             avgTemp: stats.avgTemp,
             minHumidity: stats.minHumidity,
             maxHumidity: stats.maxHumidity,
             avgHumidity: stats.avgHumidity,
             merkleRoot: stats.merkleRoot
         });

         // C. Mark All Completed
         await db.update(harvestBatches)
            .set({ syncStatus: "SYNCED" })
            .where(eq(harvestBatches.batchId, batchId));
            
         console.log("✅ [SyncService] Trip Fully Sycned!");
         useSyncStore.getState().setLastSyncTime(Date.now());
         return { success: true, synced: true };

     } catch (e: any) {
         console.error("❌ [SyncService] Sync Failed:", e);
         useSyncStore.getState().setSyncError(e.message);
         return { success: false, error: e };
     } finally {
         useSyncStore.getState().setSyncing(false);
     }
  }
};
