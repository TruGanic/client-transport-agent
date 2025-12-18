import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardTypeOptions, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Project Imports
import { Colors } from '@/src/constants/theme';
import { db } from '@/src/database/client'; // Ensure this points to your drizzle client
import { harvestBatches } from '@/src/database/schema';
import { HarvestFormValues, harvestSchema } from '@/src/features/harvesting/schema';

export default function HarvestingScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Setup Form Controller
  const { control, handleSubmit, reset, formState: { errors } } = useForm<HarvestFormValues>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      produceType: '',
      supplierId: '',
      weightKg: '',
      notes: ''
    }
  });

  // 2. Handle Local Save
  const onSave = async (data: HarvestFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate Batch ID generation (In real app, use UUID or counter)
      const batchCode = `BATCH-${Date.now().toString().slice(-6)}`;

      await db.insert(harvestBatches).values({
        batchId: batchCode,
        produceType: data.produceType,
        supplierId: data.supplierId,
        weightKg: parseFloat(data.weightKg),
        notes: data.notes || '',
        recordedAt: Date.now(),
        syncStatus: 'PENDING'
      });

      Alert.alert("Success", `Batch ${batchCode} Saved Locally! 💾`);
      reset(); // Clear form
      // Optional: Navigate or stay
      
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save data locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable Input Component (Internal for cleaner code)
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
            <Text className="text-white font-bold text-lg">Saving...</Text>
          ) : (
            <>
              <Ionicons name="save-outline" size={24} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-lg">Save Batch Locally</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Sync Status Hint */}
        <View className="mt-6 flex-row justify-center items-center">
          <Ionicons name="wifi-outline" size={16} color={Colors.textSecondary} />
          <Text className="text-gray-500 text-xs ml-2">
            Data will be synced automatically when online.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}