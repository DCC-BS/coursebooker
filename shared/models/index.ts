import { coursesTable, sessionsTable, lessonsTable } from "../schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import * as z from "zod";
export type Lesson = typeof lessonsTable.$inferSelect;

export type Session = typeof sessionsTable.$inferSelect & {
    lessons: Lesson[];
};

export type Course = typeof coursesTable.$inferSelect & {
    sessions: Session[];
};

export type CreateCourse = Omit<typeof coursesTable.$inferInsert, "id">;
export type UpdateCourse = Partial<CreateCourse>;

export const createCourseSchema = createInsertSchema(coursesTable, {
    organizer_mail: z.email(),
    id: z.string().max(0).optional().default(""),
});
export const updateCourseSchema = createUpdateSchema(coursesTable, {
    organizer_mail: z.email().optional(),
});

export type CreateSession = Omit<typeof sessionsTable.$inferInsert, "id">;
export type UpdateSession = Partial<CreateSession>;

export const createSessionSchema = createInsertSchema(sessionsTable, {
    id: z.string().max(0).optional().default(""),
});
export const updateSessionSchema = createUpdateSchema(sessionsTable);

export type CreateLesson = typeof lessonsTable.$inferInsert;
export type UpdateLesson = Partial<CreateLesson>;

export const createLessonSchema = createInsertSchema(lessonsTable, {
    id: z.string().max(0).optional().default(""),
});
export const updateLessonSchema = createUpdateSchema(lessonsTable);
