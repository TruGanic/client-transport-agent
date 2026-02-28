import { Colors } from "@/src/constants/theme";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

interface SensorGraphProps {
    tempData: number[];
    humidityData: number[];
}

export default function SensorGraph({ tempData, humidityData }: SensorGraphProps) {
    const screenWidth = Dimensions.get("window").width;

    // 1. Format Data for Gifted Charts
    const line1Data = tempData.map((val) => ({ value: val }));
    const line2Data = humidityData.map((val) => ({ value: val }));

    // 2. Default if empty
    if (line1Data.length === 0 && line2Data.length === 0) {
        return (
            <View className="h-48 items-center justify-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <Text className="text-gray-400 text-xs">Waiting for sensor data...</Text>
            </View>
        );
    }

    return (
        <View className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
            <View className="flex-row justify-between mb-4 px-2">
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                    <Text className="text-xs font-bold text-gray-600">Temp (°C)</Text>
                </View>
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
                    <Text className="text-xs font-bold text-gray-600">Humidity (%)</Text>
                </View>
            </View>

            <LineChart
                data={line1Data}
                data2={line2Data}
                height={180}
                color1={Colors.primary}
                color2="#3b82f6" // Blue-500
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
                yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
                noOfSections={4}
                maxValue={100} // Covering both Temp (0-40) and Humidity (0-100)
                width={screenWidth - 80} // Adjust for padding
                isAnimated
                animationDuration={500}
            />
        </View>
    );
}
