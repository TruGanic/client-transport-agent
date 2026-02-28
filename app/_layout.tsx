import migrations from "@/drizzle/migrations";
import { db, expoDbClient } from "@/src/database/client";
import { useAuthStore } from "@/src/store/auth-store";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import "../global.css";

export default function RootLayout() {
  useDrizzleStudio(expoDbClient);
  const { success, error } = useMigrations(db, migrations);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>Migration Error: {error.message}</Text>
      </View>
    );
  }

  // Wait for both DB migration and auth hydration from AsyncStorage
  if (!success || !hasHydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F4F6F8",
        }}
      >
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  // Auth Guard: redirect based on login state
  if (!isLoggedIn) {
    return (
      <>
        <Redirect href="/(auth)" />
        <Slot />
      </>
    );
  }

  return (
    <>
      <Redirect href="/(main)" />
      <Slot />
    </>
  );
}
