import { v7 as uuidv7 } from "uuid";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import { createCourseSchema } from "~~/shared/models";
import { coursesTable } from "~~/shared/schema";

export default defineAdminResponseHandler(async (event) => {
    const { db } = useDb();
    const body = createCourseSchema.parse(await readBody(event));

    body.id = uuidv7();
    const course = await db.insert(coursesTable).values(body).returning();
    return course[0];
});
