import type { Course, Lesson, Session } from "~~/shared/models";

export function getSessionDuration(session: Session): string {
    console.log(session);

    const totalLessonDuration = session.lessons.reduce(
        (total, lesson) =>
            total + (lesson.end.getTime() - lesson.start.getTime()),
        0,
    );

    const hours = Math.floor(totalLessonDuration / 3600000);
    const minutes = Math.floor((totalLessonDuration % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
}

export function getSessionDate(session: Session): string {
    if (session.lessons.length === 0) {
        return "No lessons scheduled";
    }

    if (session.lessons.length === 1 && session.lessons[0]) {
        return getLessonDate(session.lessons[0]);
    }

    return session.lessons.map(getLessonDate).join(", ");
}

export function getLessonDate(lesson: Lesson): string {
    const start = lesson.start;
    const end = lesson.end;

    if (end.getTime() - start.getTime() < 24 * 60 * 60 * 1000) {
        const startTime = start.toLocaleTimeString("de-CH", {
            hour: "2-digit",
            minute: "2-digit",
        });
        const endTime = end.toLocaleTimeString("de-CH", {
            hour: "2-digit",
            minute: "2-digit",
        });
        return `${start.toLocaleDateString("de-CH")} ${startTime} - ${endTime}`;
    }
    return `${start.toLocaleDateString("de-CH")} ${start.toLocaleTimeString("de-CH")} - ${end.toLocaleDateString("de-CH")} ${end.toLocaleTimeString("de-CH")}`;
}

export function filterUpcomingSessions(course: Course) {
    const now = Date.now();

    course.sessions = course.sessions.filter(
        (s) =>
            s.lessons.length > 0 &&
            s.lessons[0] &&
            s.lessons[0].start.getTime() > now,
    );
}
