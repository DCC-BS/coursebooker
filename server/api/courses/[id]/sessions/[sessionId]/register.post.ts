import { eq } from "drizzle-orm";
import { z } from "zod";
import { useDb } from "~~/server/composables/db.composable";
import { getUserSession } from "~~/server/utils/getUserSession.utils";
import { usersToSessionsTable, userTable } from "~~/shared/schema";

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

    const user = await db.query.userTable.findFirst({
        where: eq(userTable.email, values.userEmail),
    });

    if (!user) {
        await db.insert(userTable).values({
            email: values.userEmail,
            isAdmin: false,
        });
    }

    await db.insert(usersToSessionsTable).values({
        sessionId: sessionId,
        userEmail: values.userEmail,
    });
});
