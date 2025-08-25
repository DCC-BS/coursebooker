import type { Lesson } from "../../../../../../../shared/models/lession.model";
import { getDatabase } from "../../../../../../services/database";

export default defineEventHandler(async (event) => {
    try {
        const db = await getDatabase();
        const courseId = getRouterParam(event, "id");
        const sessionId = getRouterParam(event, "sessionId");
        const lessonId = getRouterParam(event, "lessonId");

        if (!courseId) {
            throw createError({
                statusCode: 400,
                statusMessage: "Course ID is required",
            });
        }

        if (!sessionId) {
            throw createError({
                statusCode: 400,
                statusMessage: "Session ID is required",
            });
        }

        if (!lessonId) {
            throw createError({
                statusCode: 400,
                statusMessage: "Lesson ID is required",
            });
        }

        // Check if course exists
        const courseExists = await db.courseExists(courseId);
        if (!courseExists) {
            throw createError({
                statusCode: 404,
                statusMessage: "Course not found",
            });
        }

        // Check if session exists
        const sessionExists = await db.sessionExists(sessionId);
        if (!sessionExists) {
            throw createError({
                statusCode: 404,
                statusMessage: "Session not found",
            });
        }

        const body = (await readBody(event)) as Partial<Lesson>;

        // Validate dates if provided
        if (body.start && body.end) {
            const startDate = new Date(body.start);
            const endDate = new Date(body.end);

            if (
                Number.isNaN(startDate.getTime()) ||
                Number.isNaN(endDate.getTime())
            ) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Invalid date format",
                });
            }

            if (startDate >= endDate) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Start time must be before end time",
                });
            }
        }

        const updatedLesson = await db.updateLesson(lessonId, body);

        if (!updatedLesson) {
            throw createError({
                statusCode: 404,
                statusMessage: "Lesson not found",
            });
        }

        return {
            success: true,
            lesson: updatedLesson,
            sessionId,
            courseId,
        };
    } catch (error) {
        if (error && typeof error === "object" && "statusCode" in error) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            statusMessage: "Internal server error",
        });
    }
});
