import { eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { sessionsTable } from "~~/shared/schema";

export default defineEventHandler(async (event) => {
    const { db } = useDb();
    const courseId = getRouterParam(event, "id");

    if (!courseId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Course ID is required",
        });
    }

    const sessions = db.query.sessionsTable.findMany({
        where: eq(sessionsTable.courseId, courseId),
        with: {
            lessons: true,
        },
    });

    return sessions;
});
