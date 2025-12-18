CREATE TABLE `harvest_batches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`batch_id` text NOT NULL,
	`produce_type` text NOT NULL,
	`weight_kg` real NOT NULL,
	`supplier_id` text NOT NULL,
	`notes` text,
	`recorded_at` integer NOT NULL,
	`sync_status` text DEFAULT 'PENDING' NOT NULL,
	`merkle_root` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `harvest_batches_batch_id_unique` ON `harvest_batches` (`batch_id`);--> statement-breakpoint
CREATE TABLE `sensor_batches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`batch_hash` text,
	`start_time` integer,
	`end_time` integer,
	`avg_value` real,
	`is_synced` integer DEFAULT 0
);
