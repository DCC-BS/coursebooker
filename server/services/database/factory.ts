import { SQLiteService } from "./sqlite.service";
import type { IDatabaseService } from "./types";

export type DatabaseType = "sqlite" | "postgresql" | "mysql" | "memory";

interface DatabaseOptions {
    dbPath?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
}

export function createDatabase(
    type: DatabaseType = "sqlite",
    options?: DatabaseOptions,
): IDatabaseService {
    switch (type) {
        case "sqlite":
            return new SQLiteService(options?.dbPath);

        case "postgresql":
            // Future implementation
            throw new Error("PostgreSQL support not implemented yet");

        case "mysql":
            // Future implementation
            throw new Error("MySQL support not implemented yet");

        case "memory":
            // Future implementation for testing
            throw new Error("In-memory database support not implemented yet");

        default:
            throw new Error(`Unsupported database type: ${type}`);
    }
}

// Singleton database service instance
let dbInstance: IDatabaseService | null = null;

export async function getDatabase(): Promise<IDatabaseService> {
    if (!dbInstance) {
        const dbType = (process.env.DATABASE_TYPE as DatabaseType) || "sqlite";
        const dbPath = process.env.DATABASE_PATH || "./data/courses.db";

        dbInstance = createDatabase(dbType, { dbPath });
        await dbInstance.initialize();
    }

    return dbInstance;
}

export async function closeDatabase(): Promise<void> {
    if (dbInstance) {
        await dbInstance.close();
        dbInstance = null;
    }
}

// Graceful shutdown
process.on("SIGINT", async () => {
    await closeDatabase();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await closeDatabase();
    process.exit(0);
});
