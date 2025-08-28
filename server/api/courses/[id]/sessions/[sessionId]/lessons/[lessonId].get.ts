import { eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { lessonsTable } from "~~/shared/schema";

export default defineEventHandler(async (event) => {
    const { db } = useDb();
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
    const lesson = await db.query.lessonsTable.findFirst({
        where: eq(lessonsTable.id, lessonId),
    });

    return lesson;
});
