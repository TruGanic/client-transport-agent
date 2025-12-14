import { Buffer } from 'buffer';
import { TransportService } from '../features/transport/transport.service';
import { useTripStore } from '../store/trip-store';

export const useTripManager = () => {
  const { 
    isRecording,
    connectionStatus,
    setConnectionStatus, 
    currentBuffer, 
    batchStartTime,
    logs,
    setRecording, 
    addToBuffer, 
    resetBuffer, 
    addLog,
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

  /**
   * 📡 HANDLES INCOMING BLE DATA
   * Expected Format: "AssetID,Temp,Hum,Status"
   * Example: "Truck_7,27.0,67.8,Delayed"
   */
  const handleIncomingData = async (base64Value: string) => {
    if (!isRecording) return;

    try {
      // 1. Decode Base64 -> String
      const rawString = Buffer.from(base64Value, 'base64').toString('utf-8');
      // Result: "Truck_7,27.0,67.8,Delayed"

      // 2. Parse the CSV String
      const parts = rawString.split(',');
      
      // Safety Check: Ensure we have at least 3 parts (ID, Temp, Hum)
      if (parts.length < 3) {
        console.warn("Invalid Data Packet:", rawString);
        return;
      }

      // 3. Extract Values (Index 1 is Temp, Index 2 is Humidity)
      const temp = parseFloat(parts[1]);     // "27.0" -> 27.0
      const humidity = parseFloat(parts[2]); // "67.8" -> 67.8

      if (isNaN(temp)) return; 

      // ✅ ADD THIS LINE: Print to your Computer Terminal
      console.log(`📡 BLE RECEIVED: ${temp}°C`); 

      // ✅ ADD THIS LINE: Print to the Mobile App Screen (Temporary)
      addLog(`Tempreture: ${temp}°C`);

      if (isNaN(temp)) return; // Skip garbage data

      // 4. Update UI Log (Show user what we found)
      // addLog(`Rx: ${temp}°C | ${humidity}%`); // Optional verbose log

      // 5. Add to Buffer (For Averaging)
      // Note: We are currently averaging ONLY Temperature. 
      // If you want to store Humidity too, we need to update the Store/DB schema.
      // For now, let's stick to Temperature as per previous schema.
      addToBuffer(temp);

      // 6. Check Business Logic (Batch Full?)
      // We pass the *anticipated* new buffer length (current + 1)
      if (TransportService.shouldProcessBatch(currentBuffer.length + 1)) {
        
        const tempBuffer = [...currentBuffer, temp]; 
        const result = await TransportService.processBatch(tempBuffer, batchStartTime || Date.now());

        if (result?.success) {
          addLog(`✅ Saved Batch. Avg: ${result.avg?.toFixed(1)}°C`);
          resetBuffer(); 
        }
      }
      
    } catch (e) {
      console.error("Parse Error:", e);
    }
  };

  return {
    isRecording,
    connectionStatus,
    setConnectionStatus,
    logs,
    startTrip,
    stopTrip,
    handleIncomingData
  };
};