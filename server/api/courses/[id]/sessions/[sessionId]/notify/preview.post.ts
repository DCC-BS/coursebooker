import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import { buildCustomNotificationMailContent } from "~~/server/utils/mail.utils";
import type { Session } from "~~/shared/models";
import { coursesTable, lessonsTable, sessionsTable } from "~~/shared/schema";

const previewSchema = z.object({
    message: z.string().min(1, "Message is required"),
    includeIcs: z.boolean().default(true),
});

export default defineAdminResponseHandler(async (event) => {
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

    const body = previewSchema.parse(await readBody(event));

    const course = await useDb().db.query.coursesTable.findFirst({
        where: eq(coursesTable.id, courseId),
    });

    if (!course) {
        throw createError({
            statusCode: 404,
            statusMessage: "Course not found",
        });
    }

    const session = await useDb().db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.id, sessionId),
        with: {
            lessons: {
                orderBy: [desc(lessonsTable.start)],
            },
        },
    });

    if (!session) {
        throw createError({
            statusCode: 404,
            statusMessage: "Session not found",
        });
    }

    const { subject, body: mailBody } = buildCustomNotificationMailContent(
        "Vorname",
        "Nachname",
        course,
        session as Session,
        body.message,
    );

    return {
        subject,
        body: mailBody,
        includeIcs: body.includeIcs,
    };
});
