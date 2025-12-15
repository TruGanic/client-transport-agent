// 1. Enums eliminate "Magic Strings" and typos
export enum ConnectionStatus {
  IDLE = "Idle",
  SCANNING = "Scanning...",
  CONNECTING = "Connecting...",
  RECEIVING = "Receiving Data 🟢",
  LOST = "Connection Lost 🔴",
  ERROR = "Scan Error (Check BLE)",
}

// 2. Constants for Configuration
export const BLE_CONFIG = {
  SERVICE_UUID: "A07498CA-AD5B-474E-940D-16F1FBE7E8CD",
  CHAR_UUID: "51FF12BB-3ED8-46E5-B4F9-D64E2FEC021B",
  TARGET_DEVICE_NAME: "LogisticsSim",
  BATCH_SIZE: 10,
};

// 3. Strict Interfaces for data
export interface ProcessBatchResult {
  success: boolean;
  avg?: number;
  error?: unknown;
}
