import { getDatabase } from "../../../../../../services/database";

export default defineEventHandler(async (event) => {
    const db = await getDatabase();
    const courseId = getRouterParam(event, "id");
    const sessionId = getRouterParam(event, "sessionId");
    const lessonId = getRouterParam(event, "lessonId");

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

    if (!lessonId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Lesson ID is required",
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

    // Get lesson before deletion for response
    const lesson = await db.getLessonById(lessonId);

    if (!lesson) {
        throw createError({
            statusCode: 404,
            statusMessage: "Lesson not found",
        });
    }

    const deleted = await db.deleteLesson(lessonId);

    if (!deleted) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to delete lesson",
        });
    }

    return {
        success: true,
        message: "Lesson deleted successfully",
        lesson,
        sessionId,
        courseId,
    };
});
