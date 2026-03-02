import migrations from "@/drizzle/migrations";
import { db, expoDbClient } from "@/src/database/client";
import { useAuthStore } from "@/src/store/auth-store";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Redirect, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import {
    configureReanimatedLogger,
    ReanimatedLogLevel,
} from "react-native-reanimated";
import "../global.css";

// Suppress Reanimated strict-mode warnings from third-party libs
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Keep splash screen visible while we load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useDrizzleStudio(expoDbClient);
  const { success, error } = useMigrations(db, migrations);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  // Safety timeout: if hydration takes too long, force proceed
  const [forceReady, setForceReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasHydrated) {
        console.warn("⚠️ Auth hydration timeout — forcing ready");
        setForceReady(true);
      }
    }, 2000); // 2 second max wait
    return () => clearTimeout(timer);
  }, [hasHydrated]);

  const isReady = success && (hasHydrated || forceReady);

  // Hide splash screen once everything is loaded
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>Migration Error: {error.message}</Text>
      </View>
    );
  }

  // Keep native splash visible while loading
  if (!isReady) {
    return null;
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
