import { ConnectionStatus } from "../enums/connectionStatus.enum";
import { useTripStore } from "../store/trip-store";

export const useTripManager = () => {
  // 1. Store Access
  const {
    isRecording,
    connectionStatus,
    setConnectionStatus,
    addLog,
    setRecording,
    clearLogs,
    clearTripData,
    clearBatchData,
  } = useTripStore();

  // 2. Public API
  return {
    isRecording,
    connectionStatus,
    currentBuffer: useTripStore((s) => s.currentBuffer),
    currentHumidityBuffer: useTripStore((s) => s.currentHumidityBuffer),
    logs: useTripStore((s) => s.logs),
    activeBatchId: useTripStore((s) => s.activeBatchId),
    batchStartTime: useTripStore((s) => s.batchStartTime),
    tripStartTime: useTripStore((s) => s.tripStartTime),
    tripEndTime: useTripStore((s) => s.tripEndTime),
    setActiveBatchId: useTripStore((s) => s.setActiveBatchId),
    startTrip: () => {
      // Logic handled by TripController (watching isRecording)
      clearLogs();
      setRecording(true);
      setConnectionStatus(ConnectionStatus.SCANNING);
      addLog("Trip started.");
    },
    stopTrip: () => {
      // Set recording to false — TripController will:
      //   1. Flush remaining buffer to DB
      //   2. Disconnect BLE via useBleSession cleanup
      setRecording(false);
      setConnectionStatus(ConnectionStatus.IDLE);
      addLog("Trip stopped.");
      // Note: We don't clear activeBatchId/tripStartTime here — needed for Handover
    },
    clearTripData,
    clearBatchData,
  };
};
