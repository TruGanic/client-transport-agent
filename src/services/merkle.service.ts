import SHA256 from "crypto-js/sha256";
import { and, gte, lte } from "drizzle-orm";
import { MerkleTree } from "merkletreejs";
import { db } from "../database/client";
import { sensorBatches } from "../database/schema";

interface ITripStats {
  merkleRoot: string;
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
}

export const MerkleService = {
  /**
   * Generates a Merkle Proof and Aggregated Stats for a given time range (Trip).
   * 
   * @param startTime Trip Start Timestamp
   * @param endTime Trip End Timestamp
   * @returns Stats + Merkle Root
   */
  async generateTripProof(startTime: number, endTime: number): Promise<ITripStats> {
    
    // 1. Fetch all sensor batches for this trip
    const batches = await db
      .select()
      .from(sensorBatches)
      .where(
        and(
            gte(sensorBatches.startTime, startTime),
            lte(sensorBatches.endTime, endTime)
        )
      );

    if (batches.length === 0) {
      return {
        merkleRoot: "", // Or handle as empty
        minTemp: 0,
        maxTemp: 0,
        avgTemp: 0,
      };
    }

    // 2. Aggregate Stats
    let minTemp = Number.MAX_VALUE;
    let maxTemp = Number.MIN_VALUE;
    let sumTemp = 0;
    let count = 0;

    // 3. Prepare Leaves for Merkle Tree
    const leaves = batches.map((batch) => {
      // Statistics Logic
      if (batch.avgTemp !== null) {
          const val = batch.avgTemp;
          if (val < minTemp) minTemp = val;
          if (val > maxTemp) maxTemp = val;
          sumTemp += val;
          count++;
      }

      // Hash Logic: Create a deterministic string from the batch data
      // Structure: "START_TIME|END_TIME|AVG_TEMP|AVG_HUMIDITY"
      const dataString = `${batch.startTime}|${batch.endTime}|${batch.avgTemp}|${batch.avgHumidity}`;
      return SHA256(dataString).toString();
    });

    const avgTemp = count > 0 ? sumTemp / count : 0;

    // 4. Generate Tree
    const tree = new MerkleTree(leaves, SHA256);
    const merkleRoot = tree.getHexRoot();

    console.log(`[MerkleService] Generated Root: ${merkleRoot} for ${leaves.length} batches.`);

    return {
      merkleRoot,
      minTemp: minTemp === Number.MAX_VALUE ? 0 : minTemp,
      maxTemp: maxTemp === Number.MIN_VALUE ? 0 : maxTemp,
      avgTemp,
    };
  },
};
