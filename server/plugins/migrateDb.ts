import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { userTable } from "~~/shared/schema";
import { useDb } from "../composables/db.composable";

export default defineNitroPlugin(async () => {
    const config = useRuntimeConfig();
    const { db } = useDb();

    await migrate(db, { migrationsFolder: "./drizzle" });

    const admin = await db.query.userTable.findFirst({
        where: eq(userTable.isAdmin, true),
    });

    if (!admin) {
        console.log(
            `No admin user found, creating default admin user ${config.defaultAdmin}`,
        );
        await db.insert(userTable).values({
            email: config.defaultAdmin,
            isAdmin: true,
        });
    }
});
