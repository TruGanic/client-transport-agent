import { Colors } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: Colors.primaryDark }}
    >
      <Drawer
        screenOptions={{
          headerShown: false,

          headerTitleAlign: "center",

          headerRight: () => <View style={{ width: 50, marginRight: 16 }} />,

          drawerActiveTintColor: Colors.primary,
          drawerActiveBackgroundColor: Colors.drawerActiveBackground,
          drawerInactiveTintColor: Colors.textSecondary,
          drawerType: "front",
          drawerLabelStyle: {
            fontWeight: "600",
          },
        }}
      >
        {/* 1. The Main Tabs */}
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Dashboard",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="speedometer-outline" size={size} color={color} />
            ),
          }}
        />

        {/* 2. Trip History */}
        <Drawer.Screen
          name="history"
          options={{
            drawerLabel: "Trip History",
            title: "Past Trips",
            headerShown: true,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />

        {/* 3. Sync Manager */}
        <Drawer.Screen
          name="sync-status"
          options={{
            drawerLabel: "Sync Status (Merkle)",
            title: "Data Synchronization",
            headerShown: true,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="cloud-upload-outline" size={size} color={color} />
            ),
          }}
        />

        {/* 4. Settings */}
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: "Settings",
            title: "App Settings",
            headerShown: true,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
