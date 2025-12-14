import { create } from 'zustand';

interface TripState {
  // State
  isRecording: boolean;
  connectionStatus: string;
  currentBuffer: number[];
  batchStartTime: number | null; // Track when the current batch started
  logs: string[];

  // Actions (State setters only)
  setRecording: (status: boolean) => void;
  setConnectionStatus: (status: string) => void;
  addToBuffer: (val: number) => void;
  resetBuffer: () => void;
  addLog: (message: string) => void;
  clearLogs: () => void;
}

export const useTripStore = create<TripState>((set) => ({
  isRecording: false,
  connectionStatus: "Idle",
  currentBuffer: [],
  batchStartTime: null,
  logs: [],

  setRecording: (status) => set({ 
    isRecording: status, 
    // If starting, set start time. If stopping, clear it.
    batchStartTime: status ? Date.now() : null 
  }),
  // New Action to update status globally
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  addToBuffer: (val) => set((state) => ({ 
    currentBuffer: [...state.currentBuffer, val] 
  })),

  resetBuffer: () => set({ 
    currentBuffer: [], 
    batchStartTime: Date.now() // Reset timer for next batch
  }),

  addLog: (msg) => set((state) => ({ 
    logs: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...state.logs].slice(0, 10) 
  })),

  clearLogs: () => set({ logs: [] })
}));