import Database from "better-sqlite3";
import type { Course, CourseType } from "../../../shared/models/courses.model";
import type { CourseSession } from "../../../shared/models/session.model";
import type { Lesson } from "../../../shared/models/lession.model";
import type { IDatabaseService, CourseFilters } from "./types";

/**
 * SQLite Service for Course Management with new hierarchical model
 *
 * This service handles the new Course model structure with sessions and lessons.
 * The database schema includes separate tables for courses, sessions, and lessons
 * to properly represent the hierarchical structure.
 */

interface CourseRow {
    id: string;
    type: string;
    title: string;
    description: string;
    teams_link: string;
    organizer_name: string;
    organizer_mail: string;
    created_at: string;
    updated_at: string;
}

interface SessionRow {
    id: string;
    course_id: string;
    location?: string;
    teams_link?: string;
    created_at: string;
    updated_at: string;
}

interface LessonRow {
    id: string;
    session_id: string;
    start: string;
    end: string;
    created_at: string;
    updated_at: string;
}

export class SQLiteService implements IDatabaseService {
    private db: Database.Database;
    private initialized = false;

    constructor(private dbPath = "courses.db") {
        this.db = new Database(this.dbPath);
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        // Create tables for the hierarchical structure
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS courses (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL DEFAULT 'course',
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                teams_link TEXT DEFAULT '',
                organizer_name TEXT DEFAULT '',
                organizer_mail TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                course_id TEXT NOT NULL,
                location TEXT,
                teams_link TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS lessons (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                start DATETIME NOT NULL,
                end DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_sessions_course_id ON sessions(course_id);
            CREATE INDEX IF NOT EXISTS idx_lessons_session_id ON lessons(session_id);
            CREATE INDEX IF NOT EXISTS idx_lessons_start ON lessons(start);
            CREATE INDEX IF NOT EXISTS idx_courses_organizer ON courses(organizer_mail);
        `);

        this.initialized = true;
    }

    async getAllCourses(filters?: CourseFilters): Promise<Course[]> {
        await this.initialize();

        let sql = `
            SELECT * FROM courses 
            WHERE 1=1
        `;
        const params: any[] = [];

        // Apply filters
        if (filters?.organizer) {
            sql += ` AND organizer_mail = ?`;
            params.push(filters.organizer);
        }

        if (filters?.search) {
            sql += ` AND (title LIKE ? OR description LIKE ?)`;
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters?.fromDate || filters?.toDate) {
            // For date filtering, we need to join with lessons
            sql = `
                SELECT DISTINCT c.* FROM courses c
                JOIN sessions s ON c.id = s.course_id
                JOIN lessons l ON s.id = l.session_id
                WHERE 1=1
            `;

            if (filters.organizer) {
                sql += ` AND c.organizer_mail = ?`;
            }
            if (filters.search) {
                sql += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
            }
            if (filters.fromDate) {
                sql += ` AND DATE(l.start) >= ?`;
                params.push(filters.fromDate);
            }
            if (filters.toDate) {
                sql += ` AND DATE(l.start) <= ?`;
                params.push(filters.toDate);
            }
        }

        // Apply sorting
        if (filters?.sortOrder === "desc") {
            sql += ` ORDER BY created_at DESC`;
        } else {
            sql += ` ORDER BY created_at ASC`;
        }

        // Apply pagination
        if (filters?.limit) {
            sql += ` LIMIT ?`;
            params.push(filters.limit);

            if (filters.page && filters.page > 1) {
                sql += ` OFFSET ?`;
                params.push((filters.page - 1) * filters.limit);
            }
        }

        const courseRows = this.db.prepare(sql).all(...params) as CourseRow[];

        // Load full course data with sessions and lessons
        const courses: Course[] = [];
        for (const courseRow of courseRows) {
            const course = await this.getCourseById(courseRow.id);
            if (course) {
                courses.push(course);
            }
        }

        return courses;
    }

    async getCourseById(id: string): Promise<Course | null> {
        await this.initialize();

        const courseRow = this.db
            .prepare("SELECT * FROM courses WHERE id = ?")
            .get(id) as CourseRow | undefined;

        if (!courseRow) {
            return null;
        }

        // Get sessions for this course
        const sessionRows = this.db
            .prepare(
                "SELECT * FROM sessions WHERE course_id = ? ORDER BY created_at",
            )
            .all(id) as SessionRow[];

        const sessions: CourseSession[] = [];
        for (const sessionRow of sessionRows) {
            // Get lessons for this session
            const lessonRows = this.db
                .prepare(
                    "SELECT * FROM lessons WHERE session_id = ? ORDER BY start",
                )
                .all(sessionRow.id) as LessonRow[];

            const lessons: Lesson[] = lessonRows.map((lessonRow) => ({
                id: lessonRow.id,
                start: new Date(lessonRow.start),
                end: new Date(lessonRow.end),
            }));

            sessions.push({
                id: sessionRow.id,
                location: sessionRow.location,
                teams_link: sessionRow.teams_link,
                lessons,
            });
        }

        return {
            id: courseRow.id,
            type: courseRow.type as CourseType,
            title: courseRow.title,
            description: courseRow.description,
            teams_link: courseRow.teams_link,
            organizer_name: courseRow.organizer_name,
            organizer_mail: courseRow.organizer_mail,
            sessions,
        };
    }

    async createCourse(course: Course): Promise<Course> {
        await this.initialize();

        const transaction = this.db.transaction((course: Course) => {
            // Insert course
            this.db
                .prepare(`
                    INSERT INTO courses (id, type, title, description, teams_link, organizer_name, organizer_mail)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `)
                .run(
                    course.id,
                    course.type,
                    course.title,
                    course.description,
                    course.teams_link || "",
                    course.organizer_name || "",
                    course.organizer_mail,
                );

            // Insert sessions
            for (const session of course.sessions) {
                this.db
                    .prepare(`
                        INSERT INTO sessions (id, course_id, location, teams_link)
                        VALUES (?, ?, ?, ?)
                    `)
                    .run(
                        session.id,
                        course.id,
                        session.location || null,
                        session.teams_link || null,
                    );

                // Insert lessons
                for (const lesson of session.lessons) {
                    this.db
                        .prepare(`
                            INSERT INTO lessons (id, session_id, start, end)
                            VALUES (?, ?, ?, ?)
                        `)
                        .run(
                            lesson.id,
                            session.id,
                            lesson.start.toISOString(),
                            lesson.end.toISOString(),
                        );
                }
            }
        });

        transaction(course);
        return course;
    }

    async updateCourse(
        id: string,
        updates: Partial<Course>,
    ): Promise<Course | null> {
        await this.initialize();

        const existingCourse = await this.getCourseById(id);
        if (!existingCourse) {
            return null;
        }

        const transaction = this.db.transaction(
            (id: string, updates: Partial<Course>) => {
                // Update course fields
                const courseFields = [];
                const courseParams = [];

                if (updates.type !== undefined) {
                    courseFields.push("type = ?");
                    courseParams.push(updates.type);
                }
                if (updates.title !== undefined) {
                    courseFields.push("title = ?");
                    courseParams.push(updates.title);
                }
                if (updates.description !== undefined) {
                    courseFields.push("description = ?");
                    courseParams.push(updates.description);
                }
                if (updates.teams_link !== undefined) {
                    courseFields.push("teams_link = ?");
                    courseParams.push(updates.teams_link);
                }
                if (updates.organizer_name !== undefined) {
                    courseFields.push("organizer_name = ?");
                    courseParams.push(updates.organizer_name);
                }
                if (updates.organizer_mail !== undefined) {
                    courseFields.push("organizer_mail = ?");
                    courseParams.push(updates.organizer_mail);
                }

                if (courseFields.length > 0) {
                    courseFields.push("updated_at = CURRENT_TIMESTAMP");
                    courseParams.push(id);

                    this.db
                        .prepare(
                            `UPDATE courses SET ${courseFields.join(", ")} WHERE id = ?`,
                        )
                        .run(...courseParams);
                }

                // Update sessions if provided
                if (updates.sessions !== undefined) {
                    // Delete existing sessions and lessons (cascade will handle lessons)
                    this.db
                        .prepare("DELETE FROM sessions WHERE course_id = ?")
                        .run(id);

                    // Insert new sessions
                    for (const session of updates.sessions) {
                        this.db
                            .prepare(`
                            INSERT INTO sessions (id, course_id, location, teams_link)
                            VALUES (?, ?, ?, ?)
                        `)
                            .run(
                                session.id,
                                id,
                                session.location || null,
                                session.teams_link || null,
                            );

                        // Insert lessons
                        for (const lesson of session.lessons) {
                            this.db
                                .prepare(`
                                INSERT INTO lessons (id, session_id, start, end)
                                VALUES (?, ?, ?, ?)
                            `)
                                .run(
                                    lesson.id,
                                    session.id,
                                    lesson.start instanceof Date
                                        ? lesson.start.toISOString()
                                        : new Date(lesson.start).toISOString(),
                                    lesson.end instanceof Date
                                        ? lesson.end.toISOString()
                                        : new Date(lesson.end).toISOString(),
                                );
                        }
                    }
                }
            },
        );

        transaction(id, updates);
        return await this.getCourseById(id);
    }

    async deleteCourse(id: string): Promise<boolean> {
        await this.initialize();

        const result = this.db
            .prepare("DELETE FROM courses WHERE id = ?")
            .run(id);

        return result.changes > 0;
    }

    async courseExists(id: string): Promise<boolean> {
        await this.initialize();

        const result = this.db
            .prepare("SELECT 1 FROM courses WHERE id = ?")
            .get(id);

        return !!result;
    }

    async getCoursesCount(): Promise<number> {
        await this.initialize();

        const result = this.db
            .prepare("SELECT COUNT(*) as count FROM courses")
            .get() as { count: number };

        return result.count;
    }

    async getCoursesByOrganizer(): Promise<Record<string, number>> {
        await this.initialize();

        const results = this.db
            .prepare(`
                SELECT organizer_mail, COUNT(*) as count 
                FROM courses 
                GROUP BY organizer_mail
            `)
            .all() as { organizer_mail: string; count: number }[];

        const organizers: Record<string, number> = {};
        for (const result of results) {
            organizers[result.organizer_mail] = result.count;
        }

        return organizers;
    }

    async getCoursesByLocation(): Promise<Record<string, number>> {
        await this.initialize();

        const results = this.db
            .prepare(`
                SELECT s.location, COUNT(DISTINCT c.id) as count 
                FROM courses c
                JOIN sessions s ON c.id = s.course_id
                WHERE s.location IS NOT NULL
                GROUP BY s.location
            `)
            .all() as { location: string; count: number }[];

        const locations: Record<string, number> = {};
        for (const result of results) {
            locations[result.location] = result.count;
        }

        return locations;
    }

    async getAverageDuration(): Promise<number> {
        await this.initialize();

        const result = this.db
            .prepare(`
                SELECT AVG(
                    (julianday(l.end) - julianday(l.start)) * 24
                ) as avg_duration
                FROM lessons l
            `)
            .get() as { avg_duration: number | null };

        return result.avg_duration || 0;
    }

    async getNextUpcomingCourse(): Promise<Course | null> {
        await this.initialize();

        const now = new Date().toISOString();

        const result = this.db
            .prepare(`
                SELECT c.id
                FROM courses c
                JOIN sessions s ON c.id = s.course_id
                JOIN lessons l ON s.id = l.session_id
                WHERE l.start > ?
                ORDER BY l.start ASC
                LIMIT 1
            `)
            .get(now) as { id: string } | undefined;

        if (!result) {
            return null;
        }

        return await this.getCourseById(result.id);
    }

    async close(): Promise<void> {
        this.db.close();
    }
}
