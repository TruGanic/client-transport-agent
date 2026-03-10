import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
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

type QRTarget = "supplierId" | "batchId" | null;

export default function HarvestingScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrTarget, setQRTarget] = useState<QRTarget>(null);
  const [pickupLocation, setPickupLocation] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<{
    uri: string;
    name: string;
  } | null>(null);
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
      batchId: "",
      produceType: "",
      supplierId: "",
      farmerName: "",
      weight: "",
      notes: "",
    },
  });

  // ─── Handle QR Scan Result ──────────────────────────────────────────
  const handleQRScan = (data: string) => {
    if (qrTarget) {
      setValue(qrTarget, data, { shouldValidate: true });
      setQRTarget(null);
    }
  };

  // ─── Get Current Location (GPS) ────────────────────────────────────
  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location access is needed to auto-detect pickup location.",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Try reverse geocoding for a readable address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      let locationStr: string;
      if (address) {
        const parts = [address.street, address.city, address.region].filter(
          Boolean,
        );
        locationStr =
          parts.length > 0
            ? parts.join(", ")
            : `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
      } else {
        locationStr = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
      }

      setPickupLocation(locationStr);
      console.log(`📍 Location: ${locationStr}`);
    } catch (e: any) {
      console.error("Location error:", e);
      Alert.alert("Error", "Failed to get current location.");
    } finally {
      setIsLocating(false);
    }
  };

  // ─── Pick Invoice File ──────────────────────────────────────────────
  const handlePickInvoice = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setInvoiceFile({ uri: asset.uri, name: asset.name });
        console.log(`📎 Invoice: ${asset.name}`);
      }
    } catch (e) {
      console.error("Document picker error:", e);
    }
  };

  const removeInvoice = () => setInvoiceFile(null);

  // ─── Handle Save via SyncService ────────────────────────────────────
  const onSave = async (data: HarvestFormValues) => {
    // Validate location
    if (!pickupLocation) {
      Alert.alert(
        "Location Required",
        "Please get your current location before submitting.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = {
        batchId: data.batchId,
        produceType: data.produceType,
        supplierId: data.supplierId,
        farmerName: data.farmerName,
        pickupLocation,
        weight: data.weight,
        notes: data.notes || "",
        invoiceUri: invoiceFile?.uri ?? null,
      };

      const result = await SyncService.submitPickup(formData);

      if (result.synced) {
        Alert.alert("Success", `Batch ${data.batchId} synced to backend! 🔗`);
      } else {
        Alert.alert(
          "Saved Offline",
          `Batch ${data.batchId} saved locally. Queued for sync. 💾`,
        );
      }

      setActiveBatchId(data.batchId);
      console.log(`✅ Active Batch Set: ${data.batchId}`);
      reset();
      setPickupLocation("");
      setInvoiceFile(null);
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

  // ─── QR Scanner Title ──────────────────────────────────────────────
  const qrTitle =
    qrTarget === "supplierId"
      ? "Scan Supplier / Farm QR"
      : qrTarget === "batchId"
        ? "Scan Batch ID QR"
        : "Scan QR Code";

  // ─── Invoice file preview helpers ───────────────────────────────────
  const isImageInvoice = invoiceFile?.name?.match(/\.(jpg|jpeg|png)$/i);

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
        {/* Header */}
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
            onPress={() => setQRTarget("batchId")}
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
            name="batchId"
            label="Batch ID"
            placeholder="e.g. BATCH-2025-X92 or scan QR"
            icon="cube-outline"
            qrField="batchId"
          />

          <FormInputWithQR
            name="supplierId"
            label="Supplier / Farm ID"
            placeholder="e.g. FARM-001 or scan QR"
            icon="business-outline"
            qrField="supplierId"
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
            name="weight"
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

          {/* ── Pickup Location ─── */}
          <View className="mt-4 mb-2">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="navigate-outline"
                size={18}
                color={Colors.primary}
              />
              <Text className="text-sm font-bold text-green-800 ml-2 uppercase tracking-wide">
                Pickup Location
              </Text>
            </View>
          </View>

          {/* Manual location input */}
          <View
            className={clsx(
              "flex-row items-center bg-white border rounded-xl px-4 py-3 shadow-sm mb-2",
              pickupLocation ? "border-green-300" : "border-gray-200",
            )}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={Colors.textSecondary}
              style={{ marginRight: 10 }}
            />
            <TextInput
              className="flex-1 text-gray-800 text-base"
              placeholder="Enter location or use GPS"
              placeholderTextColor="#9CA3AF"
              value={pickupLocation}
              onChangeText={setPickupLocation}
            />
            {pickupLocation ? (
              <TouchableOpacity
                onPress={() => setPickupLocation("")}
                className="ml-2 p-1"
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* GPS auto-detect button */}
          <TouchableOpacity
            onPress={handleGetLocation}
            disabled={isLocating}
            className="flex-row items-center justify-center border border-green-200 bg-green-50 rounded-xl px-4 py-2.5 mb-2"
            activeOpacity={0.7}
          >
            {isLocating ? (
              <>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text className="text-gray-500 ml-2 text-sm">
                  Detecting location...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="navigate" size={18} color={Colors.primary} />
                <Text className="text-green-700 font-semibold ml-2 text-sm">
                  {pickupLocation ? "Re-detect via GPS" : "Auto-detect via GPS"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── Invoice Upload (Optional) ─── */}
          <View className="mt-4 mb-2">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="document-attach-outline"
                size={18}
                color={Colors.primary}
              />
              <Text className="text-sm font-bold text-green-800 ml-2 uppercase tracking-wide">
                Invoice (Optional)
              </Text>
            </View>
          </View>

          {invoiceFile ? (
            <View className="border border-green-200 bg-green-50 rounded-xl p-3">
              <View className="flex-row items-center">
                {isImageInvoice ? (
                  <Image
                    source={{ uri: invoiceFile.uri }}
                    className="w-12 h-12 rounded-lg mr-3"
                    style={{ width: 48, height: 48 }}
                  />
                ) : (
                  <View className="w-12 h-12 rounded-lg bg-red-100 items-center justify-center mr-3">
                    <Ionicons name="document-text" size={24} color="#DC2626" />
                  </View>
                )}
                <View className="flex-1">
                  <Text
                    className="text-gray-800 font-medium text-sm"
                    numberOfLines={1}
                  >
                    {invoiceFile.name}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    Tap × to remove
                  </Text>
                </View>
                <TouchableOpacity onPress={removeInvoice} className="p-2">
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePickInvoice}
              className="flex-row items-center justify-center border border-dashed border-gray-300 rounded-xl py-4"
              activeOpacity={0.7}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color={Colors.textSecondary}
              />
              <Text className="text-gray-500 font-medium ml-2 text-sm">
                Upload PDF, JPG, or PNG
              </Text>
            </TouchableOpacity>
          )}
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
