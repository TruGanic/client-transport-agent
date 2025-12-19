import { Colors } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface BatchItem {
  id: string;
  time: string;
  size: number;
  status: 'synced' | 'pending' | 'failed';
  hash: string;
}

const MOCK_BATCHES: BatchItem[] = [
  { id: 'B-1029', time: '10:42 AM', size: 50, status: 'pending', hash: '0x8f...2a' },
  { id: 'B-1028', time: '10:35 AM', size: 50, status: 'pending', hash: '0x3c...9b' },
  { id: 'B-1027', time: '10:20 AM', size: 50, status: 'synced', hash: '0x1a...4d' },
];

export default function SyncStatusScreen() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <ScrollView className="flex-1 bg-background p-5">

      {/* 1. Merkle Tree Visualizer Card */}
      <View className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 items-center">
        <View className="mb-4 bg-blue-50 p-4 rounded-full">
          <Ionicons name="git-network-outline" size={40} color={Colors.secondary} />
        </View>
        <Text className="text-lg font-bold text-gray-800">Merkle Root Status</Text>
        <Text className="text-gray-400 text-sm mb-6 text-center px-4">
          Aggregating sensor batches into a verifiable cryptographic proof.
        </Text>

        <View className="flex-row items-center space-x-2">
          <View className="items-center">
            <View className="w-3 h-3 bg-green-500 rounded-full mb-1" />
            <View className="w-0.5 h-4 bg-gray-200" />
          </View>
          <View className="items-center">
            <View className="w-3 h-3 bg-green-500 rounded-full mb-1" />
            <View className="w-0.5 h-4 bg-gray-200" />
          </View>
          <View className="items-center">
            <View className="w-3 h-3 bg-gray-300 rounded-full mb-1" />
            <View className="w-0.5 h-4 bg-gray-200" />
          </View>
        </View>
        <View className="w-32 h-0.5 bg-gray-200 mb-1" />
        <View className="w-4 h-4 border-2 border-primary rounded-sm" />
        <Text className="text-xs font-mono text-primary mt-2">ROOTHASH: PENDING...</Text>
      </View>

      {/* 2. Sync Action */}
      <TouchableOpacity
        onPress={handleSync}
        disabled={isSyncing}
        className={`w-full py-4 rounded-xl flex-row justify-center items-center mb-8 shadow-sm ${isSyncing ? 'bg-gray-100' : 'bg-secondary'}`}
      >
        {isSyncing ? (
          <Text className="text-gray-500 font-bold">SYNCING BLOCKCHAIN...</Text>
        ) : (
          <>
            <Ionicons name="refresh" size={20} color="white" />
            <Text className="text-white font-bold ml-2">SYNC PENDING DATA</Text>
          </>
        )}
      </TouchableOpacity>

      {/* 3. Batch List */}
      <Text className="text-gray-800 font-bold text-lg mb-4">Batch History</Text>
      <View>
        {MOCK_BATCHES.map((batch, index) => (
          <View key={index} className="bg-surface p-4 rounded-xl border border-gray-100 mb-3 flex-row justify-between items-center">
            <View>
              <Text className="font-bold text-gray-700">{batch.id}</Text>
              <Text className="text-xs text-gray-400">{batch.time} • {batch.size} records</Text>
            </View>

            <View className="items-end">
              <BatchStatusBadge status={batch.status} />
              <Text className="text-[10px] font-mono text-gray-300 mt-1">{batch.hash}</Text>
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

function BatchStatusBadge({ status }: { status: string }) {
  let color = 'bg-gray-100 text-gray-500';
  let label = status.toUpperCase();

  if (status === 'synced') color = 'bg-green-100 text-green-700';
  if (status === 'pending') color = 'bg-yellow-50 text-yellow-600';
  if (status === 'failed') color = 'bg-red-100 text-red-600';

  return (
    <View className={`px-2 py-1 rounded-md ${color.split(' ')[0]}`}>
      <Text className={`text-[10px] font-bold ${color.split(' ')[1]}`}>{label}</Text>
    </View>
  );
}