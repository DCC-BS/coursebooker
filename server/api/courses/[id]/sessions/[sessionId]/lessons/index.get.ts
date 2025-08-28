import { and, eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { lessonsTable } from "~~/shared/schema";

export default defineEventHandler(async (event) => {
    const { db } = useDb();
    const courseId = getRouterParam(event, "id");
    const sessionId = getRouterParam(event, "sessionId");

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

    const lessons = await db.query.lessonsTable.findMany({
        where: and(eq(lessonsTable.sessionId, sessionId)),
    });

    return lessons;
});
