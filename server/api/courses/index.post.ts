import type { CreateCourseInput } from "../../../shared/models/courses.model";
import { getDatabase } from "../../services/database";

export default defineEventHandler(async (event) => {
    try {
        const db = await getDatabase();
        const body = (await readBody(event)) as CreateCourseInput;

        // Validate required fields
        if (
            !body.title ||
            !body.organizer_mail ||
            !body.sessions ||
            body.sessions.length === 0
        ) {
            throw createError({
                statusCode: 400,
                statusMessage:
                    "Missing required fields: title, organizer_mail, sessions",
            });
        }

        // Validate that sessions have lessons
        for (const session of body.sessions) {
            if (!session.lessons || session.lessons.length === 0) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Each session must have at least one lesson",
                });
            }

            // Validate lesson dates
            for (const lesson of session.lessons) {
                if (!lesson.start || !lesson.end) {
                    throw createError({
                        statusCode: 400,
                        statusMessage:
                            "Each lesson must have start and end dates",
                    });
                }

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

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.organizer_mail)) {
            throw createError({
                statusCode: 400,
                statusMessage: "Invalid email format for organizer_mail",
            });
        }
        // Validate course type
        if (body.type && !["course", "event"].includes(body.type)) {
            throw createError({
                statusCode: 400,
                statusMessage: "Type must be either 'course' or 'event'",
            });
        }

        // Generate ID if not provided
        if (!body.id) {
            body.id = `${body.title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`;
        }

        // Ensure required fields have defaults
        const newCourse: CreateCourseInput = {
            id: body.id,
            type: body.type || "course",
            title: body.title,
            description: body.description || "",
            teams_link: body.teams_link || "",
            organizer_name: body.organizer_name || "",
            organizer_mail: body.organizer_mail,
            sessions: body.sessions.map((session, sessionIndex) => ({
                id: session.id || `session-${sessionIndex + 1}`,
                location: session.location,
                teams_link: session.teams_link,
                lessons: session.lessons.map((lesson, lessonIndex) => ({
                    id: lesson.id || `lesson-${lessonIndex + 1}`,
                    start: new Date(lesson.start),
                    end: new Date(lesson.end),
                })),
            })),
        };

        const createdCourse = await db.createCourse(newCourse);

        setResponseStatus(event, 201);
        return {
            success: true,
            course: createdCourse,
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
