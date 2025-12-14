import { Colors } from "@/constants/theme";
import { useTripManager } from "@/hooks/useTripManager";
import { useEffect, useRef } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { BleManager, Device, Subscription } from "react-native-ble-plx";
// Init BLE Manager Once
const bleManager = new BleManager();

// ⚠️ YOUR SIMULATOR UUIDS (Copy exactly from your Node.js script)
const SERVICE_UUID = "A07498CA-AD5B-474E-940D-16F1FBE7E8CD";
const CHAR_UUID = "51FF12BB-3ED8-46E5-B4F9-D64E2FEC021B";
const TARGET_DEVICE_NAME = 'LogisticsSim';

export default function TripStart() {
  const { 
    isRecording, 
    connectionStatus, 
    setConnectionStatus, 
    logs, 
    startTrip, 
    stopTrip, 
    handleIncomingData 
  } = useTripManager();

  // Keep track of the active device/sub to clean up properly
  const deviceRef = useRef<Device | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    const scanAndConnect = () => {
      setConnectionStatus("Scanning...");
      
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error("Scan Error:", error);
          setConnectionStatus("Scan Error");
          return;
        }

        if (device?.name === TARGET_DEVICE_NAME) {
          bleManager.stopDeviceScan();
          setConnectionStatus("Connecting...");
          
          device.connect()
            .then((connectedDevice) => {
              deviceRef.current = connectedDevice; // Save reference
              return connectedDevice.discoverAllServicesAndCharacteristics();
            })
            .then((connectedDevice) => {
              setConnectionStatus("Receiving Data 🟢");
              
              const sub = connectedDevice.monitorCharacteristicForService(
                SERVICE_UUID,
                CHAR_UUID,
                (error, characteristic) => {
                  if (error) {
                    console.log("Subscription Error (Expected if stopped):", error.message);
                    return;
                  }
                  if (characteristic?.value) {
                    handleIncomingData(characteristic.value);
                  }
                }
              );
              subscriptionRef.current = sub; // Save reference
            })
            .catch((err) => {
              console.error("Connection Failed", err);
              setConnectionStatus("Connection Failed 🔴");
              // Don't call stopTrip() here automatically to avoid infinite loops
            });
        }
      });
    };

    // LOGIC:
    // If we are recording, but the status is NOT "Receiving Data" (e.g., we just switched tabs),
    // we should try to reconnect.
    if (isRecording) {
        scanAndConnect();
    }

    // CLEANUP FUNCTION (Runs on Tab Switch or Stop)
    return () => {
      console.log("Cleaning up BLE...");
      bleManager.stopDeviceScan();
      
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }

      if (deviceRef.current) {
        // Optional: Cancel connection on tab switch? 
        // For research apps, usually yes, to save battery.
        deviceRef.current.cancelConnection().catch(() => {});
        deviceRef.current = null;
      }
    };
  }, [isRecording]); 
  // ^ Depend only on isRecording. This ensures it runs when you toggle Start/Stop.

  return (
    <View style={styles.container}>
      {/* CARD UI */}
      <View style={styles.card}>
        <Text style={styles.header}>Trip Status</Text>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: 'bold', 
          color: connectionStatus.includes("Receiving") ? Colors.success : Colors.textSecondary,
          marginBottom: 20
        }}>
          {connectionStatus}
        </Text>

        {!isRecording ? (
          <Button title="START TRIP" onPress={startTrip} color={Colors.primary} />
        ) : (
          <Button title="STOP TRIP" onPress={stopTrip} color={Colors.error} />
        )}
      </View>

      <Text style={styles.subHeader}>Live Data Logs:</Text>
      <FlatList
        data={logs}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => <Text style={styles.logItem}>{item}</Text>}
        style={{ flex: 1, width: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#F4F6F8' },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  logItem: { fontSize: 12, marginVertical: 2, color: '#333' }
});