import type { Lesson } from "../../../../../../../shared/models/lession.model";
import { getDatabase } from "../../../../../../services/database";

export default defineEventHandler(async (event) => {
    try {
        const db = await getDatabase();
        const courseId = getRouterParam(event, "id");
        const sessionId = getRouterParam(event, "sessionId");

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

        const body = (await readBody(event)) as Lesson;

        // Validate required fields
        if (!body.start || !body.end) {
            throw createError({
                statusCode: 400,
                statusMessage: "Lesson must have start and end dates",
            });
        }

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

        // Generate ID if not provided
        if (!body.id) {
            body.id = `lesson-${Date.now()}`;
        }

        const newLesson: Lesson = {
            id: body.id,
            start: startDate,
            end: endDate,
        };

        const createdLesson = await db.createLesson(sessionId, newLesson);

        setResponseStatus(event, 201);
        return {
            success: true,
            lesson: createdLesson,
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
