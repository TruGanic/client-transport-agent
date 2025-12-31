import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncError: string | null;
  
  setOnlineStatus: (status: boolean) => void;
  setSyncing: (status: boolean) => void;
  setLastSyncTime: (time: number) => void;
  setSyncError: (error: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true, // Optimistic default
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,

  setOnlineStatus: (status) => set({ isOnline: status }),
  setSyncing: (status) => set({ isSyncing: status }),
  setLastSyncTime: (time) => set({ lastSyncTime: time, syncError: null }),
  setSyncError: (error) => set({ syncError: error }),
}));
