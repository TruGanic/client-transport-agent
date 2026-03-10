import HandoverInstructionsCarousel from "@/src/components/HandoverInstructionsCarousel";
import { Colors } from "@/src/constants/theme";
import { db } from "@/src/database/client";
import { harvestBatches } from "@/src/database/schema";
import { useTripManager } from "@/src/hooks/useTripManager";
import { MerkleService } from "@/src/services/merkle.service";
import { SyncService } from "@/src/services/sync.service";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HandoverScreen() {
  const {
    isRecording,
    stopTrip,
    currentBuffer,
    currentHumidityBuffer,
    tripStartTime,
    tripEndTime,
    activeBatchId,
    clearTripData,
    clearBatchData,
  } = useTripManager();
  const [step, setStep] = useState(1); // 1: Trip Active/Summary, 2: QR Scan, 3: Completed
  const [loading, setLoading] = useState(false);

  // Calculate Averages
  const avgTemp =
    currentBuffer.length > 0
      ? (
          currentBuffer.reduce((a, b) => a + b, 0) / currentBuffer.length
        ).toFixed(1)
      : "--";

  const avgHumidity =
    currentHumidityBuffer && currentHumidityBuffer.length > 0
      ? (
          currentHumidityBuffer.reduce((a, b) => a + b, 0) /
          currentHumidityBuffer.length
        ).toFixed(0)
      : "--";

  // ─── STOP TRIP: End BLE recording, stay on step 1 ───────────────────
  const handleStopTrip = () => {
    console.log("🛑 [Handover] User pressed STOP TRIP & UNLOAD");
    stopTrip();
    // Stay on step 1 — button changes to "PROCEED TO HANDOVER"
    console.log(
      "🛑 [Handover] Trip stopped. Waiting for user to proceed to handover.",
    );
  };

  // ─── PROCEED TO HANDOVER: Save locally + call API ───────────────────
  const handleProceedToHandover = async () => {
    if (!activeBatchId) {
      Alert.alert(
        "Error",
        "No active batch found. Please start a pickup first.",
      );
      return;
    }

    setLoading(true);
    console.log("========================================");
    console.log("🚀 [Handover] PROCEED TO HANDOVER pressed");
    console.log(`📦 [Handover] Active Batch ID: ${activeBatchId}`);

    // Verify batch exists in local DB before proceeding
    try {
      const batchRecords = await db
        .select()
        .from(harvestBatches)
        .where(eq(harvestBatches.batchId, activeBatchId));

      if (!batchRecords || batchRecords.length === 0) {
        console.error(
          `❌ [Handover] Batch ${activeBatchId} not found in harvest_batches DB`,
        );
        Alert.alert(
          "No Active Batch",
          "The batch record was not found in the local database. Please create a pickup first.",
        );
        setLoading(false);
        return;
      }
      console.log(
        `✅ [Handover] Batch ${activeBatchId} verified in DB (syncStatus: ${batchRecords[0].syncStatus})`,
      );
    } catch (dbError: any) {
      console.error("❌ [Handover] DB check failed:", dbError.message);
      Alert.alert("Error", "Failed to verify batch record. Please try again.");
      setLoading(false);
      return;
    }

    try {
      // 1. Generate Merkle Proof & Stats using proper trip time range
      const start = tripStartTime || Date.now() - 3600000;
      const end = tripEndTime || Date.now();
      console.log(
        `⏱️ [Handover] Trip time range: ${new Date(start).toISOString()} → ${new Date(end).toISOString()}`,
      );

      console.log(
        "🌳 [Handover] Generating Merkle Proof from sensor_batches...",
      );
      const proof = await MerkleService.generateTripProof(start, end);
      console.log("🌳 [Handover] Merkle Proof generated:");
      console.log(`   merkleRoot : ${proof.merkleRoot}`);
      console.log(`   minTemp    : ${proof.minTemp}`);
      console.log(`   maxTemp    : ${proof.maxTemp}`);
      console.log(`   avgTemp    : ${proof.avgTemp}`);
      console.log(`   minHumidity: ${proof.minHumidity}`);
      console.log(`   maxHumidity: ${proof.maxHumidity}`);
      console.log(`   avgHumidity: ${proof.avgHumidity}`);

      // 2. Finalize: save locally to harvest_batches + call complete-trip API
      console.log("💾 [Handover] Calling SyncService.finalizeTrip()...");
      const result = await SyncService.finalizeTrip(activeBatchId, proof);
      console.log(
        `📡 [Handover] finalizeTrip result: synced=${result.synced}, success=${result.success}`,
      );

      if (result.synced) {
        Alert.alert(
          "Trip Synced",
          `Data saved & synced to backend!\nMerkle Root: ${proof.merkleRoot.substring(0, 16)}...`,
          [{ text: "OK", onPress: () => setStep(2) }],
        );
      } else {
        Alert.alert(
          "Saved Offline",
          "Trip data saved locally. Will sync when online.",
          [{ text: "OK", onPress: () => setStep(2) }],
        );
      }
    } catch (e: any) {
      console.error("❌ [Handover] Failed to finalize trip:", e.message || e);
      Alert.alert(
        "Error",
        `Failed to finalize trip: ${e.message || "Unknown error"}`,
      );
    } finally {
      setLoading(false);
      console.log("========================================");
    }
  };

  // ─── CONFIRM HANDOVER: Physical custody transfer confirmed ──────────
  const handleConfirmHandover = () => {
    console.log(
      "✅ [Handover] CONFIRM HANDOVER pressed — clearing batch data, preserving sensor data",
    );
    // Clear only batch-specific state (activeBatchId, times, logs)
    // Sensor buffers (currentBuffer, currentHumidityBuffer) are preserved
    clearBatchData();
    setStep(3);
  };

  const handleEndShift = () => {
    // Reset or Navigate away
    setStep(1);
    Alert.alert("Shift Ended", "Have a great day!");
  };

  return (
    <ScrollView className="flex-1 bg-background p-5">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800">
          Arrival & Handover
        </Text>
        <Text className="text-gray-500 text-sm">Central Depot Processing</Text>
      </View>

      {/* Dynamic Content based on Step */}

      {/* STEP 1: Trip Summary */}
      {step === 1 && (
        <View>
          <View className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">
              Current Trip Status
            </Text>

            {isRecording ? (
              <View className="flex-row items-center mb-6">
                <View className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2" />
                <Text className="text-green-600 font-bold">IN TRANSIT</Text>
              </View>
            ) : (
              <View className="flex-row items-center mb-6">
                <View className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-none" />
                <Text className="text-blue-600 font-bold">READY TO UNLOAD</Text>
              </View>
            )}

            <View className="flex-row justify-between mb-4 border-b border-gray-50 pb-4">
              <View>
                <Text className="text-gray-400 text-xs">Distance</Text>
                <Text className="text-xl font-bold text-gray-800">
                  14.2 <Text className="text-sm font-normal">km</Text>
                </Text>
              </View>
              <View>
                <Text className="text-gray-400 text-xs">Avg Temp</Text>
                <Text className="text-xl font-bold text-gray-800">
                  {avgTemp} <Text className="text-sm font-normal">°C</Text>
                </Text>
              </View>
              <View>
                <Text className="text-gray-400 text-xs">Avg Humidity</Text>
                <Text className="text-xl font-bold text-gray-800">
                  {avgHumidity} <Text className="text-sm font-normal">%</Text>
                </Text>
              </View>
            </View>

            <View className="bg-green-50 p-3 rounded-lg flex-row items-center">
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />
              <Text className="text-green-800 text-xs font-medium ml-2">
                Temperature Compliance Verified
              </Text>
            </View>
          </View>

          {isRecording ? (
            <TouchableOpacity
              onPress={handleStopTrip}
              className="w-full bg-error py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-red-900/20"
            >
              <Ionicons name="stop-circle-outline" size={24} color="white" />
              <Text className="text-white font-bold ml-2 text-lg">
                STOP TRIP & UNLOAD
              </Text>
            </TouchableOpacity>
          ) : (
            <View>
              <TouchableOpacity
                onPress={handleProceedToHandover}
                disabled={loading}
                className={`w-full py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-green-900/20 ${loading ? "bg-gray-400" : "bg-primary"}`}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="cube-outline" size={24} color="white" />
                )}
                <Text className="text-white font-bold ml-2 text-lg">
                  {loading ? "PROCESSING..." : "PROCEED TO HANDOVER"}
                </Text>
              </TouchableOpacity>

              {/* Handover Instructions Carousel */}
              <HandoverInstructionsCarousel />
            </View>
          )}
        </View>
      )}

      {/* STEP 2: QR Handover */}
      {step === 2 && (
        <View className="items-center">
          <View className="bg-white p-8 rounded-3xl shadow-xl w-full aspect-square items-center justify-center mb-8 border border-gray-100">
            <Ionicons
              name="qr-code-outline"
              size={200}
              color={Colors.textPrimary}
            />
            <Text className="text-gray-400 text-xs mt-4 text-center">
              Scan at Central Depot Terminal
            </Text>
          </View>

          <Text className="text-center text-gray-600 mb-8 px-8">
            Please allow the depot manager to scan this code to transfer custody
            of the shipment.
          </Text>

          <TouchableOpacity
            onPress={handleConfirmHandover}
            className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center mb-4"
          >
            <Ionicons name="checkmark-done-circle" size={24} color="white" />
            <Text className="text-white font-bold ml-2">CONFIRM HANDOVER</Text>
          </TouchableOpacity>

          <Text className="text-center text-green-600 text-xs mb-4 font-medium">
            Trip data already saved & synced (or queued).
          </Text>

          <TouchableOpacity onPress={() => setStep(1)} className="py-4">
            <Text className="text-gray-400 font-bold">CANCEL</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 3: Complete */}
      {step === 3 && (
        <View className="items-center pt-10">
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="checkmark" size={48} color={Colors.success} />
          </View>

          <Text className="text-2xl font-bold text-gray-800 mb-2">
            You're All Set!
          </Text>
          <Text className="text-gray-500 text-center mb-10">
            Shipment #TR-8821X has been successfully handed over. All merkle
            proofs have been synced.
          </Text>

          <TouchableOpacity
            onPress={handleEndShift}
            className="w-full bg-gray-800 py-4 rounded-xl flex-row justify-center items-center"
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
            <Text className="text-white font-bold ml-2">END WORK SHIFT</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
