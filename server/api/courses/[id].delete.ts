import { getDatabase } from "../../services/database";

export default defineEventHandler(async (event) => {
    const db = await getDatabase();
    const courseId = getRouterParam(event, "id");

    if (!courseId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Course ID is required",
        });
    }

    // Get course before deletion for response
    const course = await db.getCourseById(courseId);

    if (!course) {
        throw createError({
            statusCode: 404,
            statusMessage: "Course not found",
        });
    }

    const deleted = await db.deleteCourse(courseId);

    if (!deleted) {
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to delete course",
        });
    }

    return {
        success: true,
        message: "Course deleted successfully",
        course,
    };
});
