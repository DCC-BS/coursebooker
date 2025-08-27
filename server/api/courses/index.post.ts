import { useDb } from "~~/server/composables/db.composable";
import { createCourseSchema } from "~~/shared/models";
import { coursesTable } from "~~/shared/schema";

export default defineEventHandler(async (event) => {
    const { db } = useDb();
    const body = createCourseSchema.parse(await readBody(event));

    await db.insert(coursesTable).values(body);
});
