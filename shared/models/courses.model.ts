import type { CourseSession } from "./session.model";

export type CourseType = "course" | "event";

export interface Course {
    id: string;

    type: CourseType;

    /** The name/title of the course */
    title: string;

    sessions: CourseSession[];

    /** Detailed description of the course */
    description: string;

    /** Microsoft Teams meeting link (can be empty string) */
    teams_link?: string;

    organizer_name: string;

    /** Email address of the course organizer */
    organizer_mail: string;
}

export interface CoursesData {
    /** Array of available courses */
    courses: Course[];
}

// Type for creating a new course (optional fields for partial updates)
export type CreateCourseInput = Course;

export type UpdateCourseInput = Partial<Course>;
