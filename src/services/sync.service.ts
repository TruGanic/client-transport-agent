import NetInfo from "@react-native-community/netinfo";
import SHA256 from "crypto-js/sha256";
import { eq } from "drizzle-orm";
import { MerkleTree } from "merkletreejs";
import { db } from "../database/client";
import { harvestBatches } from "../database/schema";
import { useAuthStore } from "../store/auth-store";
import { useSyncStore } from "../store/sync-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/**
 * Build a multipart FormData payload for the /api/transport/pickup endpoint.
 * Backend ConfirmPickup interface:
 *   batchId, produceType, supplierId, farmerName, pickupLocation, weightKg, pickupTimestamp
 *   notes? (optional), invoice (optional file)
 */
function buildPickupFormData(batch: {
  batchId: string;
  produceType: string;
  supplierId: string | null;
  farmerName: string | null;
  pickupLocation: string | null;
  weightKg: number;
  notes: string | null;
  invoiceUri: string | null;
}): FormData {
  const fd = new FormData();
  fd.append("batchId", batch.batchId);
  fd.append("produceType", batch.produceType);
  fd.append("supplierId", batch.supplierId ?? "");
  fd.append("farmerName", batch.farmerName ?? "");
  fd.append("pickupLocation", batch.pickupLocation ?? "");
  fd.append("weightKg", String(batch.weightKg));
  fd.append("pickupTimestamp", new Date().toISOString());

  if (batch.notes) {
    fd.append("notes", batch.notes);
  }

  if (batch.invoiceUri) {
    const filename = batch.invoiceUri.split("/").pop() ?? "invoice";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      pdf: "application/pdf",
    };
    fd.append("invoice", {
      uri: batch.invoiceUri,
      name: filename,
      type: mimeMap[ext] || "application/octet-stream",
    } as any);
  }

  return fd;
}

/**
 * Ensure the access token is valid, refreshing if expired.
 * Returns a valid token string or null if refresh fails.
 */
async function getValidToken(): Promise<string | null> {
  const authStore = useAuthStore.getState();
  let token = authStore.accessToken;

  if (!token) return null;

  // Try a refresh proactively — if the token is expired, Supabase will return a new one.
  // This is cheap and avoids a 403 round-trip.
  const refreshed = await authStore.refreshSession();
  if (refreshed) {
    // Re-read after refresh since the store was updated
    token = useAuthStore.getState().accessToken;
  }

  return token;
}

/**
 * POST a single pickup to the backend API.
 * Automatically refreshes JWT if expired before sending.
 * Returns the parsed JSON response.
 */
