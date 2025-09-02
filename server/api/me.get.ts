import { getServerSession } from "#auth";
import { userTable } from "~~/shared/schema";
import { useDb } from "../composables/db.composable";
import { eq } from "drizzle-orm";
import type { User } from "~~/shared/models";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);
    const { db } = useDb();

    if (!session?.user?.email) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const user = await db.query.userTable.findFirst({
        where: eq(userTable.email, session?.user?.email),
        with: {
            registrations: {
                with: {
                    session: {
                        with: {
                            lessons: true,
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        return {
            email: session.user.email,
            // biome-ignore lint/suspicious/noDuplicateObjectKeys: false positive
            isAdmin: false,
            registrations: [],
        } as User;
    }

    return user;
});
