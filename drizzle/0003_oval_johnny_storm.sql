ALTER TABLE `harvest_batches` ADD `farmer_name` text;--> statement-breakpoint
ALTER TABLE `harvest_batches` ADD `pickup_location` text;--> statement-breakpoint
ALTER TABLE `harvest_batches` ADD `min_temp` real;--> statement-breakpoint
ALTER TABLE `harvest_batches` ADD `max_temp` real;--> statement-breakpoint
ALTER TABLE `harvest_batches` ADD `avg_temp_aggregate` real;--> statement-breakpoint
ALTER TABLE `harvest_batches` ADD `is_trip_completed` integer DEFAULT 0;