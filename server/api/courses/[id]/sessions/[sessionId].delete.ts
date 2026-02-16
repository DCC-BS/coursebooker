import { desc, eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import { sendCancellationMail } from "~~/server/utils/mail.utils";
import { isSessionInPast } from "~~/server/utils/session.utils";
import { firstCharToUpper } from "~~/server/utils/string.utils";
import type { Session } from "~~/shared/models";
import {
    coursesTable,
    lessonsTable,
    sessionsTable,
    usersToSessionsTable,
} from "~~/shared/schema";

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

    const courseSession = await db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.id, sessionId),
        with: {
            lessons: {
                orderBy: [desc(lessonsTable.start)],
            },
        },
    });

    if (!courseSession) {
        throw createError({
            statusCode: 404,
            statusMessage: "Session not found",
        });
    }

    const course = await db.query.coursesTable.findFirst({
        where: eq(coursesTable.id, courseId),
    });

    if (!course) {
        throw createError({
            statusCode: 404,
            statusMessage: "Course not found",
        });
    }

    const registrations = await db.query.usersToSessionsTable.findMany({
        where: eq(usersToSessionsTable.sessionId, sessionId),
    });

    if (
        registrations.length > 0 &&
        !isSessionInPast(courseSession as Session)
    ) {
        for (const registration of registrations) {
            const userEmail = registration.userEmail;
            const given_name = firstCharToUpper(userEmail.split(".")[0] || "");
            const family_name = firstCharToUpper(
                userEmail.split(".")[1]?.split("@")[0] || "",
            );

            sendCancellationMail(
                family_name,
                given_name,
                userEmail,
                course,
                courseSession as Session,
            );
        }
    }

    await db
        .delete(usersToSessionsTable)
        .where(eq(usersToSessionsTable.sessionId, sessionId));

    await db.delete(lessonsTable).where(eq(lessonsTable.sessionId, sessionId));

    const deletedSession = await db
        .delete(sessionsTable)
        .where(eq(sessionsTable.id, sessionId))
        .returning();

    return deletedSession;
});
