import { eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { userTable } from "~~/shared/schema";

export default defineAdminResponseHandler(async (event) => {
    const { db } = useDb();

    const email = getRouterParam(event, "email");

    if (!email) {
        throw createError({
            statusCode: 400,
            statusMessage: "Email is required",
        });
    }

    const user = await db.query.userTable.findFirst({
        where: eq(userTable.email, email),
    });

    return user;
});
