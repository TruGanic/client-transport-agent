import { Colors } from "@/src/constants/theme";
import { useAuthStore } from "@/src/store/auth-store";
import { useSyncStore } from "@/src/store/sync-store";
import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const isOnline = useSyncStore((s) => s.isOnline);

  const displayName =
    user?.user_metadata?.username || user?.email?.split("@")[0] || "Agent";
  const displayEmail = user?.email || "";

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 1. Custom Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-primary px-6 pb-8 rounded-b-[40px] shadow-xl mb-6 relative overflow-hidden"
      >
        {/* Background Pattern (Subtle) */}
        <View className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16" />
        <View className="absolute left-0 bottom-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10" />

        {/* Brand Header */}
        <View className="flex-row items-center mb-6">
          <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3 shadow-sm">
            <Ionicons name="leaf" size={24} color={Colors.primary} />
          </View>
          <View>
            <Text className="text-white text-2xl font-bold tracking-tight">
              TruGanic
            </Text>
            <Text className="text-green-100 text-[10px] font-medium tracking-widest uppercase">
              Traceability Agent
            </Text>
          </View>
        </View>

        {/* User Card */}
        <View className="bg-white/15 p-4 rounded-2xl flex-row items-center border border-white/10">
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border-2 border-white/40">
            <Ionicons name="person" size={24} color="white" />
          </View>
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-white text-base font-bold">
                {displayName}
              </Text>
              <View className="bg-white/20 px-2 py-0.5 rounded-full ml-2">
                <Text className="text-green-100 text-[9px] font-bold">
                  Agent
                </Text>
              </View>
            </View>
            {displayEmail ? (
              <Text className="text-green-200 text-xs mt-0.5" numberOfLines={1}>
                {displayEmail}
              </Text>
            ) : null}
            {/* Status separator */}
            <View className="h-px bg-white/15 my-1.5" />
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? "bg-green-400" : "bg-red-400"}`}
              />
              <Text className="text-green-100 text-xs">
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Drawer Items */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        <View className="px-2">
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* 3. Footer */}
      <View
        style={{ paddingBottom: insets.bottom + 20 }}
        className="px-6 border-t border-gray-100 pt-4"
      >
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center mb-4"
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text className="text-error ml-3 font-medium">Sign Out</Text>
        </TouchableOpacity>
        <Text className="text-gray-400 text-xs text-center">
          v1.2.0 • Food Traceability
        </Text>
      </View>
    </View>
  );
}
