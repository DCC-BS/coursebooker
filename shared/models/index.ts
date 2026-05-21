import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import * as z from "zod";

import {
    coursesTable,
    lessonsTable,
    sessionsTable,
    usersToSessionsTable,
    userTable,
} from "../schema";

export const sessionToUsersSchema = createSelectSchema(
    usersToSessionsTable,
).extend({
    users: createSelectSchema(userTable),
});

export const lessonSchema = createSelectSchema(lessonsTable, {
    start: z.coerce.date(),
    end: z.coerce.date(),
});

export const sessionSchema = createSelectSchema(sessionsTable).extend({
    lessons: z.array(lessonSchema),
    registrations: z.array(createSelectSchema(usersToSessionsTable)).optional(),
    ics_file: z.any().optional(),
});

export const courseSchemaWithoutSessions = createSelectSchema(coursesTable, {
    organizer_mail: z.email(),
});

export const courseSchema = courseSchemaWithoutSessions.extend({
    sessions: z.array(sessionSchema),
});

export const coursesSchema = z.array(courseSchema);

export const createCourseSchema = createInsertSchema(coursesTable, {
    organizer_mail: z.email(),
    id: z.string().optional(),
});

export const updateCourseSchema = createUpdateSchema(coursesTable, {
    organizer_mail: z.email().optional(),
});

export const createSessionSchema = createInsertSchema(sessionsTable, {
    id: z.string().max(0).optional().default(""),
    ics_file: z.any().optional(),
});
export const updateSessionSchema = createUpdateSchema(sessionsTable, {
    ics_file: z.any().optional(),
});

export const createLessonSchema = createInsertSchema(lessonsTable, {
    id: z.string().max(0).optional().default(""),
    start: z.coerce.date(),
    end: z.coerce.date(),
});

export const updateLessonSchema = createUpdateSchema(lessonsTable, {
    start: z.coerce.date(),
    end: z.coerce.date(),
});

export const userToSessionSchema = createSelectSchema(
    usersToSessionsTable,
).extend({
    session: sessionSchema,
});

export const userSchema = createSelectSchema(userTable).extend({
    registrations: z.array(userToSessionSchema),
});

export type User = z.infer<typeof userSchema>;
export type Course = z.infer<typeof courseSchema>;
export type CourseWithoutSessions = z.infer<typeof courseSchemaWithoutSessions>;
export type Session = z.infer<typeof sessionSchema>;
export type Lesson = z.infer<typeof lessonSchema>;

export type CreateCourse = Omit<typeof coursesTable.$inferInsert, "id">;
export type UpdateCourse = Partial<CreateCourse>;

export type SessionRegistration = typeof usersToSessionsTable.$inferSelect & {
    user: User;
};

export type UserRegistration = typeof usersToSessionsTable.$inferSelect & {
    session: Session;
};

export type CreateLesson = Omit<typeof lessonsTable.$inferInsert, "id">;
export type UpdateLesson = Partial<CreateLesson>;

export type CreateSession = Omit<typeof sessionsTable.$inferInsert, "id"> & {
    ics_file?: Blob;
};
export type UpdateSession = Partial<CreateSession>;
