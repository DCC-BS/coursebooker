import { useDb } from "~~/server/composables/db.composable";
import { coursesTable } from "~/../shared/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const { db } = useDb();

    const courseId = getRouterParam(event, "id");

    if (!courseId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Course ID is required",
        });
    }

    const course = await db.query.coursesTable.findFirst({
        where: eq(coursesTable.id, courseId),
        with: {
            sessions: {
                with: {
                    lessons: true,
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
