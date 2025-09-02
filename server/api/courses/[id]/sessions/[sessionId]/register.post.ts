import { useDb } from "~~/server/composables/db.composable";
import { usersToSessionsTable } from "~~/shared/schema";
import { z } from "zod";
import { getUserSession } from "~~/server/utils/getUserSession.utils";

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

    if (values.userEmail === "me") {
        if (session?.user.email) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
            });
        }

        values.userEmail = session?.user.email || "";
    }

    // user can only register therself when they are not an admin
    if (session?.user.email !== values.userEmail) {
        await guardAdmin(event);
    }

    await db.insert(usersToSessionsTable).values({
        sessionId: sessionId,
        userEmail: values.userEmail,
    });
});
