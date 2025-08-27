import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { coursesTable } from "./courses.schema";
import { lessonsTable } from "./lessons.schema";
import { relations } from "drizzle-orm";

export const sessionsTable = sqliteTable("sessions", {
    id: text().primaryKey().notNull(),
    courseId: text()
        .notNull()
        .references(() => coursesTable.id, { onDelete: "cascade" }),
    location: text({ length: 255 }),
    teams_link: text({ length: 500 }),
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
