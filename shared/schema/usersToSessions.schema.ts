import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { userTable } from "./users.schema";
import { sessionsTable } from "./sessions.schema";
import { relations } from "drizzle-orm";

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
