import { Colors } from "@/src/constants/theme";
import { ConnectionStatus } from "@/src/enums/connectionStatus.enum";
import { useSyncStore } from "@/src/store/sync-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Dimensions, Text, View, ViewToken } from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    type SharedValue,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 24;
const CARD_WIDTH = width - (CARD_MARGIN * 2);
const CARD_HEIGHT = 220;

interface Props {
    isRecording: boolean;
    activeBatchId: string | null;
    connectionStatus: ConnectionStatus;
    currentTemp: number | null;
    currentHumidity: number | null;
    bufferSize: number;
}

export default function HomeStatusCarousel({
    isRecording,
    activeBatchId,
    connectionStatus,
    currentTemp,
    currentHumidity,
    bufferSize,
}: Props) {
    const scrollX = useSharedValue(0);
    const [activeIndex, setActiveIndex] = useState(0);

    // Data for the 3 Cards
    const CARDS = [
        { type: "OVERVIEW" },
        { type: "TEMP" },
        { type: "HUMIDITY" },
    ];

    const onScroll = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
    });

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    // Access sync store for professional data
    const lastSyncTime = useSyncStore((state) => state.lastSyncTime);

    // Format Sync Time
    const getFormattedSyncTime = () => {
        if (!lastSyncTime) return "Never";
        const date = new Date(lastSyncTime);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View className="items-center justify-center pt-2">
            <Animated.FlatList
                data={CARDS}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <StatusCard
                        item={item}
                        index={index}
                        scrollX={scrollX}
                        isRecording={isRecording}
                        activeBatchId={activeBatchId}
                        connectionStatus={connectionStatus}
                        currentTemp={currentTemp}
                        currentHumidity={currentHumidity}
                        bufferSize={bufferSize}
                        lastSyncTime={getFormattedSyncTime()}
                    />
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={width}
                decelerationRate="fast"
                onScroll={onScroll}
                onViewableItemsChanged={onViewableItemsChanged}
                scrollEventThrottle={16}
                // FIXED: Removed paddingHorizontal to eliminate left gap. 
                // Handled implicitly by width-based item wrapper.
                contentContainerStyle={{
                    alignItems: 'center'
                }}
                style={{ height: CARD_HEIGHT + 20 }}
            />

            {/* Pagination Indicators - Floating or below */}
            <View className="flex-row space-x-2 mt-4 justify-center">
                {CARDS.map((_, i) => (
                    <View
                        key={i}
                        className={`w-2 h-2 rounded-full ${i === activeIndex ? 'bg-primary' : 'bg-gray-300'}`}
                    />
                ))}
            </View>
        </View>
    );
}

