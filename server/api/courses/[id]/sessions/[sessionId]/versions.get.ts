import { desc, eq } from "drizzle-orm";
import { useDb } from "~~/server/composables/db.composable";
import { defineAdminResponseHandler } from "~~/server/utils/adminAccess";
import {
    getUsersWithVersionStatus,
    getVersionHistory,
    parseChanges,
} from "~~/server/utils/icsVersion.utils";
import { lessonsTable, sessionsTable } from "~~/shared/schema";

export default defineAdminResponseHandler(async (event) => {
    const sessionId = getRouterParam(event, "sessionId");

    if (!sessionId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Session ID is required",
        });
    }

    const session = await useDb().db.query.sessionsTable.findFirst({
        where: eq(sessionsTable.id, sessionId),
        with: {
            lessons: {
                orderBy: [desc(lessonsTable.start)],
            },
        },
    });

    if (!session) {
        throw createError({
            statusCode: 404,
            statusMessage: "Session not found",
        });
    }

    const versions = await getVersionHistory(sessionId);
    const currentVersion = versions[0]?.version ?? 0;

    const versionsWithParsedChanges = versions.map((v) => ({
        ...v,
        changesParsed: parseChanges(v.changes),
    }));

    const usersWithVersion = await getUsersWithVersionStatus(sessionId);

    const usersWithStatus = usersWithVersion.map((u) => {
        let status: "current" | "outdated" | "none";

        if (u.ics_version_received === null) {
            status = "none";
        } else if (u.ics_version_received < currentVersion) {
            status = "outdated";
        } else {
            status = "current";
        }

        return {
            ...u,
            status,
        };
    });

    const outdatedCount = usersWithStatus.filter(
        (u) => u.status === "outdated" || u.status === "none",
    ).length;

    return {
        currentVersion,
        versions: versionsWithParsedChanges,
        users: usersWithStatus,
        totalRegistrations: usersWithVersion.length,
        outdatedCount,
    };
});
