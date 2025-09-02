import { useDb } from "../composables/db.composable";
import type { H3Event } from "h3";
import { getUserSession } from "./getUserSession.utils";

export async function isAdmin(event: H3Event) {
    const { db } = useDb();
    const session = await getUserSession(event);

    const user = await db.query.userTable.findFirst({
        where: (users, { eq }) =>
            eq(users.email, session?.user?.email?.trim() ?? ""),
    });

    return user?.isAdmin ?? false;
}

export async function guardAdmin(event: H3Event) {
    if (!(await isAdmin(event))) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
        });
    }
}
