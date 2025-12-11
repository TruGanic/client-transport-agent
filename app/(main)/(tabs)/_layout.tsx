import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { Tabs, useNavigation } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function TabLayout() {
  const navigation = useNavigation();

  // Helper to open drawer
  const toggleDrawer = () => navigation.dispatch(DrawerActions.toggleDrawer());

  return (
    <Tabs
      screenOptions={{
        headerLeft: () => (
          <TouchableOpacity onPress={toggleDrawer} style={{ marginLeft: 16 }}>
            <Ionicons name="menu" size={28} color="black" />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: "#007AFF",
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
    </Tabs>
  );
}