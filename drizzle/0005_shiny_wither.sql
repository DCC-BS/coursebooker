CREATE TABLE `ics_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionId` text NOT NULL,
	`version` integer NOT NULL,
	`changes` text,
	`createdAt` integer NOT NULL,
	`createdBy` text,
	FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `users_sessions` ADD `ics_version_received` integer;