import TripHistoryCard, { TripData } from "@/src/components/TripHistoryCard";
import { Colors } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";

// Mock Data
const MOCK_TRIPS: TripData[] = [
  {
    id: '1',
    batchId: 'BATCH-2025-001',
    date: 'Oct 24, 2025',
    time: '2:30 PM',
    startLocation: 'Kegalle Farm A',
    endLocation: 'Colombo Distribution Center',
    duration: '2h 15m',
    avgTemp: 4.2,
    avgHumidity: 88,
    status: 'SYNCED',
    produceType: 'Cavendish Bananas'
  },
  {
    id: '2',
    batchId: 'BATCH-2025-002',
    date: 'Oct 23, 2025',
    time: '10:15 AM',
    startLocation: 'Kurunegala Organic',
    endLocation: 'Kandy Hub',
    duration: '1h 45m',
    avgTemp: 3.8,
    avgHumidity: 92,
    status: 'SYNCED',
    produceType: 'Avocados'
  },
  {
    id: '3',
    batchId: 'BATCH-2025-003',
    date: 'Oct 22, 2025',
    time: '4:45 PM',
    startLocation: 'Dambulla Cool Storage',
    endLocation: 'Airport Cargo',
    duration: '3h 30m',
    avgTemp: 5.5, // Slight Warning
    avgHumidity: 85,
    status: 'PENDING',
    produceType: 'Strawberries'
  },
  {
    id: '4',
    batchId: 'BATCH-2025-004',
    date: 'Oct 20, 2025',
    time: '08:00 AM',
    startLocation: 'Nuwara Eliya Farms',
    endLocation: 'Colombo Port',
    duration: '4h 10m',
    avgTemp: 2.1,
    avgHumidity: 95,
    status: 'SYNCED',
    produceType: 'Tea Leaves'
  }
];

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTrips, setFilteredTrips] = useState(MOCK_TRIPS);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredTrips(MOCK_TRIPS);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = MOCK_TRIPS.filter(t =>
      t.batchId.toLowerCase().includes(lower) ||
      t.startLocation.toLowerCase().includes(lower) ||
      t.produceType.toLowerCase().includes(lower)
    );
    setFilteredTrips(filtered);
  };

  return (
    <View className="flex-1 bg-background">

      {/* Search Bar */}
      <View className="bg-white p-4 pb-2">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            className="flex-1 ml-2 text-gray-800 text-base"
            placeholder="Search trips, locations..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Stats Summary Header */}
      <View className="bg-white px-5 pb-4 mb-2 flex-row justify-between">
        <View>
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Trips</Text>
          <Text className="text-2xl font-bold text-gray-800">142</Text>
        </View>
        <View>
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest text-right">This Month</Text>
          <Text className="text-2xl font-bold text-primary text-right">+24</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredTrips}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TripHistoryCard trip={item} />
        )}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Ionicons name="document-text-outline" size={48} color={Colors.textSecondary} />
            <Text className="text-gray-400 mt-4">No trips found matching "{searchQuery}"</Text>
          </View>
        }
      />
    </View>
  );
}