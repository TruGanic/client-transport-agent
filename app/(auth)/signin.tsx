import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";
import { useAuthStore } from "../../src/store/auth-store";

export default function SignInScreen() {
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = () => {
    login(); // update store
    router.replace("/"); // go to main app
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Sign-in Screen</Text>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
