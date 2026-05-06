import { eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { getWithUsers } from "~~/server/utils/withUsers.util.ts";
import { sessionsTable } from "~~/shared/schema";

export default defineEventHandler(async (event) => {
    const { db } = useDb();
    const courseId = getRouterParam(event, "id");

    const withUsers = await getWithUsers(event);

    if (!courseId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Course ID is required",
        });
    }

    const sessions = db.query.sessionsTable.findMany({
        where: eq(sessionsTable.courseId, courseId),
        columns: { ics_file: false },
        with: {
            lessons: true,
            users: withUsers,
        },
    });

    return sessions;
});
