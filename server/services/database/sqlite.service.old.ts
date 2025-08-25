import Database from "better-sqlite3";
import type { Course, CourseType, CourseSession } from "../../../shared/models/courses.model";
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
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_courses_date ON courses(date);
      CREATE INDEX IF NOT EXISTS idx_courses_organizer ON courses(organizer_mail);
      CREATE INDEX IF NOT EXISTS idx_courses_datetime ON courses(date, time);
    `);

        // Insert sample data if table is empty
        const count = this.db
            .prepare("SELECT COUNT(*) as count FROM courses")
            .get() as { count: number };
        if (count.count === 0) {
            await this.insertSampleData();
        }

        this.initialized = true;
    }

    private async ensureSchemaCompatibility(): Promise<void> {
        try {
            // Get current table columns
            const columns = this.db
                .prepare("PRAGMA table_info(courses)")
                .all() as Array<{
                cid: number;
                name: string;
                type: string;
                notnull: number;
                dflt_value: string | null;
                pk: number;
            }>;

            const existingColumns = new Set(columns.map((col) => col.name));
            const requiredColumns = new Set([
                "id",
                "created_at",
                "updated_at",
                ...Object.values(FIELD_MAPPINGS),
            ]);

            // Add missing columns
            for (const column of requiredColumns) {
                if (!existingColumns.has(column)) {
                    console.log(`Adding missing column: ${column}`);
                    // Add column with appropriate default
                    let columnDef = `${column} TEXT DEFAULT ''`;
                    if (column === "duration")
                        columnDef = `${column} REAL DEFAULT 0`;
                    if (column === "type")
                        columnDef = `${column} TEXT DEFAULT 'course'`;

                    this.db.exec(`ALTER TABLE courses ADD COLUMN ${columnDef}`);
                }
            }
        } catch (error) {
            console.warn("Schema compatibility check failed:", error);
            // Continue anyway - table might not exist yet
        }
    }

    private async insertSampleData(): Promise<void> {
        const sampleCourses = [
            {
                id: "wissensaustausch-data-science-ki-2025-10-23-1530",
                type: "course" as const,
                title: "Wissensaustausch Data Science & KI",
                date: "2025-10-23",
                time: "15:30",
                duration: 2,
                description:
                    "Die Veranstaltung soll den Austausch zu Datenwissenschaft und KI im Kanton Basel fördern. Kern der Veranstaltung sind Vorträge aus verschiedenen Bereichen der Verwaltung. Ein detailliertes Programm folgt.",
                location: "Wird noch bekanntgegeben",
                teams_link: "",
                organizer_mail: "dcc@bs.ch",
            },
            {
                id: "wissensaustausch-data-science-ki-2026-02-12-1530",
                type: "course" as const,
                title: "Wissensaustausch Data Science & KI",
                date: "2026-02-12",
                time: "15:30",
                duration: 2,
                description:
                    "Die Veranstaltung soll den Austausch zu Datenwissenschaft und KI im Kanton Basel fördern. Kern der Veranstaltung sind Vorträge aus verschiedenen Bereichen der Verwaltung. Ein detailliertes Programm folgt.",
                location: "Wird noch bekanntgegeben",
                teams_link: "",
                organizer_mail: "dcc@bs.ch",
            },
            {
                id: "einfuehrung-dcc-ki-pilotanwendungen-2025-08-19-1330",
                type: "course" as const,
                title: "Einführung DCC KI Pilotanwendungen",
                date: "2025-08-19",
                time: "13:30",
                duration: 0.5,
                description:
                    "In 30 Minuten geben wir eine Einführung zu den neuen kantonalen KI Pilot Tools. Wir gehen dabei auf folgende Fragen ein: Wie kann ich die Tools verwenden, was muss ich beachten und wie steht es um den Datenschutz?",
                location: "Microsoft Teams",
                teams_link:
                    "https://teams.microsoft.com/l/meetup-join/19%3ameeting_NTFmNGRkZmUtOTQ5MC00ODg2LWJlODYtM2RiMGY0ZjkwMjcy%40thread.v2/0?context=%7b%22Tid%22%3a%2211172f95-a39a-4f7b-9224-c6a11d1e5c24%22%2c%22Oid%22%3a%22b702716c-e2e6-4c9e-8b9b-ea88ef3f3f0a%22%7d",
                organizer_mail: "dcc@bs.ch",
            },
        ];

        // Create dynamic insert statement
        const courseFields = Object.keys(FIELD_MAPPINGS);
        const placeholders = courseFields.map(() => "?").join(", ");
        const insert = this.db.prepare(`
            INSERT INTO courses (id, ${courseFields.join(", ")}, created_at, updated_at)
            VALUES (?, ${placeholders}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        for (const course of sampleCourses) {
            const values = courseFields.map(
                (field) => course[field as keyof typeof course],
            );
            insert.run(course.id, ...values);
        }
    }

    private generateCourseId(
        course: Pick<Course, "title" | "date" | "time">,
    ): string {
        return `${course.title.replace(/\s+/g, "-").toLowerCase()}-${course.date}-${course.time.replace(":", "")}`;
    }

    async getAllCourses(filters?: CourseFilters): Promise<Course[]> {
        let query = "SELECT * FROM courses WHERE 1=1";
        const params: (string | number)[] = [];

        // Apply filters
        if (filters?.fromDate) {
            query += " AND date >= ?";
            params.push(filters.fromDate);
        }

        if (filters?.toDate) {
            query += " AND date <= ?";
            params.push(filters.toDate);
        }

        if (filters?.organizer) {
            query += " AND organizer_mail LIKE ?";
            params.push(`%${filters.organizer}%`);
        }

        if (filters?.search) {
            query += " AND (title LIKE ? OR description LIKE ?)";
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        // Sort
        const sortOrder = filters?.sortOrder === "desc" ? "DESC" : "ASC";
        query += ` ORDER BY date ${sortOrder}, time ${sortOrder}`;

        // Pagination
        if (filters?.limit) {
            const offset = ((filters.page || 1) - 1) * filters.limit;
            query += " LIMIT ? OFFSET ?";
            params.push(filters.limit, offset);
        }

        const stmt = this.db.prepare(query);
        const rows = stmt.all(...params) as CourseRow[];

        return rows.map((row) => this.mapRowToCourse(row));
    }

    async getCourseById(id: string): Promise<Course | null> {
        const stmt = this.db.prepare("SELECT * FROM courses WHERE id = ?");
        const row = stmt.get(id) as CourseRow | undefined;

        return row ? this.mapRowToCourse(row) : null;
    }

    async createCourse(courseData: Omit<Course, "id">): Promise<Course> {
        // Validate required fields
        validateCourseData(courseData);

        const id = this.generateCourseId(courseData);

        // Create dynamic insert statement
        const courseFields = Object.keys(FIELD_MAPPINGS);
        const placeholders = courseFields.map(() => "?").join(", ");
        const stmt = this.db.prepare(`
            INSERT INTO courses (id, ${courseFields.join(", ")})
            VALUES (?, ${placeholders})
        `);

        try {
            const values = courseFields.map((field) => {
                const value = courseData[field as keyof Course];
                return (
                    value ??
                    (field === "description" ||
                    field === "location" ||
                    field === "teams_link"
                        ? ""
                        : value)
                );
            });

            stmt.run(id, ...values);

            const course = await this.getCourseById(id);
            if (!course) {
                throw new Error("Failed to create course");
            }

            return course;
        } catch (error) {
            if (
                error instanceof Error &&
                "code" in error &&
                error.code === "SQLITE_CONSTRAINT_UNIQUE"
            ) {
                throw new Error(
                    "A course with the same title, date, and time already exists",
                );
            }
            throw error;
        }
    }

    async updateCourse(
        id: string,
        updates: Partial<Course>,
    ): Promise<Course | null> {
        const existing = await this.getCourseById(id);
        if (!existing) return null;

        const fields: string[] = [];
        const params: (string | number)[] = [];

        // Build dynamic update query using field mappings
        Object.entries(updates).forEach(([modelField, value]) => {
            if (modelField in FIELD_MAPPINGS && value !== undefined) {
                const dbField = FIELD_MAPPINGS[modelField as keyof Course];
                fields.push(`${dbField} = ?`);
                params.push(value);
            }
        });

        if (fields.length === 0) return existing;

        fields.push("updated_at = CURRENT_TIMESTAMP");
        params.push(id);

        const query = `UPDATE courses SET ${fields.join(", ")} WHERE id = ?`;
        const stmt = this.db.prepare(query);

        try {
            stmt.run(...params);
            return await this.getCourseById(id);
        } catch (error) {
            if (
                error instanceof Error &&
                "code" in error &&
                error.code === "SQLITE_CONSTRAINT_UNIQUE"
            ) {
                throw new Error(
                    "A course with the same title, date, and time already exists",
                );
            }
            throw error;
        }
    }

    async deleteCourse(id: string): Promise<boolean> {
        const stmt = this.db.prepare("DELETE FROM courses WHERE id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }

    async courseExists(
        title: string,
        date: string,
        time: string,
    ): Promise<boolean> {
        const stmt = this.db.prepare(
            "SELECT 1 FROM courses WHERE title = ? AND date = ? AND time = ?",
        );
        const result = stmt.get(title, date, time);
        return !!result;
    }

    async getCoursesCount(): Promise<number> {
        const stmt = this.db.prepare("SELECT COUNT(*) as count FROM courses");
        const result = stmt.get() as { count: number };
        return result.count;
    }

    async getCoursesByOrganizer(): Promise<Record<string, number>> {
        const stmt = this.db.prepare(
            "SELECT organizer_mail, COUNT(*) as count FROM courses GROUP BY organizer_mail",
        );
        const rows = stmt.all() as { organizer_mail: string; count: number }[];

        const result: Record<string, number> = {};
        rows.forEach((row) => {
            result[row.organizer_mail] = row.count;
        });
        return result;
    }

    async getCoursesByLocation(): Promise<Record<string, number>> {
        const stmt = this.db.prepare(`
      SELECT 
        CASE 
          WHEN location = '' OR location IS NULL THEN 'Not specified'
          ELSE location 
        END as location,
        COUNT(*) as count 
      FROM courses 
      GROUP BY location
    `);
        const rows = stmt.all() as { location: string; count: number }[];

        const result: Record<string, number> = {};
        rows.forEach((row) => {
            result[row.location] = row.count;
        });
        return result;
    }

    async getAverageDuration(): Promise<number> {
        const stmt = this.db.prepare(
            "SELECT AVG(duration) as avg FROM courses",
        );
        const result = stmt.get() as { avg: number | null };
        return result.avg || 0;
    }

    async getNextUpcomingCourse(): Promise<Course | null> {
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");
        const stmt = this.db.prepare(`
      SELECT * FROM courses 
      WHERE datetime(date || ' ' || time) > datetime(?)
      ORDER BY date ASC, time ASC
      LIMIT 1
    `);
        const row = stmt.get(now) as CourseRow | undefined;

        return row ? this.mapRowToCourse(row) : null;
    }

    private mapRowToCourse(row: CourseRow): Course {
        const course: Partial<Course> = {};

        // Dynamically map all fields from FIELD_MAPPINGS
        for (const [modelField, dbField] of Object.entries(FIELD_MAPPINGS)) {
            const value = row[dbField];

            // Type safe assignment with proper defaults
            switch (modelField as keyof Course) {
                case "type":
                    course.type = ((value as string) || "course") as CourseType;
                    break;
                case "title":
                    course.title = value as string;
                    break;
                case "date":
                    course.date = value as string;
                    break;
                case "time":
                    course.time = value as string;
                    break;
                case "duration":
                    course.duration = value as number;
                    break;
                case "description":
                    course.description = (value as string) || "";
                    break;
                case "location":
                    course.location = (value as string) || "";
                    break;
                case "teams_link":
                    course.teams_link = (value as string) || "";
                    break;
                case "organizer_mail":
                    course.organizer_mail = value as string;
                    break;
            }
        }

        return course as Course;
    }

    async close(): Promise<void> {
        if (this.db) {
            this.db.close();
        }
    }
}
