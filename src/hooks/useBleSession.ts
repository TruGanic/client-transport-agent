import { useEffect, useRef } from "react";
import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { BLE_CONFIG } from "../constants/ble-config";
import { ConnectionStatus } from "../enums/connectionStatus.enum";
import { IBleSessionProps } from "../interfaces/IBleSessionProps";

// Initialize Singleton outside component
const bleManager = new BleManager();

export const useBleSession = ({
  isRecording,
  onDataReceived,
  onStatusChange,
}: IBleSessionProps) => {
  const deviceRef = useRef<Device | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);
  // Guard flag to prevent BLE callbacks from firing during/after cleanup
  const isActiveRef = useRef(false);
  // Prevent double cleanup (effect cleanup + new effect body)
  const cleanupDoneRef = useRef(false);

  useEffect(() => {
    if (!isRecording) {
      // Transitioning from recording → idle: clean up once
      if (isActiveRef.current && !cleanupDoneRef.current) {
        safeCleanup();
      }
      return;
    }

    // Starting a new recording session
    cleanupDoneRef.current = false;
    isActiveRef.current = true;

    onStatusChange(ConnectionStatus.SCANNING);

    bleManager.startDeviceScan(null, null, (error, device) => {
      // Guard: skip if session was stopped while scanning
      if (!isActiveRef.current) return;

      if (error) {
        console.error("BLE Scan Error:", error);
        if (isActiveRef.current) onStatusChange(ConnectionStatus.ERROR);
        return;
      }

      if (device?.name === BLE_CONFIG.TARGET_DEVICE_NAME) {
        bleManager.stopDeviceScan();
        connectToDevice(device);
      }
    });

    // Cleanup on effect teardown (e.g. component unmount)
    return () => {
      if (!cleanupDoneRef.current) {
        safeCleanup();
      }
    };
  }, [isRecording]);

  const connectToDevice = async (device: Device) => {
    if (!isActiveRef.current) return;

    onStatusChange(ConnectionStatus.CONNECTING);

    try {
      const connectedDevice = await device.connect();

      // Guard: session may have stopped during async connect
      if (!isActiveRef.current) {
        connectedDevice.cancelConnection().catch(() => {});
        return;
      }

      deviceRef.current = connectedDevice;
      await connectedDevice.discoverAllServicesAndCharacteristics();

      // Guard again after discovery
      if (!isActiveRef.current) {
        connectedDevice.cancelConnection().catch(() => {});
        deviceRef.current = null;
        return;
      }

      onStatusChange(ConnectionStatus.RECEIVING);

      // Subscribe to characteristic
      subscriptionRef.current = connectedDevice.monitorCharacteristicForService(
        BLE_CONFIG.SERVICE_UUID,
        BLE_CONFIG.CHAR_UUID,
        (error, characteristic) => {
          // Guard: ignore callbacks after cleanup
          if (!isActiveRef.current) return;

          if (error) {
            // This fires on disconnect — don't crash, just log
            console.warn(
              "BLE Monitor callback error (expected on disconnect):",
              error.message,
            );
            return;
          }

          if (characteristic?.value) {
            try {
              onDataReceived(characteristic.value);
            } catch (e) {
              console.error("Error in onDataReceived handler:", e);
            }
          }
        },
      );
    } catch (error) {
      console.error("Connection Failed:", error);
      if (isActiveRef.current) {
        onStatusChange(ConnectionStatus.LOST);
      }
      deviceRef.current = null;
    }
  };

  /**
   * Safe BLE teardown:
   * 1. Set guard flag to block any further callbacks
   * 2. Stop scanning
   * 3. Cancel connection (triggers native disconnect, fires monitor error callback)
   * 4. Remove subscription after a short delay to let native settle
   *
   * Key insight: we cancel connection FIRST so native side cleans up,
   * and the subscription error callback is guarded by isActiveRef.
   */
  const safeCleanup = () => {
    console.log("🛑 BLE Session — Safe Cleanup");

    // 1. Block all further callbacks immediately
    isActiveRef.current = false;
    cleanupDoneRef.current = true;

    // 2. Stop scanning
    bleManager.stopDeviceScan();

    // 3. Grab current refs then null them out (prevents re-entry)
    const dev = deviceRef.current;
    const sub = subscriptionRef.current;
    deviceRef.current = null;
    subscriptionRef.current = null;

    // 4. Remove subscription first (stops JS-side data delivery)
    if (sub) {
      try {
        sub.remove();
      } catch (_) {
        // Already removed
      }
    }

    // 5. Cancel connection with a small delay to let native layer settle
    //    after subscription removal — prevents Android native crash
    if (dev) {
      setTimeout(() => {
        dev.cancelConnection().catch(() => {
          // Already disconnected — safe to ignore
        });
      }, 150);
    }
  };
};
