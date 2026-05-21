import { desc, eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import {
    type ChangeDescription,
    createOrUpdateVersion,
} from "~~/server/utils/icsVersion.utils";
import { updateSessionSchema } from "~~/shared/models";
import { lessonsTable, sessionsTable } from "~~/shared/schema";

export default defineAdminResponseHandler(async (event) => {
    const { db } = useDb();
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

    const formData = await readFormData(event);
    const data = {
        location: (formData.get("location") as string)?.trim() || null,
        teams_link: (formData.get("teams_link") as string)?.trim() || null,
        ics_file: formData.get("ics_file"),
    };

    const body = updateSessionSchema.parse(data);

    if (body.ics_file) {
        body.ics_file = Buffer.from(await body.ics_file.arrayBuffer());
        body.ics_url = `/api/courses/${courseId}/sessions/${sessionId}/ics`;
    }

    const currentSession = await db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.id, sessionId),
        with: {
            lessons: {
                orderBy: [desc(lessonsTable.start)],
            },
        },
    });

    if (!currentSession) {
        throw createError({
            statusCode: 404,
            statusMessage: "Session not found",
        });
    }

    const changes: ChangeDescription[] = [];

    if (
        body.location !== undefined &&
        body.location !== currentSession.location
    ) {
        const oldVal = currentSession.location || "Nicht gesetzt";
        const newVal = body.location || "Nicht gesetzt";
        changes.push({
            type: "location",
            description: `${oldVal} → ${newVal}`,
        });
    }

    if (
        body.teams_link !== undefined &&
        body.teams_link !== currentSession.teams_link
    ) {
        if (currentSession.teams_link && !body.teams_link) {
            changes.push({ type: "teams_link", description: "entfernt" });
        } else if (!currentSession.teams_link && body.teams_link) {
            changes.push({ type: "teams_link", description: "hinzugefügt" });
        } else {
            changes.push({ type: "teams_link", description: "aktualisiert" });
        }
    }

    await db
        .update(sessionsTable)
        .set(body)
        .where(eq(sessionsTable.id, sessionId));

    if (changes.length > 0) {
        await createOrUpdateVersion(sessionId, changes, "admin");
    }

    const updatedSession = await db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.id, sessionId),
        with: {
            lessons: {
                orderBy: [desc(lessonsTable.start)],
            },
        },
    });

    return updatedSession;
});
