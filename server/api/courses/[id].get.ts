import { asc, eq } from "drizzle-orm";
import { coursesTable, lessonsTable } from "~/../shared/schema";
import { useDb } from "~~/server/composables/db.composable";
import { getWithUsers } from "~~/server/utils/withUsers.util.ts";

export default defineEventHandler(async (event) => {
    const { db } = useDb();

    const courseId = getRouterParam(event, "id");

    if (!courseId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Course ID is required",
        });
    }

    const withUsers = await getWithUsers(event);

    const course = await db.query.coursesTable.findFirst({
        where: eq(coursesTable.id, courseId),
        with: {
            sessions: {
                with: {
                    lessons: {
                        orderBy: [asc(lessonsTable.start)],
                    },
                    registrations: withUsers,
                },
            },
        },
    });

    if (!course) {
        throw createError({
            statusCode: 404,
            statusMessage: "Course not found",
        });
    }

    return course;
});
