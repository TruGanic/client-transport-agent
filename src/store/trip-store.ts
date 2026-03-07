import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ConnectionStatus } from "../enums/connectionStatus.enum";
import { ITripState } from "../interfaces/ITripState";

export const useTripStore = create<ITripState>()(
  persist(
    (set) => ({
      isRecording: false,
      activeBatchId: null,
      connectionStatus: ConnectionStatus.IDLE,
      currentBuffer: [],
      currentHumidityBuffer: [],
      batchStartTime: null,
      tripStartTime: null,
      tripEndTime: null,
      logs: [],

      setRecording: (status) =>
        set((state) => ({
          isRecording: status,
          // When starting: set both batch and trip start times
          // When stopping: preserve tripStartTime and batchStartTime so TripController
          //   can flush the final partial batch with the correct time range.
          //   batchStartTime is cleared later by resetBuffer / clearTripData / clearBatchData.
          batchStartTime: status ? Date.now() : state.batchStartTime,
          tripStartTime: status ? Date.now() : state.tripStartTime,
          tripEndTime: status ? null : Date.now(),
        })),

      setActiveBatchId: (id) => set({ activeBatchId: id }),

      setConnectionStatus: (status) =>
        set({ connectionStatus: status as ConnectionStatus }),

      addToBuffer: (temp, humidity) =>
        set((state) => ({
          currentBuffer: [...state.currentBuffer, temp],
          currentHumidityBuffer: [
            ...(state.currentHumidityBuffer || []),
            humidity,
          ],
        })),

      resetBuffer: () =>
        set({
          currentBuffer: [],
          currentHumidityBuffer: [],
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

      clearTripData: () =>
        set({
          currentBuffer: [],
          currentHumidityBuffer: [],
          batchStartTime: null,
          tripStartTime: null,
          tripEndTime: null,
          activeBatchId: null,
          logs: [],
        }),

      // Clears only batch-specific data, preserving sensor buffers
      clearBatchData: () =>
        set({
          batchStartTime: null,
          tripStartTime: null,
          tripEndTime: null,
          activeBatchId: null,
          logs: [],
        }),
    }),
    {
      name: "trip-storage", // Unique name for storage
      storage: createJSONStorage(() => AsyncStorage),
      // Only save these fields. DO NOT save 'connectionStatus'
      // because when restart, disconnected by definition.
      // NEVER persist isRecording — BLE connection can't survive app restart.
      // Persisting it causes the BLE hook to fire before navigation is ready.
      partialize: (state) => ({
        activeBatchId: state.activeBatchId,
        currentBuffer: state.currentBuffer,
        currentHumidityBuffer: state.currentHumidityBuffer,
        batchStartTime: state.batchStartTime,
        tripStartTime: state.tripStartTime,
        tripEndTime: state.tripEndTime,
        logs: state.logs,
      }),
    },
  ),
);
