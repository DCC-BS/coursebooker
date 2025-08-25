import type { UpdateCourseInput } from "../../../shared/models/courses.model";
import { getDatabase } from "../../services/database";

export default defineEventHandler(async (event) => {
    try {
        const db = await getDatabase();
        const courseId = getRouterParam(event, "id");

        if (!courseId) {
            throw createError({
                statusCode: 400,
                statusMessage: "Course ID is required",
            });
        }

        const body = (await readBody(event)) as UpdateCourseInput;

        // Only validate and update provided fields
        const updates: Partial<UpdateCourseInput> = {};

        if (body.title !== undefined) {
            updates.title = body.title;
        }

        if (body.type !== undefined) {
            if (!["course", "event"].includes(body.type)) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Type must be either 'course' or 'event'",
                });
            }
            updates.type = body.type;
        }

        if (body.description !== undefined) {
            updates.description = body.description;
        }

        if (body.teams_link !== undefined) {
            updates.teams_link = body.teams_link;
        }

        if (body.organizer_name !== undefined) {
            updates.organizer_name = body.organizer_name;
        }

        if (body.organizer_mail !== undefined) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.organizer_mail)) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Invalid email format for organizer_mail",
                });
            }
            updates.organizer_mail = body.organizer_mail;
        }

        if (body.sessions !== undefined) {
            // Validate sessions
            for (const session of body.sessions) {
                if (session.lessons) {
                    for (const lesson of session.lessons) {
                        if (lesson.start && lesson.end) {
                            const startDate = new Date(lesson.start);
                            const endDate = new Date(lesson.end);

                            if (
                                Number.isNaN(startDate.getTime()) ||
                                Number.isNaN(endDate.getTime())
                            ) {
                                throw createError({
                                    statusCode: 400,
                                    statusMessage:
                                        "Invalid date format in lessons",
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
                }
            }
            updates.sessions = body.sessions;
        }

        const updatedCourse = await db.updateCourse(courseId, updates);

        if (!updatedCourse) {
            throw createError({
                statusCode: 404,
                statusMessage: "Course not found",
            });
        }

        return {
            success: true,
            course: updatedCourse,
            updated_fields: Object.keys(updates),
        };
    } catch (error) {
        if (error && typeof error === "object" && "statusCode" in error) {
            throw error;
        }

        if (error instanceof Error) {
            if (error.message.includes("already exists")) {
                throw createError({
                    statusCode: 409,
                    statusMessage: error.message,
                });
            }
        }

        throw createError({
            statusCode: 500,
            statusMessage: "Internal server error",
        });
    }
});
