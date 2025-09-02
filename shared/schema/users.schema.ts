import { relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { usersToSessionsTable } from "./usersToSessions.schema";

export const userTable = sqliteTable("users", {
    email: text("email").primaryKey(),
    isAdmin: integer({ mode: "boolean" }).default(false).notNull(),
});

export const userAttendsSession = relations(userTable, ({ many }) => ({
    registrations: many(usersToSessionsTable),
}));
