import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false, // We hide the Drawer header because Tabs will have their own
          drawerActiveTintColor: '#007AFF',
          drawerType: 'front',
        }}
      >
        {/* 1. The Main Tabs (This is the default view) */}
        <Drawer.Screen
          name="(tabs)" // This points to the (tabs) folder
          options={{
            drawerLabel: 'Dashboard',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="speedometer-outline" size={size} color={color} />
            ),
          }}
        />

        {/* 2. Trip History */}
        <Drawer.Screen
          name="history"
          options={{
            drawerLabel: 'Trip History',
            title: 'Past Trips', // Header title when on this screen
            headerShown: true,   // Show header for non-tab screens
            drawerIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />

        {/* 3. Sync Manager (Research Core) */}
        <Drawer.Screen
          name="sync-status"
          options={{
            drawerLabel: 'Sync Status (Merkle)',
            title: 'Data Synchronization',
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
            drawerLabel: 'Settings',
            title: 'App Settings',
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