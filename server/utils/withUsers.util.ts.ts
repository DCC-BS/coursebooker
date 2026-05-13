import type { H3Event } from "h3";
import { useDb } from "../composables/db.composable";

export async function getWithUsers(event: H3Event) {
    const query = getQuery(event);
    const withUsers = query.withUsers as string | undefined;
    const { db } = useDb();

    if (withUsers && withUsers === "true") {
        const session = await getUserSession(event);

        const user = await db.query.userTable.findFirst({
            where: (users, { eq }) =>
                eq(users.email, session?.email?.trim() ?? ""),
        });

        const isAdmin = user?.isAdmin ?? false;

        if (!isAdmin) {
            throw createError({
                statusCode: 403,
                statusMessage: "Forbidden",
            });
        }
    }

    return withUsers === "true";
}
