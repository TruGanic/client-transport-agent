ALTER TABLE `sensor_batches` ADD `avg_temp` real;--> statement-breakpoint
UPDATE `sensor_batches` SET `avg_temp` = `avg_value`;--> statement-breakpoint
ALTER TABLE `sensor_batches` DROP COLUMN `avg_value`;