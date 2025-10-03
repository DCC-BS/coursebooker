import { v7 as uuidv7 } from "uuid";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import { createSessionSchema } from "~~/shared/models";
import { sessionsTable } from "~~/shared/schema";

export default defineAdminResponseHandler(async (event) => {
    const { db } = useDb();
    const courseId = getRouterParam(event, "id");

    if (!courseId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Course ID is required",
        });
    }

    // Check if course exists
    const body = createSessionSchema.parse(await readBody(event));
    body.id = uuidv7();

    if (body.ics_file) {
        body.ics_file = Buffer.from(await body.ics_file.arrayBuffer());
    }

    const session = await db
        .insert(sessionsTable)
        .values({
            ...body,
            courseId,
        })
        .returning();

    return session[0];
});
