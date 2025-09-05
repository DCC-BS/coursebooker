import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sessionsTable } from "./sessions.schema";

export const coursesTable = sqliteTable("courses", {
    id: text().primaryKey().notNull(),
    title: text({ length: 255 }).notNull(),
    description: text().notNull(),
    type: text({ enum: ["course", "event"] }).notNull(),
    organizer_name: text({ length: 100 }).notNull(),
    organizer_mail: text({ length: 100 }).notNull(),
});

export const courseHasManySessions = relations(coursesTable, ({ many }) => ({
    sessions: many(sessionsTable),
}));
