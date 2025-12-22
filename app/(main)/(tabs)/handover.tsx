import { Colors } from "@/src/constants/theme";
import { useTripManager } from "@/src/hooks/useTripManager";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function HandoverScreen() {
    const { isRecording, stopTrip } = useTripManager();
    const [step, setStep] = useState(1); // 1: Trip Active/Summary, 2: QR Scan, 3: Completed

    const handleStopTrip = () => {
        stopTrip();
        setStep(2);
    };

    const handleConfirmHandover = () => {
        Alert.alert("Handover Successful", "Custody has been transferred to Central Depot.", [
            { text: "OK", onPress: () => setStep(3) }
        ]);
    };

    const handleEndShift = () => {
        // Reset or Navigate away
        setStep(1);
        Alert.alert("Shift Ended", "Have a great day!");
    };

    return (
        <ScrollView className="flex-1 bg-background p-5">

            {/* Header */}
            <View className="mb-6">
                <Text className="text-2xl font-bold text-gray-800">Arrival & Handover</Text>
                <Text className="text-gray-500 text-sm">Central Depot Processing</Text>
            </View>

            {/* Dynamic Content based on Step */}

            {/* STEP 1: Trip Summary */}
            {(step === 1) && (
                <View>
                    <View className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">Current Trip Status</Text>

                        {isRecording ? (
                            <View className="flex-row items-center mb-6">
                                <View className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2" />
                                <Text className="text-green-600 font-bold">IN TRANSIT</Text>
                            </View>
                        ) : (
                            <View className="flex-row items-center mb-6">
                                <View className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-none" />
                                <Text className="text-blue-600 font-bold">READY TO UNLOAD</Text>
                            </View>
                        )}

                        <View className="flex-row justify-between mb-4 border-b border-gray-50 pb-4">
                            <View>
                                <Text className="text-gray-400 text-xs">Distance</Text>
                                <Text className="text-xl font-bold text-gray-800">14.2 <Text className="text-sm font-normal">km</Text></Text>
                            </View>
                            <View>
                                <Text className="text-gray-400 text-xs">Avg Temp</Text>
                                <Text className="text-xl font-bold text-gray-800">4.1 <Text className="text-sm font-normal">°C</Text></Text>
                            </View>
                            <View>
                                <Text className="text-gray-400 text-xs">Duration</Text>
                                <Text className="text-xl font-bold text-gray-800">42 <Text className="text-sm font-normal">m</Text></Text>
                            </View>
                        </View>

                        <View className="bg-green-50 p-3 rounded-lg flex-row items-center">
                            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                            <Text className="text-green-800 text-xs font-medium ml-2">Temperature Compliance Verified</Text>
                        </View>
                    </View>

                    {isRecording ? (
                        <TouchableOpacity
                            onPress={handleStopTrip}
                            className="w-full bg-error py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-red-900/20"
                        >
                            <Ionicons name="stop-circle-outline" size={24} color="white" />
                            <Text className="text-white font-bold ml-2 text-lg">STOP TRIP & UNLOAD</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() => setStep(2)}
                            className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-green-900/20"
                        >
                            <Ionicons name="cube-outline" size={24} color="white" />
                            <Text className="text-white font-bold ml-2 text-lg">PROCEED TO HANDOVER</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* STEP 2: QR Handover */}
            {step === 2 && (
                <View className="items-center">
                    <View className="bg-white p-8 rounded-3xl shadow-xl w-full aspect-square items-center justify-center mb-8 border border-gray-100">
                        <Ionicons name="qr-code-outline" size={200} color={Colors.textPrimary} />
                        <Text className="text-gray-400 text-xs mt-4 text-center">Scan at Central Depot Terminal</Text>
                    </View>

                    <Text className="text-center text-gray-600 mb-8 px-8">
                        Please allow the depot manager to scan this code to transfer custody of the shipment.
                    </Text>

                    <TouchableOpacity
                        onPress={handleConfirmHandover}
                        className="w-full bg-primary py-4 rounded-xl flex-row justify-center items-center mb-4"
                    >
                        <Ionicons name="checkmark-done-circle" size={24} color="white" />
                        <Text className="text-white font-bold ml-2">CONFIRM HANDOVER</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setStep(1)} className="py-4">
                        <Text className="text-gray-400 font-bold">CANCEL</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* STEP 3: Complete */}
            {step === 3 && (
                <View className="items-center pt-10">
                    <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
                        <Ionicons name="checkmark" size={48} color={Colors.success} />
                    </View>

                    <Text className="text-2xl font-bold text-gray-800 mb-2">You're All Set!</Text>
                    <Text className="text-gray-500 text-center mb-10">
                        Shipment #TR-8821X has been successfully handed over. All merkle proofs have been synced.
                    </Text>

                    <TouchableOpacity
                        onPress={handleEndShift}
                        className="w-full bg-gray-800 py-4 rounded-xl flex-row justify-center items-center"
                    >
                        <Ionicons name="log-out-outline" size={24} color="white" />
                        <Text className="text-white font-bold ml-2">END WORK SHIFT</Text>
                    </TouchableOpacity>
                </View>
            )}

        </ScrollView>
    );
}
