import { Colors } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Dimensions, Text, View, ViewToken } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40; // Full width minus padding

interface InstructionItem {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

const INSTRUCTIONS: InstructionItem[] = [
    {
        id: "1",
        title: "Verify Seal",
        description: "Ensure the cargo seal #TR-8821X is intact before scanning.",
        icon: "shield-checkmark-outline",
        color: "#4CAF50", // Green
    },
    {
        id: "2",
        title: "Check Temperature",
        description: "Confirm the average trip temperature is within the 2°C - 6°C safe range.",
        icon: "thermometer-outline",
        color: "#2196F3", // Blue
    },
    {
        id: "3",
        title: "Scan Receipt",
        description: "Depot manager must scan your generated QR code to accept custody.",
        icon: "qr-code-outline",
        color: "#FF9800", // Orange
    },
    {
        id: "4",
        title: "Sync Data",
        description: "Data will automatically sync to the blockchain upon connection.",
        icon: "cloud-upload-outline",
        color: "#9C27B0", // Purple
    },
];

export default function HandoverInstructionsCarousel() {
    const scrollX = useSharedValue(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Viewable Item tracking for simple index state (optional usage)
    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const RenderItem = ({ item, index }: { item: InstructionItem; index: number }) => {
        // Parallax / Scale Effect
        const itemsStyle = useAnimatedStyle(() => {
            const inputRange = [
                (index - 1) * CARD_WIDTH,
                index * CARD_WIDTH,
                (index + 1) * CARD_WIDTH,
            ];

            const scale = interpolate(
                scrollX.value,
                inputRange,
                [0.9, 1, 0.9],
                Extrapolation.CLAMP
            );

            const opacity = interpolate(
                scrollX.value,
                inputRange,
                [0.6, 1, 0.6],
                Extrapolation.CLAMP
            );

            return {
                transform: [{ scale }],
                opacity,
            };
        });

        return (
            <View style={{ width: CARD_WIDTH, alignItems: 'center', justifyContent: 'center' }}>
                <Animated.View
                    style={[itemsStyle]}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-row items-center w-[95%] h-32"
                >
                    {/* Icon Circle */}
                    <View
                        className="w-16 h-16 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: `${item.color}15` }} // 15% opacity hex
                    >
                        <Ionicons name={item.icon} size={32} color={item.color} />
                    </View>

                    {/* Text Content */}
                    <View className="flex-1">
                        <Text className="text-gray-800 font-bold text-lg mb-1">{item.title}</Text>
                        <Text className="text-gray-500 text-xs leading-4">{item.description}</Text>
                    </View>

                </Animated.View>
            </View>
        );
    };

    return (
        <View className="mt-8">
            <View className="flex-row justify-between items-center mb-4 px-2">
                <Text className="text-gray-800 font-bold text-lg">Instructions</Text>
                <Text className="text-gray-400 text-xs">{currentIndex + 1} of {INSTRUCTIONS.length}</Text>
            </View>

            <Animated.FlatList
                data={INSTRUCTIONS}
                renderItem={({ item, index }) => <RenderItem item={item} index={index} />}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH}
                decelerationRate="fast"
                onScroll={(event) => {
                    scrollX.value = event.nativeEvent.contentOffset.x;
                }}
                scrollEventThrottle={16}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            {/* Pagination Dots */}
            <View className="flex-row justify-center mt-[-10]">
                {INSTRUCTIONS.map((_, index) => {
                    return (
                        <PaginationDot key={index} index={index} scrollX={scrollX} />
                    );
                })}
            </View>

        </View>
    );
}

const PaginationDot = ({ index, scrollX }: { index: number; scrollX: any }) => {
    const style = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * CARD_WIDTH,
            index * CARD_WIDTH,
            (index + 1) * CARD_WIDTH,
        ];

        const width = interpolate(
            scrollX.value,
            inputRange,
            [8, 24, 8],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.3, 1, 0.3],
            Extrapolation.CLAMP
        );

        return {
            width,
            opacity
        };
    });

    return (
        <Animated.View
            style={[style, { height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginHorizontal: 4 }]}
        />
    );
}
