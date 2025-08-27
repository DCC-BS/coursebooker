import { coursesTable, type sessionsTable, type lessonsTable } from "../schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type Lesson = typeof lessonsTable.$inferSelect;

export type Session = typeof sessionsTable.$inferSelect & {
    lessons: Lesson[];
};

export type Course = typeof coursesTable.$inferSelect & {
    sessions: Session[];
};

export type CreateCourse = typeof coursesTable.$inferInsert;
export type UpdateCourse = Partial<CreateCourse>;
export const createCourseSchema = createInsertSchema(coursesTable, {
    organizer_mail: z.email(),
});
export const updateCourseSchema = createUpdateSchema(coursesTable, {
    organizer_mail: z.email().optional(),
});

export type CreateSession = typeof sessionsTable.$inferInsert;
export type UpdateSession = Partial<CreateSession>;

export type CreateLesson = typeof lessonsTable.$inferInsert;
export type UpdateLesson = Partial<CreateLesson>;
