import { getDatabase } from "../../services/database";

export default defineEventHandler(async () => {
    const db = await getDatabase();

    // Get all statistics from the database
    const [
        totalCourses,
        organizers,
        locations,
        averageDuration,
        nextCourse,
        allCourses,
    ] = await Promise.all([
        db.getCoursesCount(),
        db.getCoursesByOrganizer(),
        db.getCoursesByLocation(),
        db.getAverageDuration(),
        db.getNextUpcomingCourse(),
        db.getAllCourses(),
    ]);

    // Calculate upcoming and past courses from all courses
    const now = new Date();
    const upcomingCourses = allCourses.filter((course) => {
        // Check if any session has lessons that are in the future
        return course.sessions.some((session) =>
            session.lessons.some((lesson) => new Date(lesson.start) > now),
        );
    }).length;

    const pastCourses = totalCourses - upcomingCourses;

    return {
        total_courses: totalCourses,
        upcoming_courses: upcomingCourses,
        past_courses: pastCourses,
        organizers,
        locations,
        average_duration_hours: Math.round(averageDuration * 100) / 100,
        next_course: nextCourse,
    };
});
