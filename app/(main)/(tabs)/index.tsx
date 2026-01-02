import HomeStatusCarousel from '@/src/components/HomeStatusCarousel';
import { ConnectionStatus } from '@/src/enums/connectionStatus.enum';
import { useTripManager } from '@/src/hooks/useTripManager';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function MainHome() {
  const router = useRouter();
  const { isRecording, connectionStatus, logs, currentBuffer, currentHumidityBuffer, activeBatchId } = useTripManager();

  // Derived state for UI
  const isConnected = connectionStatus === ConnectionStatus.RECEIVING;
  const statusColor = isRecording ? 'text-green-600' : 'text-gray-500';
  const statusBg = isRecording ? 'bg-green-100' : 'bg-gray-100';
  const statusLabel = isRecording ? 'Transport Active' : 'Vehicle Idle';

  const navigateTo = (path: any) => {
    router.push(path);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />

      {/* Header Section */}
      <View className="px-6 pt-8 pb-4 bg-surface rounded-b-3xl shadow-sm border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-gray-400 text-sm font-medium">Welcome back,</Text>
            <Text className="text-textPrimary text-2xl font-bold">Transport Agent</Text>
          </View>
          <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center">
            <Ionicons name="person" size={20} color="#2E7D32" />
          </View>
        </View>

        {/* Status Pill */}
        <View className={`self-start px-3 py-1 rounded-full flex-row items-center ${statusBg}`}>
          <View className={`w-2 h-2 rounded-full mr-2 ${isRecording ? 'bg-green-600 animate-pulse' : 'bg-gray-400 animate-none'}`} />
          <Text className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</Text>
        </View>
      </View>

      <View className="mt-6">

        {/* Main Status Carousel */}
        <HomeStatusCarousel
          isRecording={isRecording}
          activeBatchId={activeBatchId}
          connectionStatus={connectionStatus}
          bufferSize={currentBuffer.length}
          currentTemp={currentBuffer.length > 0 ? currentBuffer[currentBuffer.length - 1] : null}
          currentHumidity={currentHumidityBuffer && currentHumidityBuffer.length > 0 ? currentHumidityBuffer[currentHumidityBuffer.length - 1] : null}
        />


        {/* Quick Actions Grid */}
        <View className="px-5">
          <Text className="text-textPrimary text-lg font-bold mt-8 mb-4">Quick Actions</Text>

          <View className="flex-row flex-wrap justify-between">
            <ActionCard
              title="Start Trip"
              icon="navigate-outline"
              color="bg-blue-50"
              iconColor="#1E40AF"
              onPress={() => navigateTo('/(main)/(tabs)/trip-start')}
            />
            <ActionCard
              title="Sync Data"
              icon="cloud-upload-outline"
              color="bg-orange-50"
              iconColor="#C2410C"
              onPress={() => navigateTo('/(main)/sync-status')}
            />
            <ActionCard
              title="Harvest"
              icon="leaf-outline"
              color="bg-green-50"
              iconColor="#15803D"
              onPress={() => navigateTo('/(main)/(tabs)/harvesting')}
            />
            <ActionCard
              title="History"
              icon="time-outline"
              color="bg-purple-50"
              iconColor="#6B21A8"
              onPress={() => navigateTo('/(main)/history')}
            />
          </View>

          {/* Recent Activity Mini-List */}
          <Text className="text-textPrimary text-lg font-bold mt-6 mb-3">Recent Logs</Text>
          <View className="bg-surface rounded-xl p-4 shadow-sm border border-gray-100 mb-10">
            {logs.length === 0 ? (
              <Text className="text-gray-400 italic text-center py-2">No recent activity logged.</Text>
            ) : (
              logs.slice(0, 3).map((log, i) => (
                <View key={i} className="flex-row items-center border-b border-gray-50 py-2 last:border-0">
                  <View className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-3" />
                  <Text className="text-gray-600 text-xs flex-1" numberOfLines={1}>{log}</Text>
                </View>
              ))
            )}
            <TouchableOpacity onPress={() => navigateTo('/(main)/(tabs)/trip-start')} className="mt-2 self-end">
              <Text className="text-primary text-xs font-bold">VIEW ALL</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </ScrollView>
  );
}

// Helper Component for Grid
const ActionCard = ({ title, icon, color, iconColor, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className="w-[48%] bg-surface p-4 rounded-xl mb-4 shadow-sm border border-gray-100 items-start justify-between h-32"
  >
    <View className={`p-2 rounded-lg ${color}`}>
      <Ionicons name={icon} size={24} color={iconColor} />
    </View>
    <Text className="text-gray-700 font-bold mt-2">{title}</Text>
  </TouchableOpacity>
);
