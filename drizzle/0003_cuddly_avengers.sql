CREATE TABLE `mc_server` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`java_instance_id` text NOT NULL,
	`version` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`java_instance_id`) REFERENCES `java_instance`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `mc_server_name_idx` ON `mc_server` (`name`);