async function postPickup(fd: FormData): Promise<any> {
  const url = `${API_BASE_URL}/api/transport/pickup`;
  console.log(`📡 [API] POST ${url}`);

  const token = await getValidToken();

  const res = await fetch(url, {
    method: "POST",
    body: fd,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // Let RN set the Content-Type with boundary automatically
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Generate a Merkle root from an array of harvest batch records.
 * Each leaf = SHA256(batchId|produceType|weight|timestamp).
 */
function generateBatchMerkleRoot(
  batches: {
    batchId: string;
    produceType: string;
    weightKg: number;
    recordedAt: number;
  }[],
): string {
  if (batches.length === 0) return "";

  const leaves = batches.map((b) =>
    SHA256(
      `${b.batchId}|${b.produceType}|${b.weightKg}|${b.recordedAt}`,
    ).toString(),
  );

  const tree = new MerkleTree(leaves, SHA256);
  return tree.getHexRoot();
}

export const SyncService = {
  /**
   * Called when NetInfo detects connection restored.
   * Scans DB for 'PENDING' records, generates a merkle root across all buffered batches,
   * stores it, then syncs each record to the backend API.
   */
  async syncPendingData() {
    const { isSyncing } = useSyncStore.getState();
    if (isSyncing) return;

    console.log("🔄 [SyncService] Checking for pending data...");
    useSyncStore.getState().setSyncing(true);

    try {
      const pendingBatches = await db
        .select()
        .from(harvestBatches)
        .where(eq(harvestBatches.syncStatus, "PENDING"));

      if (pendingBatches.length === 0) {
        console.log("✅ [SyncService] Nothing to sync.");
        useSyncStore.getState().setSyncing(false);
        return;
      }

      console.log(
        `📦 [SyncService] Found ${pendingBatches.length} pending items.`,
      );

      // Generate merkle root across ALL pending batches for audit trail
      const merkleRoot = generateBatchMerkleRoot(pendingBatches);
      console.log(
        `🌳 [SyncService] Merkle root for ${pendingBatches.length} buffered batches: ${merkleRoot}`,
      );

      // Store the merkle root on each pending batch
      for (const batch of pendingBatches) {
        await db
          .update(harvestBatches)
          .set({ merkleRoot })
          .where(eq(harvestBatches.id, batch.id));
      }

      // Sync each batch individually via API
      for (const batch of pendingBatches) {
        try {
          const fd = buildPickupFormData(batch);
          await postPickup(fd);

          await db
            .update(harvestBatches)
            .set({ syncStatus: "SYNCED" })
            .where(eq(harvestBatches.id, batch.id));

          console.log(`✅ [SyncService] Batch ${batch.batchId} synced.`);
        } catch (e: any) {
          console.error(
            `❌ [SyncService] Failed to sync batch ${batch.batchId}:`,
            e.message,
          );
          await db
            .update(harvestBatches)
            .set({ syncStatus: "FAILED" })
            .where(eq(harvestBatches.id, batch.id));
        }
      }

      useSyncStore.getState().setLastSyncTime(Date.now());
      console.log("✅ [SyncService] Sync cycle complete.");
    } catch (error: any) {
      console.error("❌ [SyncService] Global Sync Failed:", error);
      useSyncStore.getState().setSyncError(error.message || "Sync failed");
    } finally {
      useSyncStore.getState().setSyncing(false);
    }
  },

  /**
   * Scenario A: Pickup (Optimistic Sync)
   * Saves locally first, then attempts online sync via real API.
   */
  async submitPickup(formData: {
    batchId: string;
    produceType: string;
    supplierId: string;
    farmerName: string;
    pickupLocation: string;
    weight: string;
    notes: string;
    invoiceUri: string | null;
  }) {
    console.log("🔄 [SyncService] Submitting Pickup...", formData.batchId);

    // 1. Save Local First
    const result = await db
      .insert(harvestBatches)
      .values({
        batchId: formData.batchId,
        produceType: formData.produceType,
        weightKg: parseFloat(formData.weight),
        supplierId: formData.supplierId,
        farmerName: formData.farmerName,
        pickupLocation: formData.pickupLocation,
        notes: formData.notes || null,
        invoiceUri: formData.invoiceUri,
        recordedAt: Date.now(),
        syncStatus: "PENDING",
      })
      .returning({ insertedId: harvestBatches.id });

    const localId = result[0].insertedId;

    // 2. Check Connectivity
    const state = await NetInfo.fetch();

    if (state.isConnected) {
      useSyncStore.getState().setSyncing(true);
      console.log("✅ [SyncService] Online. Syncing immediately...");
      try {
        // Build form data for API
        const fd = buildPickupFormData({
          batchId: formData.batchId,
          produceType: formData.produceType,
          supplierId: formData.supplierId,
          farmerName: formData.farmerName,
          pickupLocation: formData.pickupLocation,
          weightKg: parseFloat(formData.weight),
          notes: formData.notes || null,
          invoiceUri: formData.invoiceUri,
        });

        // Generate merkle root for this single batch
        const merkleRoot = generateBatchMerkleRoot([
          {
            batchId: formData.batchId,
            produceType: formData.produceType,
            weightKg: parseFloat(formData.weight),
            recordedAt: Date.now(),
          },
        ]);

        await postPickup(fd);

        // Mark as synced + store merkle root
        await db
          .update(harvestBatches)
          .set({ syncStatus: "SYNCED", merkleRoot })
          .where(eq(harvestBatches.id, localId));

        console.log("✅ [SyncService] Pickup Synced to Backend.");
        useSyncStore.getState().setLastSyncTime(Date.now());
        return { success: true, synced: true };
      } catch (e: any) {
        console.warn(
          "⚠️ [SyncService] Sync failed. Will retry later.",
          e.message,
        );
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

    await db
      .update(harvestBatches)
      .set({
        minTemp: stats.minTemp,
        maxTemp: stats.maxTemp,
        avgTempAggregate: stats.avgTemp,
        minHumidity: stats.minHumidity,
        maxHumidity: stats.maxHumidity,
        avgHumidityAggregate: stats.avgHumidity,
        merkleRoot: stats.merkleRoot,
        isTripCompleted: 1,
      })
      .where(eq(harvestBatches.batchId, batchId));

    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      console.log("❌ [SyncService] Offline. Trip Finalization Queued.");
      return { success: true, synced: false };
    }

    useSyncStore.getState().setSyncing(true);

    try {
      const batch = await db
        .select()
        .from(harvestBatches)
        .where(eq(harvestBatches.batchId, batchId));
      const record = batch[0];

      if (!record) {
        throw new Error(`Batch record not found for ID: ${batchId}`);
      }

      // If pickup wasn't synced yet, sync it first
      if (record.syncStatus === "PENDING") {
        console.log(
          "⚠️ [SyncService] Found pending pickup. Syncing that first...",
        );
        const fd = buildPickupFormData(record);
        await postPickup(fd);
      }

      // Mark completed
      await db
        .update(harvestBatches)
        .set({ syncStatus: "SYNCED" })
        .where(eq(harvestBatches.batchId, batchId));

      console.log("✅ [SyncService] Trip Fully Synced!");
      useSyncStore.getState().setLastSyncTime(Date.now());
      return { success: true, synced: true };
    } catch (e: any) {
      console.error("❌ [SyncService] Sync Failed:", e);
      useSyncStore.getState().setSyncError(e.message);
      return { success: false, error: e };
    } finally {
      useSyncStore.getState().setSyncing(false);
    }
  },
};
