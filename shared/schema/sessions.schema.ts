import { relations } from "drizzle-orm";
import { sqliteTable, text, blob } from "drizzle-orm/sqlite-core";
import { coursesTable } from "./courses.schema";
import { lessonsTable } from "./lessons.schema";
import { usersToSessionsTable } from "./usersToSessions.schema";

export const sessionsTable = sqliteTable("sessions", {
    id: text().primaryKey().notNull(),
    courseId: text()
        .notNull()
        .references(() => coursesTable.id, { onDelete: "cascade" }),
    location: text({ length: 255 }),
    teams_link: text({ length: 500 }),
    ics_file: blob({ mode: "buffer" }),
});

export const SessionHasOneCourse = relations(sessionsTable, ({ one }) => ({
    course: one(coursesTable, {
        fields: [sessionsTable.courseId],
        references: [coursesTable.id],
    }),
}));

export const SessionHasManyLessons = relations(sessionsTable, ({ many }) => ({
    lessons: many(lessonsTable),
}));

export const sessionHasManyUsers = relations(sessionsTable, ({ many }) => ({
    registrations: many(usersToSessionsTable),
}));
