import type { Lesson } from "./lession.model";

export type CourseSession = {
    id: string;
    location?: string;
    teams_link?: string;

    /** Array of lessons for this session */
    lessons: Lesson[];
};
