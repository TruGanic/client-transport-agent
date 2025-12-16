import { ConnectionStatus } from "../enums/connectionStatus.enum";

export interface IBleSessionProps {
  isRecording: boolean;
  onDataReceived: (base64Data: string) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}