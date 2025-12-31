import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardTypeOptions, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Project Imports
import { Colors } from '@/src/constants/theme';
import { HarvestFormValues, harvestSchema } from '@/src/features/harvesting/schema';
import { SyncService } from '@/src/services/sync.service';

import { useTripManager } from '@/src/hooks/useTripManager'; // Import hook

export default function HarvestingScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setActiveBatchId } = useTripManager(); // Get setter

  // 1. Setup Form Controller
  const { control, handleSubmit, reset, formState: { errors } } = useForm<HarvestFormValues>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      produceType: '',
      supplierId: '',
      farmerName: '',
      pickupLocation: '',
      weightKg: '',
      notes: ''
    }
  });

  // 2. Handle Save via SyncService
  const onSave = async (data: HarvestFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate Batch ID generation
      const batchCode = `BATCH-${Date.now().toString().slice(-6)}`;

      const formData = {
        batchId: batchCode,
        produceType: data.produceType,
        supplierId: data.supplierId,
        farmerName: data.farmerName,
        pickupLocation: data.pickupLocation,
        weightKg: data.weightKg,
        notes: data.notes || '',
      };

      // Use SyncService for "Optimistic Sync"
      const result = await SyncService.submitPickup(formData);

      if (result.synced) {
        Alert.alert("Success", `Batch ${batchCode} Synced to Blockchain! 🔗`);
      } else {
        Alert.alert("Saved Offline", `Batch ${batchCode} Saved Locally. Queued for sync. 💾`);
      }

      // Update Global Store with Active Batch
      setActiveBatchId(batchCode);
      console.log(`✅ Active Batch Set: ${batchCode}`);

      reset(); // Clear form

    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable Input Component
  const FormInput = ({ name, placeholder, icon, keyboardType = 'default', label }: { name: keyof HarvestFormValues; placeholder: string; icon: keyof typeof Ionicons.glyphMap; keyboardType?: KeyboardTypeOptions; label: string }) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-semibold mb-1 ml-1">{label}</Text>
      <View className={clsx(
        "flex-row items-center bg-white border rounded-xl px-4 py-3 shadow-sm",
        errors[name] ? "border-red-500" : "border-gray-200"
      )}>
        <Ionicons name={icon} size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
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
        <Text className="text-red-500 text-xs ml-1 mt-1">{errors[name]?.message as string}</Text>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-5 py-6" contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header Section */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900">New Harvest Collection</Text>
          <Text className="text-gray-500 mt-1">Enter batch details for tracking.</Text>
        </View>

        {/* Form Card */}
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">

          <FormInput
            name="produceType"
            label="Produce Type"
            placeholder="e.g. Cavendish Bananas"
            icon="leaf-outline"
          />

          <FormInput
            name="supplierId"
            label="Supplier / Farm ID"
            placeholder="e.g. FARM-001"
            icon="business-outline"
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

          <View className="flex-row justify-between space-x-4">
            <View className="flex-1">
              <FormInput
                name="weightKg"
                label="Weight (Kg)"
                placeholder="0.00"
                keyboardType="numeric"
                icon="scale-outline"
              />
            </View>
          </View>

          <FormInput
            name="notes"
            label="Notes (Optional)"
            placeholder="Quality checks, etc."
            icon="clipboard-outline"
          />

        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          onPress={handleSubmit(onSave)}
          disabled={isSubmitting}
          className={clsx(
            "mt-8 py-4 rounded-xl shadow-md flex-row justify-center items-center",
            isSubmitting ? "bg-green-700" : "bg-green-600"
          )}
        >
          {isSubmitting ? (
            <Text className="text-white font-bold text-lg">Processing...</Text>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={24} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-lg">Confirm Pickup</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Sync Status Hint */}
        <View className="mt-6 flex-row justify-center items-center">
          <Ionicons name="wifi-outline" size={16} color={Colors.textSecondary} />
          <Text className="text-gray-500 text-xs ml-2">
            Auto-sync enabled for offline/online transitions.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}