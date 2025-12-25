import SensorGraph from "@/src/components/SensorGraph";
import { Colors } from "@/src/constants/theme";
import { ConnectionStatus } from "@/src/enums/connectionStatus.enum";
import { useTripManager } from "@/src/hooks/useTripManager";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function TripStart() {
  const { isRecording, connectionStatus, currentBuffer, currentHumidityBuffer, startTrip, stopTrip } =
    useTripManager();

  // derived values
  const currentTemp = currentBuffer.length > 0 ? currentBuffer[currentBuffer.length - 1] : 0;
  const currentHumidity = currentHumidityBuffer && currentHumidityBuffer.length > 0
    ? currentHumidityBuffer[currentHumidityBuffer.length - 1]
    : 0;

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Map Placeholder */}
      <View className="h-64 w-full bg-gray-200 relative overflow-hidden">

        {/* Mock Map Grid */}
        <View className="absolute inset-0 opacity-10">
          <View className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </View>

        <View className="flex-1 items-center justify-center bg-blue-50/50">
          <Ionicons name="map" size={48} color={Colors.textSecondary} />
          <Text className="text-textSecondary text-xs mt-2 font-medium tracking-widest">GPS TRACKING ACTIVE</Text>
        </View>

        <View className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-white/50">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            <Text className="text-xs font-bold text-gray-700">LIVE</Text>
          </View>
        </View>
      </View>

      {/* Mission Control Panel */}
      <View className="-mt-10 rounded-t-3xl bg-surface flex-1 px-6 pt-8 pb-10 shadow-lg">

        {/* Header / Status */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Status</Text>
            <View className="flex-row items-center">
              <Ionicons
                name={connectionStatus === ConnectionStatus.RECEIVING ? "bluetooth" : "bluetooth-outline"}
                size={18}
                color={connectionStatus === ConnectionStatus.RECEIVING ? Colors.primary : Colors.textSecondary}
              />
              <Text className={`ml-2 font-bold ${connectionStatus === ConnectionStatus.RECEIVING ? 'text-primary' : 'text-gray-500'}`}>
                {connectionStatus}
              </Text>
            </View>
          </View>
          {isRecording && (
            <View className="bg-red-50 px-3 py-1 rounded-full border border-red-100 flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
              <Text className="text-red-500 text-xs font-bold">REC</Text>
            </View>
          )}
        </View>

        {/* Telemetry Cards */}
        <View className="flex-row justify-between mb-8">
          {/* Temp Card */}
          <View className="w-[48%] bg-green-50 rounded-2xl p-4 border border-green-100">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="thermometer-outline" size={20} color={Colors.primary} />
              <Text className="text-xs text-green-700 font-bold">TEMP</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-800">
              {isRecording && currentBuffer.length > 0 ? currentTemp.toFixed(1) : '--'}
              <Text className="text-lg text-gray-400 font-normal">°C</Text>
            </Text>
          </View>

          {/* Humidity Card (Mock) */}
          <View className="w-[48%] bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="water-outline" size={20} color="#0284c7" />
              <Text className="text-xs text-blue-700 font-bold">HUMIDITY</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-800">
              {isRecording && currentHumidity > 0 ? currentHumidity.toFixed(0) : '--'}
              <Text className="text-lg text-gray-400 font-normal">%</Text>
            </Text>
          </View>
        </View>

        {/* Graph Section */}
        <View className="mb-8">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Live Trend</Text>
          <SensorGraph
            tempData={currentBuffer}
            humidityData={currentHumidityBuffer}
          />
        </View>


        {/* Main Action Button */}
        {!isRecording ? (
          <TouchableOpacity
            onPress={startTrip}
            activeOpacity={0.9}
            className="w-full bg-primary py-4 rounded-xl shadow-lg shadow-green-900/40 items-center flex-row justify-center"
          >
            <Ionicons name="play" size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">START TRIP</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-full">
            <TouchableOpacity
              onPress={stopTrip}
              activeOpacity={0.9}
              className="w-full bg-white border-2 border-red-500 py-4 rounded-xl items-center flex-row justify-center mb-4"
            >
              <Ionicons name="stop" size={24} color={Colors.error} />
              <Text className="text-red-600 font-bold text-lg ml-2">END TRIP</Text>
            </TouchableOpacity>
            <Text className="text-center text-gray-400 text-xs">Hold to end trip safely</Text>
          </View>
        )}

      </View>
    </ScrollView>
  );
}
