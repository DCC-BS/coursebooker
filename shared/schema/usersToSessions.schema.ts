import { relations } from "drizzle-orm";
import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sessionsTable } from "./sessions.schema";
import { userTable } from "./users.schema";

export const usersToSessionsTable = sqliteTable(
    "users_sessions",
    {
        userEmail: text("user_email")
            .notNull()
            .references(() => userTable.email),
        sessionId: text("session_id")
            .notNull()
            .references(() => sessionsTable.id),
    },
    (t) => [primaryKey({ columns: [t.userEmail, t.sessionId] })],
);

export const usersToSessionsRelations = relations(
    usersToSessionsTable,
    ({ one }) => ({
        user: one(userTable, {
            fields: [usersToSessionsTable.userEmail],
            references: [userTable.email],
        }),
        session: one(sessionsTable, {
            fields: [usersToSessionsTable.sessionId],
            references: [sessionsTable.id],
        }),
    }),
);
