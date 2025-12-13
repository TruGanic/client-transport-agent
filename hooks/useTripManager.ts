import { TransportService } from '../features/transport/transport.service';
import { useTripStore } from '../store/trip-store';

export const useTripManager = () => {
  // 1. Select state from Store
  const { 
    isRecording, 
    currentBuffer, 
    batchStartTime,
    logs,
    setRecording, 
    addToBuffer, 
    resetBuffer, 
    addLog,
    clearLogs 
  } = useTripStore();

  // 2. Start Action
  const startTrip = () => {
    clearLogs();
    setRecording(true);
    addLog("Trip started. Scanning for sensors...");
  };

  // 3. Stop Action
  const stopTrip = () => {
    // Optional: Process remaining data in buffer before stopping?
    setRecording(false);
    addLog("Trip stopped.");
  };

  // 4. Data Handling Action (Called when BLE receives data)
  const handleIncomingData = async (value: number) => {
    if (!isRecording) return;

    // Update Store UI
    addToBuffer(value);

    // Check Business Logic (Service)
    // "buffer" here is technically the *previous* state + new value. 
    // Ideally, we pass the new array, but for simplicity:
    const tempBuffer = [...currentBuffer, value]; 

    if (TransportService.shouldProcessBatch(tempBuffer.length)) {
      
      // Perform Heavy Lifting (Async DB Write)
      // Note: We use the batchStartTime from store
      const result = await TransportService.processBatch(tempBuffer, batchStartTime || Date.now());

      if (result?.success) {
        addLog(`Batch Saved. Avg: ${result.avg?.toFixed(2)}`);
        resetBuffer(); // Clear store buffer
      } else {
        addLog("Error saving batch!");
      }
    }
  };

  return {
    isRecording,
    logs,
    startTrip,
    stopTrip,
    handleIncomingData
  };
};