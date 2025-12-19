import { Colors } from '@/src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { Tabs, useNavigation } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  const navigation = useNavigation();

  // Helper to open drawer
  const toggleDrawer = () => navigation.dispatch(DrawerActions.toggleDrawer());

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.textPrimary,

        headerLeft: () => (
          <TouchableOpacity onPress={toggleDrawer} style={{ marginLeft: 16 }}>
            <Ionicons name="menu" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={{ marginRight: 16, width: 28 }} />
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="harvesting"
        options={{
          title: "Harvesting",
          tabBarIcon: ({ color }) => <Ionicons name="leaf" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trip-start"
        options={{
          title: "Current Trip",
          tabBarIcon: ({ color }) => <Ionicons name="navigate" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="handover"
        options={{
          title: "Handover",
          tabBarIcon: ({ color }) => <Ionicons name="cube" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}