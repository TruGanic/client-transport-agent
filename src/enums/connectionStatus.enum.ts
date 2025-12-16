// 1. Enums eliminate "Magic Strings" and typos
export enum ConnectionStatus {
  IDLE = "Idle",
  SCANNING = "Scanning...",
  CONNECTING = "Connecting...",
  RECEIVING = "Receiving Data 🟢",
  LOST = "Connection Lost 🔴",
  ERROR = "Scan Error (Check BLE)",
}