import { ConnectionStatus } from "../enums/connectionStatus.enum";

export interface ITripState {
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