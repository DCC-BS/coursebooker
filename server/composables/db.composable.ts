import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "../../shared/schema";

export function useDb() {
    const sqlite = createClient({ url: `file:${process.env.DATABASE_URL!}` });
    const db = drizzle(sqlite, { schema });

    return { db };
}
