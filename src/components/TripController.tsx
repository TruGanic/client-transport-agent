// import { useBleSession } from "@/src/hooks/useBleSession"; // Original BLE
import { useSimulatedSensor } from "@/src/hooks/useSimulatedSensor";
import { Buffer } from "buffer";
import { useEffect, useRef } from "react";
import { TransportService } from "../features/transport/transport.service";
import { useTripStore } from "../store/trip-store";

/**
 * Headless component that manages the BLE session and data processing.
 * This should be mounted ONCE at the root of the authenticated app.
 */
export default function TripController() {
  const isRecording = useTripStore((s) => s.isRecording);
  const setConnectionStatus = useTripStore((s) => s.setConnectionStatus);
  const prevRecordingRef = useRef(isRecording);

  /**
   * Detect recording → stopped transition.
   * Flush the remaining partial buffer to DB so no sensor data is lost.
   */
  useEffect(() => {
    if (prevRecordingRef.current && !isRecording) {
      // Trip just stopped — save any remaining readings as a final partial batch
      const state = useTripStore.getState();
      const tempBuf = [...state.currentBuffer];
      const humBuf = [...(state.currentHumidityBuffer || [])];

      if (tempBuf.length > 0) {
        console.log(`💾 Flushing final batch (${tempBuf.length} readings)...`);
        TransportService.processBatch(
          tempBuf,
          humBuf,
          state.batchStartTime || Date.now(),
        )
          .then((result) => {
            if (result.success) {
              console.log(
                `✅ Final partial batch saved (avg: ${result.avg?.toFixed(1)}°C)`,
              );
              useTripStore
                .getState()
                .addLog(`✅ Final batch saved (${tempBuf.length} readings)`);
              useTripStore.getState().resetBuffer();
            }
          })
          .catch((e) => console.error("Failed to save final batch:", e));
      }
    }
    prevRecordingRef.current = isRecording;
  }, [isRecording]);

  /**
   * Process incoming BLE data.
   * Reads fresh state from the store (avoids stale closure issues).
   * Buffers readings and saves to DB when batch is full.
   */
  const processIncomingData = async (base64Value: string) => {
    // Get Fresh State directly (Stale Closure Fix)
    const state = useTripStore.getState();
    if (!state.isRecording) return;

    try {
      const rawString = Buffer.from(base64Value, "base64").toString("utf-8");
      const parts = rawString.split(",");

      // Validation: expect format "ID,TEMP,HUMIDITY"
      if (parts.length < 3) return;

      const temp = parseFloat(parts[1]);
      const humidity = parseFloat(parts[2]);

      if (isNaN(temp) || isNaN(humidity)) return;

      // Update UI
      console.log(`📡 BLE: ${temp}°C | ${humidity}%`);
      state.addLog(`T: ${temp}°C H: ${humidity}%`);

      // Add to Buffer & Check Batch
      const freshBuffer = state.currentBuffer;
      state.addToBuffer(temp, humidity);

      if (TransportService.shouldProcessBatch(freshBuffer.length + 1)) {
        console.log("⚡ Batch Full. Processing...");

        const fullTempBuffer = [...freshBuffer, temp];
        const fullHumidityBuffer = [
          ...(state.currentHumidityBuffer || []),
          humidity,
        ];

        const result = await TransportService.processBatch(
          fullTempBuffer,
          fullHumidityBuffer,
          state.batchStartTime || Date.now(),
        );

        if (result.success) {
          state.addLog(`✅ Saved Batch. Avg: ${result.avg?.toFixed(1)}°C`);
          state.resetBuffer();
        } else {
          state.addLog(`❌ Save Error`);
        }
      }
    } catch (e) {
      console.error("Data Parse Error:", e);
    }
  };

  // BLE Lifecycle — starts/stops based on isRecording
  // Using simulated sensor instead of real BLE to avoid crashes
  useSimulatedSensor({
    isRecording,
    onDataReceived: processIncomingData,
    onStatusChange: setConnectionStatus,
  });

  return null; // Render nothing
}