// Extracted Component
const StatusCard = ({
    item,
    index,
    scrollX,
    isRecording,
    activeBatchId,
    connectionStatus,
    currentTemp,
    currentHumidity,
    bufferSize,
    lastSyncTime
}: {
    item: { type: string };
    index: number;
    scrollX: SharedValue<number>;
    isRecording: boolean;
    activeBatchId: string | null;
    connectionStatus: ConnectionStatus;
    currentTemp: number | null;
    currentHumidity: number | null;
    bufferSize: number;
    lastSyncTime: string;
}) => {

    const animatedStyle = useAnimatedStyle(() => {
        // Calculate based on index and width (including margins implicitly via padding)
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.9, 1, 0.9], // Subtle scale efffect
            Extrapolation.CLAMP
        );

        return {
            transform: [{ scale }],
        };
    });

    let Content = null;
    // Default Styling
    let bgColor = Colors.primary; // FOREST GREEN for everything by default, even Idle
    let decorIcon: any = "cube-outline";
    let decorColor = "rgba(255,255,255,0.1)";

    // --- CARD 1: OVERVIEW ---
    if (item.type === "OVERVIEW") {
        decorIcon = "leaf-outline";
        Content = (
            <View className="flex-1 justify-between">
                {/* Header */}
                <View className="flex-row justify-between items-start">
                    <View>
                        <View className="flex-row items-center space-x-2 mb-1">
                            <Ionicons name={isRecording ? "radio-button-on" : "radio-button-off"} size={12} color="#4ADE80" />
                            <Text className="text-green-100 font-bold text-xs tracking-[2px] uppercase">
                                {isRecording ? "Live Tracking" : "System Idle"}
                            </Text>
                        </View>
                        <Text className="text-white text-lg font-medium opacity-90">
                            {isRecording ? "Current Batch" : "Wait Mode"}
                        </Text>
                    </View>

                    {/* Signal Badge */}
                    <View className="bg-black/20 px-2 py-1 rounded-lg flex-row items-center">
                        <Ionicons name="wifi" size={10} color={isRecording ? "white" : "#9CA3AF"} />
                        <Text className="text-white text-[10px] font-bold ml-1 uppercase">
                            {isRecording ? connectionStatus : "Sleep"}
                        </Text>
                    </View>
                </View>

                {/* Main Metric - FIXED Alignment & Text */}
                <View>
                    <Text className="text-white text-3xl font-bold tracking-tight" numberOfLines={1} adjustsFontSizeToFit>
                        {isRecording ? (activeBatchId || "Unknown Batch") : "No Active Trip"}
                    </Text>
                    {!isRecording ? (
                        <Text className="text-green-200 text-sm mt-1">
                            Ready to initialize new shipment.
                        </Text>
                    ) : (
                        <Text className="text-green-200 text-sm mt-1">
                            Logging sensor data locally.
                        </Text>
                    )}
                </View>

                {/* Footer Stats - Added Last Sync */}
                <View className="flex-row items-center justify-between border-t border-white/10 pt-3 mt-2">
                    <View>
                        <Text className="text-green-200 text-[10px] uppercase font-bold">Total Packets</Text>
                        <Text className="text-white text-base font-bold">{isRecording ? bufferSize : "--"}</Text>
                    </View>
                    <View>
                        <Text className="text-green-200 text-[10px] uppercase font-bold text-right">Last Sync</Text>
                        <Text className="text-white text-base font-bold text-right">{lastSyncTime}</Text>
                    </View>
                </View>
            </View>
        );
    }

    // --- CARD 2: TEMPERATURE ---
    if (item.type === "TEMP") {
        bgColor = Colors.secondary; // TEAL
        decorIcon = "thermometer-outline";
        Content = (
            <View className="flex-1 justify-between">
                {/* Header */}
                <View className="flex-row justify-between items-center">
                    <Text className="text-teal-100 font-bold text-xs tracking-[2px] uppercase">Temperature</Text>
                    <Ionicons name="thermometer" size={16} color="white" />
                </View>

                {/* Main Metric */}
                <View className="flex-row items-baseline">
                    <Text className="text-white text-6xl font-bold">
                        {isRecording && currentTemp !== null ? currentTemp.toFixed(1) : "--"}
                    </Text>
                    <Text className="text-teal-200 text-3xl font-medium ml-1">°C</Text>
                </View>

                {/* Status Pill */}
                {isRecording && (
                    <View className="self-start">
                        <View className={`px-3 py-1.5 rounded-full flex-row items-center ${currentTemp && currentTemp > 2 && currentTemp < 12 ? 'bg-teal-800/40' : 'bg-yellow-500/20'}`}>
                            <Ionicons
                                name={currentTemp && currentTemp > 2 && currentTemp < 12 ? "checkmark-circle" : "alert-circle"}
                                size={14}
                                color={currentTemp && currentTemp > 2 && currentTemp < 12 ? "#4ADE80" : "#FDBA74"}
                            />
                            <Text className={`text-xs font-bold ml-1 ${currentTemp && currentTemp > 2 && currentTemp < 12 ? 'text-green-300' : 'text-orange-200'}`}>
                                {currentTemp && currentTemp > 2 && currentTemp < 12 ? "Optimal Range" : "Warning"}
                            </Text>
                        </View>
                    </View>
                )}
                {!isRecording && <Text className="text-teal-200 text-sm">Sensor inactive</Text>}
            </View>
        );
    }

    // --- CARD 3: HUMIDITY ---
    if (item.type === "HUMIDITY") {
        bgColor = "#0288D1"; // Strong Blue
        decorIcon = "water-outline";
        Content = (
            <View className="flex-1 justify-between">
                {/* Header */}
                <View className="flex-row justify-between items-center">
                    <Text className="text-blue-100 font-bold text-xs tracking-[2px] uppercase">Humidity</Text>
                    <Ionicons name="water" size={16} color="white" />
                </View>

                {/* Main Metric */}
                <View className="flex-row items-baseline">
                    <Text className="text-white text-6xl font-bold">
                        {isRecording && currentHumidity !== null ? currentHumidity.toFixed(0) : "--"}
                    </Text>
                    <Text className="text-blue-200 text-3xl font-medium ml-1">%</Text>
                </View>

                {/* Status Pill */}
                {isRecording && (
                    <View className="self-start">
                        <View className="px-3 py-1.5 rounded-full flex-row items-center bg-blue-900/30">
                            <Ionicons name="cloud-outline" size={14} color="#93C5FD" />
                            <Text className="text-xs font-bold ml-1 text-blue-200">Relative Level</Text>
                        </View>
                    </View>
                )}
                {!isRecording && <Text className="text-blue-200 text-sm">Sensor inactive</Text>}
            </View>
        );
    }

    // Override Idle State Color if not Overview? 
    // Actually, keeping them colored (Teal/Blue) even in idle looks better/more premium than gray, 
    // just with "inactive" text. So we keep the bgColor logic above.

    return (
        <View style={{ width: width, alignItems: "center" }}>
            <Animated.View
                className={`w-full h-full rounded-3xl p-6 shadow-xl shadow-green-900/30 relative overflow-hidden`}
                style={[{ width: CARD_WIDTH, height: CARD_HEIGHT }, animatedStyle]}
                children={
                    <>
                        {/* Background Color Block */}
                        <View style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: bgColor
                        }} />

                        {/* Decor Icon Overlay */}
                        <View style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.1 }}>
                            <Ionicons name={decorIcon} size={140} color="white" />
                        </View>
                        {/* Circle Decor */}
                        <View style={{ position: 'absolute', top: -40, right: 40, width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', opacity: 0.05 }} />

                        {Content}
                    </>
                }
            />
        </View>
    );
};
