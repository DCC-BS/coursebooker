import type { H3Event } from "h3";
import { getServerSession } from "#auth";
import type { AzureSession } from "../models/azureSession.models";
import { useDb } from "../composables/db.composable";

export async function getWithUsers(event: H3Event) {
    const query = getQuery(event);
    const withUsers = query.withUsers as string | undefined;
    const { db } = useDb();

    if (withUsers && withUsers === "true") {
        const session = (await getServerSession(event)) as AzureSession | null;

        const user = await db.query.userTable.findFirst({
            where: (users, { eq }) =>
                eq(users.email, session?.user?.email?.trim() ?? ""),
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
