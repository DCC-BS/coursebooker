import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import {
    createOrUpdateVersion,
    getUsersWithVersionStatus,
    setUserIcsVersion,
} from "~~/server/utils/icsVersion.utils";
import { sendCustomNotificationMail } from "~~/server/utils/mail.utils";
import { firstCharToUpper } from "~~/server/utils/string.utils";
import type { Session } from "~~/shared/models";
import { coursesTable, lessonsTable, sessionsTable } from "~~/shared/schema";

const notifySchema = z.object({
    message: z.string().default(""),
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

    const recipients = usersWithVersion.filter((u) =>
        body.recipients.includes(u.userEmail),
    );

    if (recipients.length === 0) {
        return {
            success: true,
            sentCount: 0,
            failedCount: 0,
            message: "No recipients to notify",
        };
    }

    let actualVersion = 0;

    if (body.includeIcs) {
        const version = await createOrUpdateVersion(
            sessionId,
            [
                {
                    type: "manual",
                    description: body.message
                        ? body.message.substring(0, 100)
                        : "Manuelle Benachrichtigung",
                },
            ],
            "admin",
        );
        actualVersion = version.version;
    }

    const BATCH_SIZE = 20;
    let sentCount = 0;
    let failedCount = 0;
    const failedRecipients: string[] = [];

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
            batch.map(async (recipient) => {
                const userEmail = recipient.userEmail;
                const givenName = firstCharToUpper(
                    userEmail.split(".")[0] || "",
                );
                const familyName = firstCharToUpper(
                    userEmail.split(".")[1]?.split("@")[0] || "",
                );

                const success = await sendCustomNotificationMail(
                    familyName,
                    givenName,
                    userEmail,
                    course,
                    session as Session,
                    body.message,
                    actualVersion,
                    body.includeIcs,
                );

                if (!success) {
                    return { email: userEmail, success: false };
                }

                if (body.includeIcs) {
                    await setUserIcsVersion(
                        userEmail,
                        sessionId,
                        actualVersion,
                    );
                }

                return { email: userEmail, success: true };
            }),
        );

        for (const result of results) {
            if (result.status === "fulfilled" && result.value.success) {
                sentCount++;
            } else {
                failedCount++;
                if (result.status === "fulfilled" && !result.value.success) {
                    failedRecipients.push(result.value.email);
                }
            }
        }

        if (i + BATCH_SIZE < recipients.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    return {
        success: failedCount === 0,
        sentCount,
        failedCount,
        failedRecipients,
        newVersion: actualVersion,
    };
});
