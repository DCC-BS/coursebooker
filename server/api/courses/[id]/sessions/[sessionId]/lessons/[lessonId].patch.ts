import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import {
    type ChangeDescription,
    createOrUpdateVersion,
} from "~~/server/utils/icsVersion.utils";
import { updateLessonSchema } from "~~/shared/models";
import { lessonsTable, sessionsTable } from "~~/shared/schema";

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

    const body = updateLessonSchema.parse(await readBody(event));

    const currentLesson = await db.query.lessonsTable.findFirst({
        where: eq(lessonsTable.id, lessonId),
    });

    if (!currentLesson) {
        throw createError({
            statusCode: 404,
            statusMessage: "Lesson not found",
        });
    }

    const currentSession = await db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.id, sessionId),
    });

    if (!currentSession) {
        throw createError({
            statusCode: 404,
            statusMessage: "Session not found",
        });
    }

    const lesson = await db
        .update(lessonsTable)
        .set(body)
        .where(eq(lessonsTable.id, lessonId))
        .returning();

    const changes: ChangeDescription[] = [];

    if (body.start || body.end) {
        const oldStart = format(currentLesson.start, "dd.MM.yyyy HH:mm");
        const newStart = format(
            body.start ?? currentLesson.start,
            "dd.MM.yyyy HH:mm",
        );
        changes.push({
            type: "lesson_updated",
            description: `${oldStart} → ${newStart}`,
        });
    }

    if (changes.length > 0) {
        await createOrUpdateVersion(sessionId, changes, "admin");
    }

    return lesson;
});
