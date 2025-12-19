import { Buffer } from "buffer";
import { ConnectionStatus } from "../enums/connectionStatus.enum";
import { TransportService } from "../features/transport/transport.service";
import { useTripStore } from "../store/trip-store";
import { useBleSession } from "./useBleSession";

export const useTripManager = () => {
  // 1. Store Access
  const {
    isRecording,
    connectionStatus,
    setConnectionStatus,
    addLog,
    setRecording,
    clearLogs,
  } = useTripStore();

  // 2. Logic: Handle Data (Business Logic)
  const processIncomingData = async (base64Value: string) => {
    //  Get Fresh State directly (Stale Closure Fix)
    const state = useTripStore.getState();
    if (!state.isRecording) return;

    try {
      const rawString = Buffer.from(base64Value, "base64").toString("utf-8");
      const parts = rawString.split(",");

      // Validation
      if (parts.length < 3) return;
      const temp = parseFloat(parts[1]);
      if (isNaN(temp)) return;

      // Update UI
      console.log(`📡 BLE: ${temp}°C`);
      state.addLog(`T: ${temp}°C`);

      // Add to Buffer & Check Batch
      const freshBuffer = state.currentBuffer;
      state.addToBuffer(temp);

      if (TransportService.shouldProcessBatch(freshBuffer.length + 1)) {
        console.log("⚡ Batch Full. Processing...");

        const fullBatch = [...freshBuffer, temp];
        const result = await TransportService.processBatch(
          fullBatch,
          state.batchStartTime || Date.now()
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

  // 3. Logic: Bluetooth Lifecycle (Delegated to specialized hook)
  useBleSession({
    isRecording,
    onDataReceived: processIncomingData,
    onStatusChange: setConnectionStatus,
  });

  // 4. Public API
  return {
    isRecording,
    connectionStatus,
    currentBuffer: useTripStore((s) => s.currentBuffer),
    logs: useTripStore((s) => s.logs),
    startTrip: () => {
      clearLogs();
      setRecording(true);
      setConnectionStatus(ConnectionStatus.SCANNING);
      addLog("Trip started.");
    },
    stopTrip: () => {
      setRecording(false);
      setConnectionStatus(ConnectionStatus.IDLE);
      addLog("Trip stopped.");
    },
  };
};
