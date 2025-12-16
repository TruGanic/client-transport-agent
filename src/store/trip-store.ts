import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ConnectionStatus } from "../enums/connectionStatus.enum";
import { ITripState } from "../interfaces/ITripState";


export const useTripStore = create<ITripState>()(
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
