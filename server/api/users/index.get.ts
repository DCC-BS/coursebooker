import { useDb } from "~~/server/composables/db.composable";

export default defineAdminResponseHandler(async (_) => {
    const { db } = useDb();

    const users = await db.query.userTable.findMany({
        with: {
            registrations: {
                with: {
                    session: {
                        with: {
                            lessons: true,
                        },
                    },
                },
            },
        },
    });

    return users;
});
