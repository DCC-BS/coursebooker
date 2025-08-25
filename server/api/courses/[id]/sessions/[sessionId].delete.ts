import { getDatabase } from "../../../../services/database";

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

    // Get session before deletion for response
    const session = await db.getSessionById(sessionId);

    if (!session) {
        throw createError({
            statusCode: 404,
            statusMessage: "Session not found",
        });
    }

    const deleted = await db.deleteSession(sessionId);

    if (!deleted) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to delete session",
        });
    }

    return {
        success: true,
        message: "Session deleted successfully",
        session,
        courseId,
    };
});
