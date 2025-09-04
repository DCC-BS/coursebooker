import { useDb } from "~~/server/composables/db.composable";
import { userTable } from "~~/shared/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const createUserSchema = createInsertSchema(userTable, {
    email: z.email("Invalid email address"),
    isAdmin: z.boolean().default(false),
});

export default defineAdminResponseHandler(async (event) => {
    const { db } = useDb();

    const body = createUserSchema.parse(await readBody(event));

    try {
        const user = await db.insert(userTable).values(body).returning();

        if (!user || user.length === 0) {
            throw createError({
                statusCode: 500,
                statusMessage: "Failed to create user",
            });
        }

        return user[0];
    } catch (error: unknown) {
        if (
            error instanceof Error &&
            error.message?.includes("UNIQUE constraint failed")
        ) {
            throw createError({
                statusCode: 409,
                statusMessage: "User with this email already exists",
            });
        }
        throw error;
    }
});
