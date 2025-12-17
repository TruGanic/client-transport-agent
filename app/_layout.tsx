// app/_layout.tsx
import { expoDb, initDatabase } from "@/src/database/client";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Slot } from "expo-router";
import { useEffect } from "react";
import "../global.css";


export default function RootLayout() {
  useEffect(() => {
    initDatabase(); // Create tables on app launch
  }, []);

  useDrizzleStudio(expoDb);
  return <Slot />;
}
