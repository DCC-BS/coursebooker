import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import {
    type ChangeDescription,
    createOrUpdateVersion,
} from "~~/server/utils/icsVersion.utils";
import { createLessonSchema } from "~~/shared/models";
import { lessonsTable, sessionsTable } from "~~/shared/schema";

export default defineAdminResponseHandler(async (event) => {
    const { db } = useDb();
    const sessionId = getRouterParam(event, "sessionId");

    if (!sessionId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Session ID is required",
        });
    }

    const body = createLessonSchema.parse(await readBody(event));
    body.id = uuidv7();

    const currentSession = await db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.id, sessionId),
    });

    if (!currentSession) {
        throw createError({
            statusCode: 404,
            statusMessage: "Session not found",
        });
    }

    const lesson = await db.insert(lessonsTable).values(body).returning();

    const changes: ChangeDescription[] = [
        {
            type: "lesson_added",
            description: `${format(body.start, "dd.MM.yyyy HH:mm")} - ${format(body.end, "HH:mm")}`,
        },
    ];

    await createOrUpdateVersion(sessionId, changes, "admin");

    return lesson[0];
});
