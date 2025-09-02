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
export type Lesson = typeof lessonsTable.$inferSelect;

export type Session = typeof sessionsTable.$inferSelect & {
    lessons: Lesson[];
    registrations?: SessionRegistration[];
};

export type CreateCourse = Omit<typeof coursesTable.$inferInsert, "id">;
export type UpdateCourse = Partial<CreateCourse>;

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
});

export const courseSchema = createSelectSchema(coursesTable, {
    organizer_mail: z.email(),
}).extend({
    sessions: z.array(sessionSchema),
});

export type Course = z.infer<typeof courseSchema>;

export const coursesSchema = z.array(courseSchema);

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

export type CreateLesson = Omit<typeof lessonsTable.$inferInsert, "id">;
export type UpdateLesson = Partial<CreateLesson>;

export const createLessonSchema = createInsertSchema(lessonsTable, {
    id: z.string().max(0).optional().default(""),
    start: z.coerce.date(),
    end: z.coerce.date(),
});

export const updateLessonSchema = createUpdateSchema(lessonsTable);

export type SessionRegistration = typeof usersToSessionsTable.$inferSelect & {
    user: User;
};

export type UserRegistration = typeof usersToSessionsTable.$inferSelect & {
    session: Session;
};

export type User = typeof userTable.$inferSelect & {
    registrations: UserRegistration[];
};

export const userToSessionSchema = createSelectSchema(
    usersToSessionsTable,
).extend({
    session: sessionSchema,
});

export const userSchema = createSelectSchema(userTable).extend({
    registrations: z.array(userToSessionSchema),
});
