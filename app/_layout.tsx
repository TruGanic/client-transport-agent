import migrations from "@/drizzle/migrations";
import { db, expoDbClient } from "@/src/database/client";
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Slot } from "expo-router";
import { Text, View } from "react-native";
import "../global.css";

export default function RootLayout() {
  
  useDrizzleStudio(expoDbClient);
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Migration Error: {error.message}</Text>
      </View>
    );
  }

  // Show nothing (or a splash screen) while database is setting up
  if (!success) {
    return null; 
  }

  return <Slot />;
}