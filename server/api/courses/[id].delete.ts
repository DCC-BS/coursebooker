import { eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { coursesTable } from "~~/shared/schema";

export default defineEventHandler(async (event) => {
    const { db } = useDb();
    const courseId = getRouterParam(event, "id");

    if (!courseId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Course ID is required",
        });
    }

    const deleted = await db
        .delete(coursesTable)
        .where(eq(coursesTable.id, courseId))
        .returning();

    if (deleted.length < 1) {
        throw createError({
            statusCode: 404,
            statusMessage: "Course not found",
        });
    }

    return {
        success: true,
        message: "Course deleted successfully",
    };
});
