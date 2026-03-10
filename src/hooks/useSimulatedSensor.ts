import { Buffer } from "buffer";
import { useEffect, useRef } from "react";
import { ConnectionStatus } from "../enums/connectionStatus.enum";
import { IBleSessionProps } from "../interfaces/IBleSessionProps";

/**
 * Drop-in replacement for useBleSession that generates realistic sensor data.
 * Mimics the exact same interface: IBleSessionProps (isRecording, onDataReceived, onStatusChange).
 *
 * Data format matches the real BLE device: Base64-encoded "ID,TEMP,HUMIDITY" CSV.
 *
 * Simulates:
 * - Realistic connection delay (scanning → connecting → receiving)
 * - Temperature drift around a base value with Perlin-like noise
 * - Humidity that inversely correlates with temperature (realistic)
 * - Occasional micro-fluctuations that mimic real sensor jitter
 * - Gradual trend shifts over time (e.g., vehicle moving through zones)
 */

// ─── Noise / Drift Helpers ───────────────────────────────────────────
function gaussianRandom(mean: number, stdDev: number): number {
  // Box-Muller transform for gaussian distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

/**
 * Generates a realistic sensor reading with drift and jitter.
 * Uses a hidden state machine to create believable temperature curves:
 * - Base temp slowly drifts (simulating ambient changes)
 * - Short-term jitter layer (sensor noise ~±0.3°C)
 * - Occasional "events" like door opens (temp spike)
 */
class SensorSimulator {
  private readingId = 0;
  private baseTemp: number;
  private baseHumidity: number;
  private tempDrift = 0;
  private humidityDrift = 0;
  private driftDirection = 1;
  private readingsSinceDriftChange = 0;

  constructor() {
    // Start with a realistic cold-chain temperature range
    this.baseTemp = gaussianRandom(4.5, 1.2); // 2–7°C range (cold chain)
    this.baseHumidity = gaussianRandom(68, 5); // 60–75% typical refrigerated
  }

  nextReading(): { id: number; temp: number; humidity: number } {
    this.readingId++;
    this.readingsSinceDriftChange++;

    // Slow drift: change direction every 30-80 readings
    if (this.readingsSinceDriftChange > 30 + Math.random() * 50) {
      this.driftDirection = -this.driftDirection;
      this.readingsSinceDriftChange = 0;
    }

    // Apply gradual drift (0.02°C per reading)
    this.tempDrift += this.driftDirection * gaussianRandom(0.02, 0.01);
    this.tempDrift = Math.max(-3, Math.min(3, this.tempDrift)); // clamp

    // Humidity inversely correlates with temp changes
    this.humidityDrift += -this.driftDirection * gaussianRandom(0.15, 0.08);
    this.humidityDrift = Math.max(-8, Math.min(8, this.humidityDrift));

    // Occasional door-open event (~2% chance): temp spikes by 1-3°C
    let eventSpike = 0;
    let humidityDrop = 0;
    if (Math.random() < 0.02) {
      eventSpike = gaussianRandom(2.0, 0.5);
      humidityDrop = -gaussianRandom(5, 2);
    }

    // Final values with sensor jitter
    const temp = this.baseTemp + this.tempDrift + eventSpike + gaussianRandom(0, 0.25);
    const humidity = this.baseHumidity + this.humidityDrift + humidityDrop + gaussianRandom(0, 1.2);

    return {
      id: this.readingId,
      temp: Math.round(temp * 10) / 10, // 1 decimal place
      humidity: Math.round(Math.max(30, Math.min(95, humidity)) * 10) / 10,
    };
  }

  reset() {
    this.readingId = 0;
    this.tempDrift = 0;
    this.humidityDrift = 0;
    this.driftDirection = 1;
    this.readingsSinceDriftChange = 0;
    this.baseTemp = gaussianRandom(4.5, 1.2);
    this.baseHumidity = gaussianRandom(68, 5);
  }
}

// ─── Encode to Base64 (same format as real BLE device) ───────────────
function encodeAsBase64(id: number, temp: number, humidity: number): string {
  const csv = `${id},${temp},${humidity}`;
  return Buffer.from(csv, "utf-8").toString("base64");
}

// ─── The Hook ─────────────────────────────────────────────────────────
export const useSimulatedSensor = ({
  isRecording,
  onDataReceived,
  onStatusChange,
}: IBleSessionProps) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simulatorRef = useRef(new SensorSimulator());
  const isActiveRef = useRef(false);

  useEffect(() => {
    if (!isRecording) {
      // Clean up if was active
      if (isActiveRef.current) {
        cleanup();
      }
      return;
    }

    // Start simulation — mimic BLE connection sequence
    isActiveRef.current = true;
    simulatorRef.current.reset();
    onStatusChange(ConnectionStatus.SCANNING);

    // Phase 1: Scanning delay (600-1200ms) — feels like real device discovery
    const scanDelay = 600 + Math.random() * 600;
    const scanTimer = setTimeout(() => {
      if (!isActiveRef.current) return;
      onStatusChange(ConnectionStatus.CONNECTING);

      // Phase 2: Connection delay (400-800ms) — feels like BLE GATT connection
      const connectDelay = 400 + Math.random() * 400;
      const connectTimer = setTimeout(() => {
        if (!isActiveRef.current) return;
        onStatusChange(ConnectionStatus.RECEIVING);

        // Phase 3: Start emitting sensor readings every 3 seconds
        // (matches real BLE device interval)
        intervalRef.current = setInterval(() => {
          if (!isActiveRef.current) return;

          const reading = simulatorRef.current.nextReading();
          const base64Data = encodeAsBase64(reading.id, reading.temp, reading.humidity);
          onDataReceived(base64Data);
        }, 3000);
      }, connectDelay);

      // Store connect timer for cleanup
      (intervalRef as any)._connectTimer = connectTimer;
    }, scanDelay);

    // Store scan timer for cleanup
    (intervalRef as any)._scanTimer = scanTimer;

    return () => {
      cleanup();
    };
  }, [isRecording]);

  const cleanup = () => {
    console.log("🛑 Simulated Sensor — Cleanup");
    isActiveRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clear any pending connection timers
    if ((intervalRef as any)?._scanTimer) {
      clearTimeout((intervalRef as any)._scanTimer);
      (intervalRef as any)._scanTimer = null;
    }
    if ((intervalRef as any)?._connectTimer) {
      clearTimeout((intervalRef as any)._connectTimer);
      (intervalRef as any)._connectTimer = null;
    }
  };
};
