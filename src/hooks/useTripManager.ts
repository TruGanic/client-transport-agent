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
  } = useTripStore();

  // 2. Public API
  return {
    isRecording,
    connectionStatus,
    currentBuffer: useTripStore((s) => s.currentBuffer),
    currentHumidityBuffer: useTripStore((s) => s.currentHumidityBuffer),
    logs: useTripStore((s) => s.logs),
    startTrip: () => {
      // Logic handled by TripController (watching isRecording)
      clearLogs();
      setRecording(true);
      setConnectionStatus(ConnectionStatus.SCANNING);
      addLog("Trip started.");
    },
    stopTrip: () => {
      // Logic handled by TripController
      setRecording(false);
      setConnectionStatus(ConnectionStatus.IDLE);
      addLog("Trip stopped.");
    },
  };
};
