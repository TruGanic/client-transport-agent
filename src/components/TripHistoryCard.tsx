import { Colors } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface TripData {
    id: string;
    batchId: string;
    date: string;
    time: string;
    startLocation: string;
    endLocation: string;
    duration: string;
    avgTemp: number;
    avgHumidity: number;
    status: 'SYNCED' | 'PENDING' | 'FAILED';
    produceType: string;
}

interface Props {
    trip: TripData;
    onPress?: () => void;
}

export default function TripHistoryCard({ trip, onPress }: Props) {

    // Status Helper
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SYNCED': return { bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle' };
            case 'PENDING': return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'time' };
            case 'FAILED': return { bg: 'bg-red-100', text: 'text-red-700', icon: 'alert-circle' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'help-circle' };
        }
    };

    const statusStyle = getStatusColor(trip.status);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm"
        >
            {/* Header: Date & ID */}
            <View className="flex-row justify-between items-start mb-3">
                <View>
                    <Text className="text-gray-800 font-bold text-base">{trip.date}</Text>
                    <Text className="text-gray-400 text-xs">{trip.time} • {trip.duration}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full flex-row items-center ${statusStyle.bg}`}>
                    <Ionicons name={statusStyle.icon as any} size={12} color={statusStyle.text === 'text-green-700' ? Colors.success : Colors.warning} style={{ marginRight: 4 }} />
                    <Text className={`text-xs font-bold ${statusStyle.text}`}>{trip.status}</Text>
                </View>
            </View>

            {/* Body: Route */}
            <View className="flex-row items-center mb-4">
                <View className="items-center mr-3">
                    <View className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    <View className="w-0.5 h-6 bg-gray-200" />
                    <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                </View>
                <View className="flex-1">
                    <View className="mb-2">
                        <Text className="text-gray-500 text-xs uppercase">From</Text>
                        <Text className="text-gray-800 font-medium" numberOfLines={1}>{trip.startLocation}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500 text-xs uppercase">To</Text>
                        <Text className="text-gray-800 font-medium" numberOfLines={1}>{trip.endLocation}</Text>
                    </View>
                </View>
            </View>

            {/* Footer: Stats */}
            <View className="flex-row border-t border-gray-50 pt-3">

                {/* Produce Type */}
                <View className="flex-1 flex-row items-center">
                    <View className="bg-green-50 p-1.5 rounded-lg mr-2">
                        <Ionicons name="leaf-outline" size={14} color={Colors.primary} />
                    </View>
                    <View>
                        <Text className="text-gray-400 text-[10px]">Produce</Text>
                        <Text className="text-gray-700 text-xs font-semibold">{trip.produceType}</Text>
                    </View>
                </View>

                {/* Temp */}
                <View className="flex-1 flex-row items-center justify-center">
                    <View className="bg-blue-50 p-1.5 rounded-lg mr-2">
                        <Ionicons name="thermometer-outline" size={14} color={Colors.secondary} />
                    </View>
                    <View>
                        <Text className="text-gray-400 text-[10px]">Avg Temp</Text>
                        <Text className="text-gray-700 text-xs font-semibold">{trip.avgTemp}°C</Text>
                    </View>
                </View>

                {/* Humidity */}
                <View className="flex-1 flex-row items-center justify-end">
                    <View className="bg-blue-50 p-1.5 rounded-lg mr-2">
                        <Ionicons name="water-outline" size={14} color="#0288D1" />
                    </View>
                    <View>
                        <Text className="text-gray-400 text-[10px]">Avg Hum</Text>
                        <Text className="text-gray-700 text-xs font-semibold">{trip.avgHumidity}%</Text>
                    </View>
                </View>

            </View>
        </TouchableOpacity>
    );
}
