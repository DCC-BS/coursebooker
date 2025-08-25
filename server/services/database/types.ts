import type { Course } from "../../../shared/models/courses.model";
import type { CourseSession } from "../../../shared/models/session.model";
import type { Lesson } from "../../../shared/models/lession.model";

// Database interface that any database implementation must follow
export interface IDatabaseService {
    // Course operations
    getAllCourses(filters?: CourseFilters): Promise<Course[]>;
    getCourseById(id: string): Promise<Course | null>;
    createCourse(course: Course): Promise<Course>;
    updateCourse(id: string, updates: Partial<Course>): Promise<Course | null>;
    deleteCourse(id: string): Promise<boolean>;
    courseExists(id: string): Promise<boolean>;

    // Session operations
    getSessionsByCourseId(courseId: string): Promise<CourseSession[]>;
    getSessionById(sessionId: string): Promise<CourseSession | null>;
    createSession(
        courseId: string,
        session: CourseSession,
    ): Promise<CourseSession>;
    updateSession(
        sessionId: string,
        updates: Partial<CourseSession>,
    ): Promise<CourseSession | null>;
    deleteSession(sessionId: string): Promise<boolean>;
    sessionExists(sessionId: string): Promise<boolean>;

    // Lesson operations
    getLessonsBySessionId(sessionId: string): Promise<Lesson[]>;
    getLessonById(lessonId: string): Promise<Lesson | null>;
    createLesson(sessionId: string, lesson: Lesson): Promise<Lesson>;
    updateLesson(
        lessonId: string,
        updates: Partial<Lesson>,
    ): Promise<Lesson | null>;
    deleteLesson(lessonId: string): Promise<boolean>;
    lessonExists(lessonId: string): Promise<boolean>;

    // Statistics
    getCoursesCount(): Promise<number>;
    getCoursesByOrganizer(): Promise<Record<string, number>>;
    getCoursesByLocation(): Promise<Record<string, number>>;
    getAverageDuration(): Promise<number>;
    getNextUpcomingCourse(): Promise<Course | null>;

    // Database management
    initialize(): Promise<void>;
    close(): Promise<void>;
}

export interface CourseFilters {
    fromDate?: string;
    toDate?: string;
    organizer?: string;
    search?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
