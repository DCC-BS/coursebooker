import { and, eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { sessionsTable } from "~~/shared/schema";

export default defineEventHandler(async (event) => {
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

    const session = await db.query.sessionsTable.findFirst({
        where: and(
            eq(sessionsTable.id, sessionId),
            eq(sessionsTable.courseId, courseId),
        ),
        columns: { ics_file: true },
    });

    if (!session) {
        throw createError({
            statusCode: 404,
            statusMessage: "Session not found",
        });
    }

    if (!session.ics_file) {
        throw createError({
            statusCode: 404,
            statusMessage: "ICS file not found for this session",
        });
    }

    // Set headers for file download
    setHeader(event, "Content-Type", "text/calendar");
    setHeader(
        event,
        "Content-Disposition",
        `attachment; filename="session-${sessionId}.ics"`,
    );
    setHeader(event, "Cache-Control", "no-cache");

    return session.ics_file;
});
