import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sessionsTable } from "./sessions.schema";
import { relations } from "drizzle-orm";

export const lessonsTable = sqliteTable("lessons", {
    id: text().primaryKey().notNull(),
    sessionId: text()
        .notNull()
        .references(() => sessionsTable.id, { onDelete: "cascade" }),
    start: integer({ mode: "timestamp" }).notNull(),
    end: integer({ mode: "timestamp" }).notNull(),
});

export const lessonHasOneSession = relations(lessonsTable, ({ one }) => ({
    session: one(sessionsTable, {
        fields: [lessonsTable.sessionId],
        references: [sessionsTable.id],
    }),
}));
