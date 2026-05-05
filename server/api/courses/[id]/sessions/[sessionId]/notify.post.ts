import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import {
    createOrUpdateVersion,
    getCurrentVersion,
    getUsersWithVersionStatus,
    setUserIcsVersion,
} from "~~/server/utils/icsVersion.utils";
import { sendCustomNotificationMail } from "~~/server/utils/mail.utils";
import { firstCharToUpper } from "~~/server/utils/string.utils";
import type { Session } from "~~/shared/models";
import { coursesTable, lessonsTable, sessionsTable } from "~~/shared/schema";

const notifySchema = z.object({
    message: z.string().min(1, "Message is required"),
    includeIcs: z.boolean().default(true),
    recipients: z
        .array(z.string().email())
        .min(1, "At least one recipient is required"),
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

    const body = notifySchema.parse(await readBody(event));

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

    const usersWithVersion = await getUsersWithVersionStatus(sessionId);

    const currentVersion = await getCurrentVersion(sessionId);
    const newVersion = (currentVersion?.version ?? 0) + 1;

    const recipients = usersWithVersion.filter((u) =>
        body.recipients.includes(u.userEmail),
    );

    if (recipients.length === 0) {
        return {
            success: true,
            sentCount: 0,
            message: "No recipients to notify",
        };
    }

    if (body.includeIcs) {
        await createOrUpdateVersion(
            sessionId,
            [{ type: "manual", description: body.message.substring(0, 100) }],
            "admin",
        );
    }

    let sentCount = 0;

    for (const recipient of recipients) {
        const userEmail = recipient.userEmail;
        const givenName = firstCharToUpper(userEmail.split(".")[0] || "");
        const familyName = firstCharToUpper(
            userEmail.split(".")[1]?.split("@")[0] || "",
        );

        sendCustomNotificationMail(
            familyName,
            givenName,
            userEmail,
            course,
            session as Session,
            body.message,
            body.includeIcs ? newVersion : currentVersion,
        );

        if (body.includeIcs) {
            await setUserIcsVersion(userEmail, sessionId, newVersion);
        }

        sentCount++;
    }

    return {
        success: true,
        sentCount,
        newVersion: body.includeIcs ? newVersion : currentVersion,
    };
});
