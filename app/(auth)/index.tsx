import { SignInFormValues, signInSchema } from "@/src/features/auth/schema";
import { useAuthStore } from "@/src/store/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  // Redirect if already logged in
  if (isLoggedIn) {
    return <Redirect href="/(main)" />;
  }

  const onSubmit = async (data: SignInFormValues) => {
    setApiError(null);
    const result = await signIn(data.email, data.password);
    if (!result.success) {
      setApiError(result.error || "Sign in failed");
    }
    // On success, isLoggedIn becomes true → Redirect fires
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Branding */}
        <View className="bg-primary pt-20 pb-14 px-8 rounded-b-[48px]">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-3 shadow-sm">
              <Ionicons name="leaf" size={28} color="#2E7D32" />
            </View>
            <View>
              <Text className="text-white text-3xl font-bold tracking-tight">
                TruGanic
              </Text>
              <Text className="text-green-100 text-xs font-medium tracking-widest uppercase">
                Transport Agent
              </Text>
            </View>
          </View>
          <Text className="text-green-100 text-base mt-2 leading-6">
            Sign in to manage your transport sessions and keep the supply chain
            secure.
          </Text>
        </View>

        {/* Form Card */}
        <View className="px-6 -mt-6">
          <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <Text className="text-gray-800 text-xl font-bold mb-1">
              Welcome Back
            </Text>
            <Text className="text-gray-400 text-sm mb-6">
              Enter your credentials to continue
            </Text>

            {/* API Error Banner */}
            {apiError && (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex-row items-center">
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text className="text-red-600 text-sm ml-2 flex-1">
                  {apiError}
                </Text>
              </View>
            )}

            {/* Email */}
            <View className="mb-4">
              <Text className="text-gray-600 text-sm font-semibold mb-1.5 ml-1">
                Email
              </Text>
              <View
                className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-3.5 ${
                  errors.email ? "border-red-400" : "border-gray-200"
                }`}
              >
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-gray-800 text-base"
                      placeholder="you@example.com"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      editable={!isLoading}
                    />
                  )}
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 text-xs ml-1 mt-1">
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* Password */}
            <View className="mb-2">
              <Text className="text-gray-600 text-sm font-semibold mb-1.5 ml-1">
                Password
              </Text>
              <View
                className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-3.5 ${
                  errors.password ? "border-red-400" : "border-gray-200"
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="flex-1 ml-3 text-gray-800 text-base"
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      editable={!isLoading}
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-xs ml-1 mt-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.85}
              className={`mt-6 py-4 rounded-xl flex-row items-center justify-center shadow-sm ${
                isLoading ? "bg-green-400" : "bg-primary"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={22} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Sign In
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign-Up Link */}
          <View className="flex-row justify-center items-center mt-8 mb-10">
            <Text className="text-gray-400 text-sm">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
              <Text className="text-primary font-bold text-sm">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
