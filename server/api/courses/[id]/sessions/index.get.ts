import { getDatabase } from "../../../../services/database";

export default defineEventHandler(async (event) => {
    const db = await getDatabase();
    const courseId = getRouterParam(event, "id");

    if (!courseId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Course ID is required",
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

    const sessions = await db.getSessionsByCourseId(courseId);

    return {
        sessions,
        courseId,
        total: sessions.length,
    };
});
