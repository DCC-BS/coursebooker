import "dotenv/config";
// import { drizzle } from "drizzle-orm/bun-sqlite";
// import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import * as schema from "../../shared/schema";

export function useDb() {
    // const sqlite = new Database(process.env.DATABASE_URL!);
    const sqlite = createClient({ url: `file:${process.env.DATABASE_URL!}` });
    const db = drizzle(sqlite, { schema });

    return { db };
}
