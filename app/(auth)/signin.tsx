import { Redirect } from "expo-router";

// This route is kept for backwards-compat. The main sign-in lives at /(auth)/index.tsx
export default function SignInRedirect() {
  return <Redirect href="/(auth)" />;
}
