import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { useDb } from "~~/server/composables/db.composable";
import { sendUnregisterMail } from "~~/server/utils/mail.utils";
import { firstCharToUpper } from "~~/server/utils/string.utils";
import type { Session } from "~~/shared/models";
import {
    coursesTable,
    lessonsTable,
    sessionsTable,
    usersToSessionsTable,
} from "~~/shared/schema";

const schema = z.object({
    userEmail: z.email().nonempty(),
});

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

    const values = schema.parse(await readBody(event));
    const session = await getUserSession(event);
    let registrationIsForMe = false;

    if (values.userEmail === "me") {
        registrationIsForMe = true;
        if (session?.email) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
            });
        }

        values.userEmail = session?.email || "";
    }

    // user can only register therself when they are not an admin
    if (session?.email !== values.userEmail) {
        await guardAdmin(event);
    }

    const result = await db
        .delete(usersToSessionsTable)
        .where(
            and(
                eq(usersToSessionsTable.sessionId, sessionId),
                eq(usersToSessionsTable.userEmail, values.userEmail),
            ),
        );

    const course = await db.query.coursesTable.findFirst({
        where: eq(coursesTable.id, courseId),
    });

    const courseSession = await db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.id, sessionId),
        with: {
            lessons: {
                orderBy: [desc(lessonsTable.start)],
            },
        },
    });

    if (!course || !courseSession) {
        throw createError({
            statusCode: 404,
            statusMessage: "Course or Session not found",
        });
    }

    const given_name = registrationIsForMe
        ? (session?.given_name as string) || session?.name?.split(" ")[0] || ""
        : firstCharToUpper(values.userEmail.split(".")[0] ?? "");

    const family_name = registrationIsForMe
        ? (session?.family_name as string) ||
          session?.name?.split(" ").slice(1).join(" ") ||
          ""
        : firstCharToUpper(values.userEmail.split(".")[1]?.split("@")[0] ?? "");

    await sendUnregisterMail(
        family_name,
        given_name,
        values.userEmail,
        course,
        courseSession as Session,
    );

    if (result.rowsAffected <= 0) {
        throw createError({
            statusCode: 404,
            statusMessage: "User is not registered for this session",
        });
    }
});
