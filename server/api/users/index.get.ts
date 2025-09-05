import { useDb } from "~~/server/composables/db.composable";

export default defineAdminResponseHandler(async (event) => {
    const { db } = useDb();

    const query = getQuery(event);

    const withRegistrations =
        !query.withRegistrations || query.withRegistrations === "true";

    const users = await db.query.userTable.findMany({
        with: {
            registrations: withRegistrations
                ? {
                      with: {
                          session: {
                              with: {
                                  lessons: true,
                              },
                          },
                      },
                  }
                : undefined,
        },
    });

    return users;
});
