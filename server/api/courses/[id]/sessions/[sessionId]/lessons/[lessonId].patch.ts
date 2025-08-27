// import type { Lesson } from "../../../../../../../shared/models/lession.model";
// import { getDatabase } from "../../../../../../services/database";

// export default defineEventHandler(async (event) => {
//     try {
//         const db = await getDatabase();
//         const courseId = getRouterParam(event, "id");
//         const sessionId = getRouterParam(event, "sessionId");
//         const lessonId = getRouterParam(event, "lessonId");

//         if (!courseId) {
//             throw createError({
//                 statusCode: 400,
//                 statusMessage: "Course ID is required",
//             });
//         }

//         if (!sessionId) {
//             throw createError({
//                 statusCode: 400,
//                 statusMessage: "Session ID is required",
//             });
//         }

//         if (!lessonId) {
//             throw createError({
//                 statusCode: 400,
//                 statusMessage: "Lesson ID is required",
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

//         // Check if session exists
//         const sessionExists = await db.sessionExists(sessionId);
//         if (!sessionExists) {
//             throw createError({
//                 statusCode: 404,
//                 statusMessage: "Session not found",
//             });
//         }

//         const body = (await readBody(event)) as Partial<Lesson>;

//         // Only validate and update provided fields
//         const updates: Partial<Lesson> = {};

//         if (body.start !== undefined) {
//             const startDate = new Date(body.start);
//             if (Number.isNaN(startDate.getTime())) {
//                 throw createError({
//                     statusCode: 400,
//                     statusMessage: "Invalid start date format",
//                 });
//             }
//             updates.start = startDate;
//         }

//         if (body.end !== undefined) {
//             const endDate = new Date(body.end);
//             if (Number.isNaN(endDate.getTime())) {
//                 throw createError({
//                     statusCode: 400,
//                     statusMessage: "Invalid end date format",
//                 });
//             }
//             updates.end = endDate;
//         }

//         // Check if start is before end (if both are provided or if updating one and getting the other from existing)
//         if (updates.start || updates.end) {
//             const existingLesson = await db.getLessonById(lessonId);
//             if (!existingLesson) {
//                 throw createError({
//                     statusCode: 404,
//                     statusMessage: "Lesson not found",
//                 });
//             }

//             const finalStart = updates.start || existingLesson.start;
//             const finalEnd = updates.end || existingLesson.end;

//             if (finalStart >= finalEnd) {
//                 throw createError({
//                     statusCode: 400,
//                     statusMessage: "Start time must be before end time",
//                 });
//             }
//         }

//         const updatedLesson = await db.updateLesson(lessonId, updates);

//         if (!updatedLesson) {
//             throw createError({
//                 statusCode: 404,
//                 statusMessage: "Lesson not found",
//             });
//         }

//         return {
//             success: true,
//             lesson: updatedLesson,
//             updated_fields: Object.keys(updates),
//             sessionId,
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
