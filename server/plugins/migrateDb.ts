import { eq } from "drizzle-orm";
import { useDb } from "../composables/db.composable";
import { userTable } from "~~/shared/schema";

export default defineNitroPlugin(async () => {
    const config = useRuntimeConfig();
    const { db } = useDb();

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
