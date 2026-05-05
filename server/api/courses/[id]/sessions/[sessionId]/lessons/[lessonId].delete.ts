import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import {
    type ChangeDescription,
    createOrUpdateVersion,
} from "~~/server/utils/icsVersion.utils";
import { lessonsTable } from "~~/shared/schema";

export default defineAdminResponseHandler(async (event) => {
    const { db } = useDb();
    const sessionId = getRouterParam(event, "sessionId");
    const lessonId = getRouterParam(event, "lessonId");

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

    const currentLesson = await db.query.lessonsTable.findFirst({
        where: eq(lessonsTable.id, lessonId),
    });

    if (!currentLesson) {
        throw createError({
            statusCode: 404,
            statusMessage: "Lesson not found",
        });
    }

    const lesson = await db
        .delete(lessonsTable)
        .where(eq(lessonsTable.id, lessonId))
        .returning();

    if (!lesson) {
        throw createError({
            statusCode: 404,
            statusMessage: "Lesson not found",
        });
    }

    const changes: ChangeDescription[] = [
        {
            type: "lesson_deleted",
            description: `${format(currentLesson.start, "dd.MM.yyyy HH:mm")} - ${format(currentLesson.end, "HH:mm")}`,
        },
    ];

    await createOrUpdateVersion(sessionId, changes, "admin");

    return lesson;
});
