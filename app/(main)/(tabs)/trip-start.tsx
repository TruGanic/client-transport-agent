import { useEffect, useRef } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { Colors } from "../../../src/constants/theme";
import { useTripManager } from "../../../src/hooks/useTripManager";

// Initialize once
const bleManager = new BleManager();

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

  const deviceRef = useRef<Device | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    const scanAndConnect = () => {
      // Avoid restarting scan if already connected
      if (connectionStatus.includes("Receiving")) return;

      setConnectionStatus("Scanning...");
      
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          // Handle Bluetooth being off gracefully
          console.log("Scan Error:", error.message);
          setConnectionStatus("Scan Error (Check BLE)");
          return;
        }

        if (device?.name === TARGET_DEVICE_NAME) {
          bleManager.stopDeviceScan();
          setConnectionStatus("Connecting...");
          
          device.connect()
            .then((connectedDevice) => {
              deviceRef.current = connectedDevice;
              return connectedDevice.discoverAllServicesAndCharacteristics();
            })
            .then((connectedDevice) => {
              setConnectionStatus("Receiving Data 🟢");
              
              const sub = connectedDevice.monitorCharacteristicForService(
                SERVICE_UUID,
                CHAR_UUID,
                (error, characteristic) => {
                  // CRASH FIX: Check if we are still recording before processing
                  // This prevents updates after "Stop" is pressed
                  if (error) {
                     // This error is normal when we cancel connection
                     return;
                  }
                  if (characteristic?.value) {
                    handleIncomingData(characteristic.value);
                  }
                }
              );
              subscriptionRef.current = sub;
            })
            .catch((err) => {
              console.log("Connection Failed:", err.message);
              setConnectionStatus("Connection Lost 🔴");
              // Do NOT call stopTrip() here, simply let it retry or stay in error state
            });
        }
      });
    };

    // 1. If Recording is ON, start the logic
    if (isRecording) {
      scanAndConnect();
    }

    // 2. CLEANUP (Runs when 'isRecording' becomes false OR tab closes)
    return () => {
      console.log("🛑 Cleanup Triggered");
      bleManager.stopDeviceScan();
      
      // Remove subscription first to stop data flow
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }

      // Cancel connection safely
      if (deviceRef.current) {
        const deviceToDisconnect = deviceRef.current;
        deviceRef.current = null; // Clear ref immediately so UI knows it's gone
        
        deviceToDisconnect.cancelConnection()
            .then(() => console.log("Disconnected successfully"))
            .catch((err) => console.log("Disconnect ignored:", err.message));
      }
    };
  }, [isRecording]); 

  return (
    <View style={styles.container}>
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