import { useBleSession } from "@/src/hooks/useBleSession";
import { Buffer } from "buffer";
import { TransportService } from "../features/transport/transport.service";
import { useTripStore } from "../store/trip-store";

/**
 * Headless component that manages the BLE session and data processing.
 * This should be mounted ONCE at the root of the authenticated app.
 */
export default function TripController() {
    const { isRecording } = useTripStore();
    const setConnectionStatus = useTripStore((s) => s.setConnectionStatus);

    // Logic: Handle Data (Business Logic moved from useTripManager)
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
            const humidity = parseFloat(parts[2]); // Format: ID,TEMP,HUMIDITY

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
                const fullHumidityBuffer = [...(state.currentHumidityBuffer || []), humidity];

                const result = await TransportService.processBatch(
                    fullTempBuffer,
                    fullHumidityBuffer,
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

    // Logic: Bluetooth Lifecycle
    useBleSession({
        isRecording,
        onDataReceived: processIncomingData,
        onStatusChange: setConnectionStatus,
    });

    return null; // Render nothing
}
