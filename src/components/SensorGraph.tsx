import { Colors } from "@/src/constants/theme";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

interface SensorGraphProps {
  tempData: number[];
  humidityData: number[];
}

export default function SensorGraph({
  tempData,
  humidityData,
}: SensorGraphProps) {
  const screenWidth = Dimensions.get("window").width;

  // 1. Format Data for Gifted Charts
  const line1Data = tempData.map((val) => ({ value: val }));
  const line2Data = humidityData.map((val) => ({ value: val }));

  // 2. Default if empty
  if (line1Data.length === 0 && line2Data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Waiting for sensor data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#22c55e" }]} />
          <Text style={styles.legendLabel}>Temp (°C)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#3b82f6" }]} />
          <Text style={styles.legendLabel}>Humidity (%)</Text>
        </View>
      </View>

      <LineChart
        data={line1Data}
        data2={line2Data}
        height={180}
        color1={Colors.primary}
        color2="#3b82f6"
        startFillColor1={Colors.primary}
        startFillColor2="#3b82f6"
        endFillColor1={Colors.primary}
        endFillColor2="#3b82f6"
        startOpacity={0.2}
        endOpacity={0.0}
        thickness={2}
        curved
        hideDataPoints
        initialSpacing={10}
        spacing={20}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor="#e5e7eb"
        rulesType="solid"
        rulesColor="#f3f4f6"
        yAxisTextStyle={{ color: "#9ca3af", fontSize: 10 }}
        noOfSections={4}
        maxValue={100}
        width={screenWidth - 80}
        isAnimated
        animationDuration={500}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    height: 192,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderStyle: "dashed",
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  chartContainer: {
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4b5563",
  },
});
