import type { CourseSession } from "../../../../../shared/models/session.model";
import { getDatabase } from "../../../../services/database";

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

        const body = (await readBody(event)) as Partial<CourseSession>;

        // Only validate and update provided fields
        const updates: Partial<CourseSession> = {};

        if (body.location !== undefined) {
            updates.location = body.location;
        }

        if (body.teams_link !== undefined) {
            updates.teams_link = body.teams_link;
        }

        if (body.lessons !== undefined) {
            // Validate lessons
            for (const lesson of body.lessons) {
                if (lesson.start && lesson.end) {
                    const startDate = new Date(lesson.start);
                    const endDate = new Date(lesson.end);

                    if (
                        Number.isNaN(startDate.getTime()) ||
                        Number.isNaN(endDate.getTime())
                    ) {
                        throw createError({
                            statusCode: 400,
                            statusMessage: "Invalid date format in lessons",
                        });
                    }

                    if (startDate >= endDate) {
                        throw createError({
                            statusCode: 400,
                            statusMessage:
                                "Lesson start time must be before end time",
                        });
                    }
                }
            }
            updates.lessons = body.lessons;
        }

        const updatedSession = await db.updateSession(sessionId, updates);

        if (!updatedSession) {
            throw createError({
                statusCode: 404,
                statusMessage: "Session not found",
            });
        }

        return {
            success: true,
            session: updatedSession,
            updated_fields: Object.keys(updates),
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
