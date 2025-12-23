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

    // Logic: Bluetooth Lifecycle
    useBleSession({
        isRecording,
        onDataReceived: processIncomingData,
        onStatusChange: setConnectionStatus,
    });

    return null; // Render nothing
}
