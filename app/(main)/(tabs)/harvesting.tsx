import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardTypeOptions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Project Imports
import QRScannerModal from "@/src/components/QRScannerModal";
import { Colors } from "@/src/constants/theme";
import {
  HarvestFormValues,
  harvestSchema,
} from "@/src/features/harvesting/schema";
import { useTripManager } from "@/src/hooks/useTripManager";
import { SyncService } from "@/src/services/sync.service";

type QRTarget = "supplierId" | "foodBatchId" | null;

export default function HarvestingScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrTarget, setQRTarget] = useState<QRTarget>(null);
  const { setActiveBatchId } = useTripManager();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<HarvestFormValues>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      produceType: "",
      supplierId: "",
      foodBatchId: "",
      farmerName: "",
      pickupLocation: "",
      weightKg: "",
      notes: "",
    },
  });

  // Handle QR Scan Result
  const handleQRScan = (data: string) => {
    if (qrTarget) {
      setValue(qrTarget, data, { shouldValidate: true });
      setQRTarget(null);
    }
  };

  // Handle Save via SyncService
  const onSave = async (data: HarvestFormValues) => {
    setIsSubmitting(true);
    try {
      const batchCode =
        data.foodBatchId || `BATCH-${Date.now().toString().slice(-6)}`;

      const formData = {
        batchId: batchCode,
        produceType: data.produceType,
        supplierId: data.supplierId,
        foodBatchId: data.foodBatchId,
        farmerName: data.farmerName,
        pickupLocation: data.pickupLocation,
        weightKg: data.weightKg,
        notes: data.notes || "",
      };

      const result = await SyncService.submitPickup(formData);

      if (result.synced) {
        Alert.alert("Success", `Batch ${batchCode} Synced to Blockchain! 🔗`);
      } else {
        Alert.alert(
          "Saved Offline",
          `Batch ${batchCode} Saved Locally. Queued for sync. 💾`,
        );
      }

      setActiveBatchId(batchCode);
      console.log(`✅ Active Batch Set: ${batchCode}`);
      reset();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Reusable Form Input ────────────────────────────────────────────
  const FormInput = ({
    name,
    placeholder,
    icon,
    keyboardType = "default",
    label,
  }: {
    name: keyof HarvestFormValues;
    placeholder: string;
    icon: keyof typeof Ionicons.glyphMap;
    keyboardType?: KeyboardTypeOptions;
    label: string;
  }) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-semibold mb-1 ml-1">{label}</Text>
      <View
        className={clsx(
          "flex-row items-center bg-white border rounded-xl px-4 py-3 shadow-sm",
          errors[name] ? "border-red-500" : "border-gray-200",
        )}
      >
        <Ionicons
          name={icon}
          size={20}
          color={Colors.textSecondary}
          style={{ marginRight: 10 }}
        />
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="flex-1 text-gray-800 text-base"
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType={keyboardType}
            />
          )}
        />
      </View>
      {errors[name] && (
        <Text className="text-red-500 text-xs ml-1 mt-1">
          {errors[name]?.message as string}
        </Text>
      )}
    </View>
  );

  // ─── Form Input with QR Scan Button ─────────────────────────────────
  const FormInputWithQR = ({
    name,
    placeholder,
    icon,
    label,
    qrField,
  }: {
    name: keyof HarvestFormValues;
    placeholder: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    qrField: QRTarget;
  }) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-semibold mb-1 ml-1">{label}</Text>
      <View
        className={clsx(
          "flex-row items-center bg-white border rounded-xl px-3 py-1 shadow-sm",
          errors[name] ? "border-red-500" : "border-gray-200",
        )}
      >
        <Ionicons
          name={icon}
          size={20}
          color={Colors.textSecondary}
          style={{ marginRight: 8 }}
        />
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="flex-1 text-gray-800 text-base py-3"
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {/* QR Scan Button */}
        <TouchableOpacity
          onPress={() => setQRTarget(qrField)}
          className="ml-1 p-2 bg-green-50 rounded-lg border border-green-200"
          activeOpacity={0.7}
        >
          <Ionicons name="qr-code-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      {errors[name] && (
        <Text className="text-red-500 text-xs ml-1 mt-1">
          {errors[name]?.message as string}
        </Text>
      )}
    </View>
  );

  // ─── QR Scanner Title based on target ───────────────────────────────
  const qrTitle =
    qrTarget === "supplierId"
      ? "Scan Supplier / Farm QR"
      : qrTarget === "foodBatchId"
        ? "Scan Food Batch QR"
        : "Scan QR Code";

  return (
    <View className="flex-1 bg-gray-50">
      {/* QR Scanner Modal */}
      <QRScannerModal
        visible={qrTarget !== null}
        title={qrTitle}
        onScan={handleQRScan}
        onClose={() => setQRTarget(null)}
      />

      <ScrollView
        className="flex-1 px-5 py-6"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Section */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            New Harvest Collection
          </Text>
          <Text className="text-gray-500 mt-1">
            Enter batch details for tracking.
          </Text>
        </View>

        {/* QR Quick Actions */}
        <View className="flex-row mb-6 space-x-3">
          <TouchableOpacity
            onPress={() => setQRTarget("supplierId")}
            className="flex-1 flex-row items-center justify-center bg-green-50 border border-green-200 rounded-xl py-3 px-4"
            activeOpacity={0.7}
          >
            <Ionicons name="qr-code" size={20} color={Colors.primary} />
            <Text className="text-green-700 font-semibold ml-2 text-sm">
              Scan Farm QR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setQRTarget("foodBatchId")}
            className="flex-1 flex-row items-center justify-center bg-blue-50 border border-blue-200 rounded-xl py-3 px-4"
            activeOpacity={0.7}
          >
            <Ionicons name="barcode" size={20} color="#1D4ED8" />
            <Text className="text-blue-700 font-semibold ml-2 text-sm">
              Scan Batch QR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          {/* ── Identification Section ─── */}
          <View className="mb-2">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="finger-print-outline"
                size={18}
                color={Colors.primary}
              />
              <Text className="text-sm font-bold text-green-800 ml-2 uppercase tracking-wide">
                Identification
              </Text>
            </View>
          </View>

          <FormInputWithQR
            name="supplierId"
            label="Supplier / Farm ID"
            placeholder="e.g. FARM-001 or scan QR"
            icon="business-outline"
            qrField="supplierId"
          />

          <FormInputWithQR
            name="foodBatchId"
            label="Food Batch ID"
            placeholder="e.g. FB-20250715 or scan QR"
            icon="cube-outline"
            qrField="foodBatchId"
          />

          {/* ── Harvest Details Section ─── */}
          <View className="mt-4 mb-2">
            <View className="flex-row items-center mb-3">
              <Ionicons name="leaf-outline" size={18} color={Colors.primary} />
              <Text className="text-sm font-bold text-green-800 ml-2 uppercase tracking-wide">
                Harvest Details
              </Text>
            </View>
          </View>

          <FormInput
            name="produceType"
            label="Produce Type"
            placeholder="e.g. Cavendish Bananas"
            icon="nutrition-outline"
          />

          <FormInput
            name="farmerName"
            label="Farmer Name"
            placeholder="e.g. Saman"
            icon="person-outline"
          />

          <FormInput
            name="pickupLocation"
            label="Pickup Location"
            placeholder="e.g. Kegalle_Farm_A"
            icon="location-outline"
          />

          <FormInput
            name="weightKg"
            label="Weight (Kg)"
            placeholder="0.00"
            keyboardType="numeric"
            icon="scale-outline"
          />

          <FormInput
            name="notes"
            label="Notes (Optional)"
            placeholder="Quality checks, etc."
            icon="clipboard-outline"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit(onSave)}
          disabled={isSubmitting}
          className={clsx(
            "mt-8 py-4 rounded-xl shadow-md flex-row justify-center items-center",
            isSubmitting ? "bg-green-700" : "bg-green-600",
          )}
        >
          {isSubmitting ? (
            <Text className="text-white font-bold text-lg">Processing...</Text>
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={24}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-bold text-lg">
                Confirm Pickup
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Sync Status Hint */}
        <View className="mt-6 flex-row justify-center items-center">
          <Ionicons
            name="wifi-outline"
            size={16}
            color={Colors.textSecondary}
          />
          <Text className="text-gray-500 text-xs ml-2">
            Auto-sync enabled for offline/online transitions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
