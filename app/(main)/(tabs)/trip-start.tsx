import { useTripManager } from "@/hooks/useTripManager";
import { Text, View } from "react-native";

export default function TripStart() {

  const { isRecording,logs, startTrip, stopTrip } = useTripManager();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Trip Start Screen</Text>
    </View>
  );
}