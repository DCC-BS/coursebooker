import { useDb } from "~~/server/composables/db.composable";
import { coursesTable } from "~~/shared/schema";
import { updateCourseSchema } from "~~/shared/models";
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

    const body = updateCourseSchema.parse(await readBody(event));

    const updatedCourse = await db
        .update(coursesTable)
        .set(body)
        .where(eq(coursesTable.id, courseId))
        .returning();

    if (updatedCourse.length < 1) {
        throw createError({
            statusCode: 404,
            statusMessage: "Course not found",
        });
    }

    return updatedCourse;
});
