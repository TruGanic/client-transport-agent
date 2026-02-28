import { SignUpFormValues, signUpSchema } from "@/src/features/auth/schema";
import { useAuthStore } from "@/src/store/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setApiError(null);
    const result = await signUp({
      email: data.email,
      password: data.password,
      username: data.username,
      mobile: data.mobile,
    });

    if (!result.success) {
      setApiError(result.error || "Sign up failed");
      return;
    }

    Alert.alert(
      "Account Created",
      "Your account has been created successfully. You can now sign in.",
      [{ text: "Sign In", onPress: () => router.replace("/(auth)") }],
    );
  };

  // Reusable field renderer
  const FormField = ({
    name,
    label,
    icon,
    placeholder,
    secureTextEntry,
    showToggle,
    toggleShow,
    keyboardType = "default",
    autoCapitalize = "none",
  }: {
    name: keyof SignUpFormValues;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    placeholder: string;
    secureTextEntry?: boolean;
    showToggle?: boolean;
    toggleShow?: () => void;
    keyboardType?: "default" | "email-address" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
  }) => (
    <View className="mb-4">
      <Text className="text-gray-600 text-sm font-semibold mb-1.5 ml-1">
        {label}
      </Text>
      <View
        className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-3.5 ${
          errors[name] ? "border-red-400" : "border-gray-200"
        }`}
      >
        <Ionicons name={icon} size={20} color="#9CA3AF" />
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              secureTextEntry={secureTextEntry}
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isLoading}
            />
          )}
        />
        {showToggle && toggleShow && (
          <TouchableOpacity onPress={toggleShow} hitSlop={8}>
            <Ionicons
              name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[name] && (
        <Text className="text-red-500 text-xs ml-1 mt-1">
          {errors[name]?.message as string}
        </Text>
      )}
    </View>
  );

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
        {/* Header */}
        <View className="bg-primary pt-16 pb-12 px-8 rounded-b-[48px]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-5"
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
            <Text className="text-green-100 text-sm ml-1.5 font-medium">
              Back
            </Text>
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold tracking-tight">
            Create Account
          </Text>
          <Text className="text-green-100 text-base mt-2 leading-6">
            Join the TruGanic traceability network as a transport agent.
          </Text>
        </View>

        {/* Form Card */}
        <View className="px-6 -mt-6">
          <View className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            {/* API Error Banner */}
            {apiError && (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex-row items-center">
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text className="text-red-600 text-sm ml-2 flex-1">
                  {apiError}
                </Text>
              </View>
            )}

            <FormField
              name="username"
              label="Username"
              icon="person-outline"
              placeholder="e.g. asiri_transport"
              autoCapitalize="none"
            />

            <FormField
              name="email"
              label="Email"
              icon="mail-outline"
              placeholder="you@example.com"
              keyboardType="email-address"
            />

            <FormField
              name="mobile"
              label="Mobile Number"
              icon="call-outline"
              placeholder="+94 77 123 4567"
              keyboardType="phone-pad"
            />

            <FormField
              name="password"
              label="Password"
              icon="lock-closed-outline"
              placeholder="Min. 6 characters"
              secureTextEntry={!showPassword}
              showToggle
              toggleShow={() => setShowPassword(!showPassword)}
            />

            <FormField
              name="confirmPassword"
              label="Confirm Password"
              icon="shield-checkmark-outline"
              placeholder="Re-enter password"
              secureTextEntry={!showConfirm}
              showToggle
              toggleShow={() => setShowConfirm(!showConfirm)}
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.85}
              className={`mt-4 py-4 rounded-xl flex-row items-center justify-center shadow-sm ${
                isLoading ? "bg-green-400" : "bg-primary"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={22} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Create Account
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View className="flex-row justify-center items-center mt-8 mb-10">
            <Text className="text-gray-400 text-sm">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)")}>
              <Text className="text-primary font-bold text-sm">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
