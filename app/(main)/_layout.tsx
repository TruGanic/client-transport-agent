import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true, // top header
        tabBarActiveTintColor: "#007AFF",
      }}
    >
      {/* Tab 1 */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
           tabBarIcon: ({ color, size }) => (
      <MaterialIcons name="home" size={size} color={color} />
    ),
        }}
      />

      {/* Tab 2 */}
      <Tabs.Screen
        name="harvesting"
        options={{
          title: "Harvesting",
        }}
      />

      {/* Tab 3 */}
      <Tabs.Screen
        name="trip-start"
        options={{
          title: "Trip Start",
        }}
      />
    </Tabs>
  );
}
