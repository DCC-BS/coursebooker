import { and, eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { sessionsTable } from "~~/shared/schema";
import { getWithUsers } from "~~/server/utils/withUsers.util.ts";

export default defineEventHandler(async (event) => {
    const { db } = useDb();
    const courseId = getRouterParam(event, "id");
    const sessionId = getRouterParam(event, "sessionId");

    const withUsers = await getWithUsers(event);

    if (!courseId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Course ID is required",
        });
    }

    if (!sessionId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Session ID is required",
        });
    }

    const session = await db.query.sessionsTable.findFirst({
        where: and(
            eq(sessionsTable.id, sessionId),
            eq(sessionsTable.courseId, courseId),
        ),
        with: {
            lessons: true,
            users: withUsers,
        },
    });

    if (!session) {
        throw createError({
            statusCode: 404,
            statusMessage: "Session not found",
        });
    }

    return session;
});
