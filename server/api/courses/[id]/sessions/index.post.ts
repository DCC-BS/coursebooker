// import type { CourseSession } from "../../../../../shared/models/session.model";
// import { getDatabase } from "../../../../services/database";

// export default defineEventHandler(async (event) => {
//     try {
//         const db = await getDatabase();
//         const courseId = getRouterParam(event, "id");

//         if (!courseId) {
//             throw createError({
//                 statusCode: 400,
//                 statusMessage: "Course ID is required",
//             });
//         }

//         // Check if course exists
//         const courseExists = await db.courseExists(courseId);
//         if (!courseExists) {
//             throw createError({
//                 statusCode: 404,
//                 statusMessage: "Course not found",
//             });
//         }

//         const body = (await readBody(event)) as CourseSession;

//         // Validate required fields
//         if (!body.lessons || body.lessons.length === 0) {
//             throw createError({
//                 statusCode: 400,
//                 statusMessage: "Session must have at least one lesson",
//             });
//         }

//         // Validate lesson dates
//         for (const lesson of body.lessons) {
//             if (!lesson.start || !lesson.end) {
//                 throw createError({
//                     statusCode: 400,
//                     statusMessage: "Each lesson must have start and end dates",
//                 });
//             }

//             const startDate = new Date(lesson.start);
//             const endDate = new Date(lesson.end);

//             if (
//                 Number.isNaN(startDate.getTime()) ||
//                 Number.isNaN(endDate.getTime())
//             ) {
//                 throw createError({
//                     statusCode: 400,
//                     statusMessage: "Invalid date format in lessons",
//                 });
//             }

//             if (startDate >= endDate) {
//                 throw createError({
//                     statusCode: 400,
//                     statusMessage: "Lesson start time must be before end time",
//                 });
//             }
//         }

//         // Generate ID if not provided
//         if (!body.id) {
//             body.id = `session-${Date.now()}`;
//         }

//         // Ensure lesson IDs
//         body.lessons = body.lessons.map((lesson, index) => ({
//             ...lesson,
//             id: lesson.id || `lesson-${index + 1}`,
//             start: new Date(lesson.start),
//             end: new Date(lesson.end),
//         }));

//         const createdSession = await db.createSession(courseId, body);

//         setResponseStatus(event, 201);
//         return {
//             success: true,
//             session: createdSession,
//             courseId,
//         };
//     } catch (error) {
//         if (error && typeof error === "object" && "statusCode" in error) {
//             throw error;
//         }

//         throw createError({
//             statusCode: 500,
//             statusMessage: "Internal server error",
//         });
//     }
// });
