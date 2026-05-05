import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sessionsTable } from "./sessions.schema";

export const icsVersionsTable = sqliteTable("ics_versions", {
    id: text().primaryKey().notNull(),
    sessionId: text()
        .notNull()
        .references(() => sessionsTable.id, { onDelete: "cascade" }),
    version: integer({ mode: "number" }).notNull(),
    changes: text(),
    createdAt: integer({ mode: "timestamp" }).notNull(),
    createdBy: text(),
});

export type IcsVersion = InferSelectModel<typeof icsVersionsTable>;

export type ChangeDescription = {
    type:
        | "location"
        | "teams_link"
        | "lesson_added"
        | "lesson_updated"
        | "lesson_deleted"
        | "manual";
    description: string;
};

export const icsVersionsRelations = relations(icsVersionsTable, ({ one }) => ({
    session: one(sessionsTable, {
        fields: [icsVersionsTable.sessionId],
        references: [sessionsTable.id],
    }),
}));
