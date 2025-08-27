import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./drizzle",
    schema: "./shared/schema",
    dialect: "sqlite",

    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
