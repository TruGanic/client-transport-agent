import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TripState {
  isRecording: boolean;
  connectionStatus: string;
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
      connectionStatus: "Idle",
      currentBuffer: [],
      batchStartTime: null,
      logs: [],

      setRecording: (status) => set({ 
        isRecording: status, 
        batchStartTime: status ? Date.now() : null 
      }),
      
      setConnectionStatus: (status) => set({ connectionStatus: status }),

      addToBuffer: (val) => set((state) => ({ 
        currentBuffer: [...state.currentBuffer, val] 
      })),

      resetBuffer: () => set({ 
        currentBuffer: [], 
        batchStartTime: Date.now() 
      }),

      addLog: (msg) => set((state) => ({ 
        logs: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...state.logs].slice(0, 10) 
      })),

      clearLogs: () => set({ logs: [] })
    }),
    {
      name: 'trip-storage', // Unique name for storage
      storage: createJSONStorage(() => AsyncStorage),
      // ⚠️ CRITICAL: Only save these fields. DO NOT save 'connectionStatus' 
      // because when you restart, you are disconnected by definition.
      partialize: (state) => ({ 
        isRecording: state.isRecording,
        currentBuffer: state.currentBuffer,
        batchStartTime: state.batchStartTime,
        logs: state.logs 
      }),
    }
  )
);