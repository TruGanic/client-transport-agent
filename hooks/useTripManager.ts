import { Buffer } from 'buffer';
import { TransportService } from '../features/transport/transport.service';
// 1. Import the store object itself, not just the hook
import { useTripStore } from '../store/trip-store';

export const useTripManager = () => {
  // Keep these for the UI (React needs these to update the screen)
  const { 
    setConnectionStatus, 
    addLog,
    setRecording,
    clearLogs
  } = useTripStore();

  const startTrip = () => {
    clearLogs();
    setRecording(true);
    setConnectionStatus("Scanning...");
    addLog("Trip started.");
  };

  const stopTrip = () => {
    setRecording(false);
    setConnectionStatus("Idle");
    addLog("Trip stopped.");
  };

  const handleIncomingData = async (base64Value: string) => {
    // 🔥 CRITICAL FIX: Get fresh state directly inside the function
    const state = useTripStore.getState();

    // Check the FRESH 'isRecording' value
    if (!state.isRecording) return; 

    try {
      const rawString = Buffer.from(base64Value, 'base64').toString('utf-8');
      const parts = rawString.split(',');
      
      if (parts.length < 3) return;

      const temp = parseFloat(parts[1]); 
      if (isNaN(temp)) return;

      // Log to show it's working
      console.log(`📡 BLE: ${temp}°C | Buffer: ${state.currentBuffer.length}`);
      state.addLog(`T: ${temp}°C`); // Update UI

      // 🔥 CRITICAL FIX: Use 'state.currentBuffer' (Fresh) instead of 'currentBuffer' (Stale)
      const freshBuffer = state.currentBuffer;

      // 1. Add to the UI buffer immediately
      state.addToBuffer(temp);

      // 2. Check Logic: Use the fresh length
      if (TransportService.shouldProcessBatch(freshBuffer.length + 1)) {
        
        console.log("⚡ BATCH FULL! PROCESSING NOW..."); // Debug Log

        // Construct the full batch manually to be safe
        const fullBatch = [...freshBuffer, temp]; 
        
        const result = await TransportService.processBatch(
          fullBatch, 
          state.batchStartTime || Date.now()
        );

        if (result?.success) {
          state.addLog(`✅ Saved Batch. Avg: ${result.avg?.toFixed(1)}°C`);
          state.resetBuffer(); 
        } else {
          console.error("❌ Save Failed:", result?.error);
        }
      }
      
    } catch (e) {
      console.error("Parse Error:", e);
    }
  };

  return {
    // Export state from the hook for the UI
    isRecording: useTripStore(s => s.isRecording),
    connectionStatus: useTripStore(s => s.connectionStatus),
    setConnectionStatus: useTripStore(s => s.setConnectionStatus),
    logs: useTripStore(s => s.logs),
    startTrip,
    stopTrip,
    handleIncomingData
  };
};