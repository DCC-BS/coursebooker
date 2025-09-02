import { eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import { updateLessonSchema } from "~~/shared/models";
import { lessonsTable } from "~~/shared/schema";

export default defineAdminResponseHandler(async (event) => {
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
    const body = updateLessonSchema.parse(await readBody(event));

    const lesson = await db
        .update(lessonsTable)
        .set(body)
        .where(eq(lessonsTable.id, lessonId))
        .returning();

    if (!lesson) {
        throw createError({
            statusCode: 404,
            statusMessage: "Lesson not found",
        });
    }

    return lesson;
});
