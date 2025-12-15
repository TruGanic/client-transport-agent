import { useEffect, useRef } from "react";
import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { BLE_CONFIG, ConnectionStatus } from "../types/transport.types";

// Initialize Singleton outside component
const bleManager = new BleManager();

interface BleSessionProps {
  isRecording: boolean;
  onDataReceived: (base64Data: string) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

export const useBleSession = ({
  isRecording,
  onDataReceived,
  onStatusChange,
}: BleSessionProps) => {
  const deviceRef = useRef<Device | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    if (!isRecording) {
      cleanup();
      return;
    }

    const startScan = () => {
      // Prevent double scanning loop
      if (deviceRef.current) return;

      onStatusChange(ConnectionStatus.SCANNING);

      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error("BLE Scan Error:", error);
          onStatusChange(ConnectionStatus.ERROR);
          return;
        }

        if (device?.name === BLE_CONFIG.TARGET_DEVICE_NAME) {
          bleManager.stopDeviceScan();
          connectToDevice(device);
        }
      });
    };

    const connectToDevice = async (device: Device) => {
      onStatusChange(ConnectionStatus.CONNECTING);
      try {
        const connectedDevice = await device.connect();
        deviceRef.current = connectedDevice;

        await connectedDevice.discoverAllServicesAndCharacteristics();
        onStatusChange(ConnectionStatus.RECEIVING);

        // Subscribe to Char
        subscriptionRef.current =
          connectedDevice.monitorCharacteristicForService(
            BLE_CONFIG.SERVICE_UUID,
            BLE_CONFIG.CHAR_UUID,
            (error, characteristic) => {
              if (error) {
                // Ignore intentional disconnect errors
                return;
              }
              if (characteristic?.value) {
                onDataReceived(characteristic.value);
              }
            }
          );
      } catch (error) {
        console.error("Connection Failed:", error);
        onStatusChange(ConnectionStatus.LOST);
        deviceRef.current = null;
      }
    };

    // Start Logic
    startScan();

    // Cleanup Function
    return () => cleanup();
  }, [isRecording]); // Re-run only when recording toggles

  const cleanup = () => {
    console.log("🛑 BLE Session Cleanup");
    bleManager.stopDeviceScan();
    subscriptionRef.current?.remove();
    deviceRef.current?.cancelConnection().catch(() => {});

    deviceRef.current = null;
    subscriptionRef.current = null;
  };
};
