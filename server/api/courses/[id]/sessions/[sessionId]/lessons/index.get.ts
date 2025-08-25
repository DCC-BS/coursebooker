import { getDatabase } from "../../../../../../services/database";

export default defineEventHandler(async (event) => {
    const db = await getDatabase();
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

    // Check if course exists
    const courseExists = await db.courseExists(courseId);
    if (!courseExists) {
        throw createError({
            statusCode: 404,
            statusMessage: "Course not found",
        });
    }

    // Check if session exists
    const sessionExists = await db.sessionExists(sessionId);
    if (!sessionExists) {
        throw createError({
            statusCode: 404,
            statusMessage: "Session not found",
        });
    }

    const lessons = await db.getLessonsBySessionId(sessionId);

    return {
        lessons,
        sessionId,
        courseId,
        total: lessons.length,
    };
});
