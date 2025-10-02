import { eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import { updateSessionSchema } from "~~/shared/models";
import { sessionsTable } from "~~/shared/schema";

export default defineAdminResponseHandler(async (event) => {
    const { db } = useDb();
    const courseId = getRouterParam(event, "id");
    const sessionId = getRouterParam(event, "sessionId");

    if (!courseId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Course ID is required",
        });
    }

    if (!sessionId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Session ID is required",
        });
    }

    const formData = await readFormData(event);
    const data = {
        location: formData.get("location"),
        teams_link: formData.get("teams_link"),
        ics_file: formData.get("ics_file"),
    };

    const body = updateSessionSchema.parse(data);

    if (body.ics_file) {
        body.ics_file = Buffer.from(await body.ics_file.arrayBuffer());
    }

    await db
        .update(sessionsTable)
        .set(body)
        .where(eq(sessionsTable.id, sessionId));
});
