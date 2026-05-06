import type { Session } from "~~/shared/models";

export function isSessionInPast(session: Session): boolean {
    if (!session.lessons || session.lessons.length === 0) {
        return false;
    }

    const now = new Date();

    return session.lessons.every((lesson) => lesson.end < now);
}

export function sessionHasUpcomingOrCurrentLessons(session: Session): boolean {
    if (!session.lessons || session.lessons.length === 0) {
        return false;
    }

    const now = new Date();

    return session.lessons.some((lesson) => lesson.end >= now);
}
