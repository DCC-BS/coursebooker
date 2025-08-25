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

    const course = await db.getCourseById(courseId);

    if (!course) {
        throw createError({
            statusCode: 404,
            statusMessage: "Course not found",
        });
    }

    return {
        course,
        id: courseId,
    };
});
