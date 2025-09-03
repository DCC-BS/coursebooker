import { and, gte, like, lte, asc, desc } from "drizzle-orm";
import { z } from "zod";
import { useDb } from "~~/server/composables/db.composable";
import { coursesTable, lessonsTable } from "~~/shared/schema";
import { getWithUsers } from "~~/server/utils/withUsers.util.ts";

const filterSchema = z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    organizer: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(["asc", "desc"]).default("asc"),
    offset: z.number().min(1).optional(),
    limit: z.number().min(1).default(10),
});

export default defineEventHandler(async (event) => {
    const { db } = useDb();
    const query = getQuery(event);

    const filters = filterSchema.parse(query);

    const withUsers = await getWithUsers(event);

    const courses = await db.query.coursesTable.findMany({
        limit: filters.limit,
        offset: filters.offset,
        where: and(
            like(coursesTable.title, `%${filters.search || ""}%`),
            like(coursesTable.organizer_name, `%${filters.organizer || ""}%`),
        ),
        with: {
            sessions: {
                with: {
                    lessons: {
                        orderBy: [desc(lessonsTable.start)],
                        where: and(
                            gte(
                                lessonsTable.start,
                                filters.from ?? new Date(-8640000000000000),
                            ),
                            lte(
                                lessonsTable.end,
                                filters.to ?? new Date(8640000000000000),
                            ),
                        ),
                    },
                    registrations: withUsers,
                },
            },
        },
    });

    return courses;
});
