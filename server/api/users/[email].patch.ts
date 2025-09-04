import { eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { userTable } from "~~/shared/schema";
import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

const updateUserSchema = createUpdateSchema(userTable, {
    email: z.string().max(0).optional(),
});

export default defineAdminResponseHandler(async (event) => {
    const { db } = useDb();

    const email = getRouterParam(event, "email");

    const body = updateUserSchema.parse(await readBody(event));

    if (!email) {
        throw createError({
            statusCode: 400,
            statusMessage: "Email is required",
        });
    }

    if (!body.isAdmin) {
        const session = await getUserSession(event);

        if (session?.user.email?.trim() === email.trim()) {
            throw createError({
                statusCode: 400,
                statusMessage: "You cannot change your own admin status",
            });
        }
    }

    const user = await db
        .update(userTable)
        .set(body)
        .where(eq(userTable.email, email))
        .returning();

    if (!user) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    return user[0];
});
