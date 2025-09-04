import { eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import { updateCourseSchema } from "~~/shared/models";
import { coursesTable } from "~~/shared/schema";

export default defineAdminResponseHandler(async (event) => {
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
