import { z } from 'zod';

export const harvestSchema = z.object({
  produceType: z.string().min(2, "Produce name is too short"),
  supplierId: z.string().min(3, "Supplier ID is required"),
  farmerName: z.string().min(2, "Farmer name is required"),
  pickupLocation: z.string().min(3, "Location is required"),
  weightKg: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid weight (e.g., 12.5)"),
  notes: z.string().optional(),
});

export type HarvestFormValues = z.infer<typeof harvestSchema>;