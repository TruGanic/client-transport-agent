import CustomDrawerContent from "@/src/components/CustomDrawerContent";
import { Colors } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          headerTitleAlign: "center",
          headerTintColor: Colors.textPrimary,
          headerStyle: { backgroundColor: Colors.surface, shadowOpacity: 0, elevation: 0 },

          drawerActiveTintColor: Colors.surface,
          drawerActiveBackgroundColor: Colors.primary,
          drawerInactiveTintColor: Colors.textSecondary,

          drawerItemStyle: { borderRadius: 12, marginVertical: 4, paddingHorizontal: 4 },
          drawerLabelStyle: { marginLeft: -10, fontWeight: "600" },

          drawerType: "front",
        }}
      >
        {/* 1. The Main Tabs */}
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Dashboard",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="speedometer-outline" size={22} color={color} />
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
              <Ionicons name="time-outline" size={22} color={color} />
            ),
          }}
        />

        {/* 3. Sync Manager */}
        <Drawer.Screen
          name="sync-status"
          options={{
            drawerLabel: "Data Sync",
            title: "Synchronization",
            headerShown: true,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="cloud-upload-outline" size={22} color={color} />
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
              <Ionicons name="settings-outline" size={22} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
