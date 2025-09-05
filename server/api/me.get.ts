import { asc, eq } from "drizzle-orm";
import type { User } from "~~/shared/models";
import { lessonsTable, userTable } from "~~/shared/schema";
import { useDb } from "../composables/db.composable";

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event);
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
                            lessons: {
                                orderBy: [asc(lessonsTable.start)],
                            },
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        return {
            email: session.user.email,
            isAdmin: false,
            registrations: [],
        } as User;
    }

    return user;
});
