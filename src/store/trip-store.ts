import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ConnectionStatus } from "../types/transport.types";

interface TripState {
  isRecording: boolean;
  connectionStatus: ConnectionStatus;
  currentBuffer: number[];
  batchStartTime: number | null;
  logs: string[];

  setRecording: (status: boolean) => void;
  setConnectionStatus: (status: string) => void;
  addToBuffer: (val: number) => void;
  resetBuffer: () => void;
  addLog: (message: string) => void;
  clearLogs: () => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      isRecording: false,
      connectionStatus: ConnectionStatus.IDLE,
      currentBuffer: [],
      batchStartTime: null,
      logs: [],

      setRecording: (status) =>
        set({
          isRecording: status,
          batchStartTime: status ? Date.now() : null,
        }),

      setConnectionStatus: (status) =>
        set({ connectionStatus: status as ConnectionStatus }),

      addToBuffer: (val) =>
        set((state) => ({
          currentBuffer: [...state.currentBuffer, val],
        })),

      resetBuffer: () =>
        set({
          currentBuffer: [],
          batchStartTime: Date.now(),
        }),

      addLog: (msg) =>
        set((state) => ({
          logs: [
            `[${new Date().toLocaleTimeString()}] ${msg}`,
            ...state.logs,
          ].slice(0, 10),
        })),

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: "trip-storage", // Unique name for storage
      storage: createJSONStorage(() => AsyncStorage),
      // Only save these fields. DO NOT save 'connectionStatus'
      // because when restart, disconnected by definition.
      partialize: (state) => ({
        isRecording: state.isRecording,
        currentBuffer: state.currentBuffer,
        batchStartTime: state.batchStartTime,
        logs: state.logs,
      }),
    }
  )
);
