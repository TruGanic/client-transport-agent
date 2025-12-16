import { Colors } from "@/src/constants/theme";
import { ConnectionStatus } from "@/src/enums/connectionStatus.enum";
import { useTripManager } from "@/src/hooks/useTripManager";

import React from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";

export default function TripStart() {
  const { isRecording, connectionStatus, logs, startTrip, stopTrip } =
    useTripManager();

  const isConnected = connectionStatus === ConnectionStatus.RECEIVING;

  return (
    <View style={styles.container}>
      {/* Status Card */}
      <View style={styles.card}>
        <Text style={styles.header}>Trip Status</Text>
        <Text
          style={[
            styles.statusText,
            { color: isConnected ? Colors.success : Colors.textSecondary },
          ]}
        >
          {connectionStatus}
        </Text>

        {!isRecording ? (
          <Button
            title="START TRIP"
            onPress={startTrip}
            color={Colors.primary}
          />
        ) : (
          <Button title="STOP TRIP" onPress={stopTrip} color={Colors.error} />
        )}
      </View>

      {/* Logs Area */}
      <Text style={styles.subHeader}>Live Data Logs:</Text>
      <FlatList
        data={logs}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => <Text style={styles.logItem}>{item}</Text>}
        style={styles.list}
        initialNumToRender={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#F4F6F8",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  statusText: { fontSize: 16, fontWeight: "bold", marginBottom: 20 },
  subHeader: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  logItem: {
    fontSize: 12,
    marginVertical: 2,
    color: "#333",
    fontFamily: "monospace",
  }, // Monospace is good for logs
  list: { flex: 1, width: "100%" },
});
