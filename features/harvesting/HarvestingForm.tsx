import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function HarvestingForm() {
  const [batchId, setBatchId] = useState("");
  const [weight, setWeight] = useState("");

  function save() {
    // demo: front-end validation + pretend to save locally
    if (!batchId) {
      Alert.alert("Validation", "Please enter batch id");
      return;
    }
    Alert.alert("Saved", `Batch ${batchId} saved (weight ${weight})`);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Harvest</Text>
      <TextInput
        placeholder="Batch ID"
        value={batchId}
        onChangeText={setBatchId}
        style={styles.input}
      />
      <TextInput
        placeholder="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Save locally" onPress={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: "center" },
  title: { fontSize: 20, marginVertical: 12 },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
  },
});
