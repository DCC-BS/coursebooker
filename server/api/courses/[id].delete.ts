import { eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import {
    coursesTable,
    sessionsTable,
    usersToSessionsTable,
} from "~~/shared/schema";

export default defineAdminResponseHandler(async (event) => {
    const { db } = useDb();
    const courseId = getRouterParam(event, "id");

    if (!courseId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Course ID is required",
        });
    }

    const existingSessions = await db.query.sessionsTable.findMany({
        where: eq(sessionsTable.courseId, courseId),
        columns: {
            id: true,
        },
    });

    if (existingSessions.length > 0) {
        await db
            .delete(usersToSessionsTable)
            .where(eq(usersToSessionsTable.sessionId, courseId));

        await db
            .delete(sessionsTable)
            .where(eq(sessionsTable.courseId, courseId));
    }

    const deleted = await db
        .delete(coursesTable)
        .where(eq(coursesTable.id, courseId))
        .returning();

    if (deleted.length < 1) {
        throw createError({
            statusCode: 404,
            statusMessage: "Course not found",
        });
    }

    return deleted;
});
