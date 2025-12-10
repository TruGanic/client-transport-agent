import { Redirect, useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuthStore } from "../../store/auth-store";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // Redirect if already logged in
  if (isLoggedIn) {
    return <Redirect href="/(main)" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} />
      <Button
        title="Sign in"
        onPress={() => {
          login();
          router.replace("/");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { width: "100%", padding: 12, borderWidth: 1, borderRadius: 6, marginBottom: 12 },
});
