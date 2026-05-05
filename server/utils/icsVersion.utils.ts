import { and, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { useDb } from "~~/server/composables/db.composable";
import {
    type ChangeDescription,
    type IcsVersion,
    icsVersionsTable,
    usersToSessionsTable,
} from "~~/shared/schema";

export async function getOrCreateCurrentVersion(
    sessionId: string,
): Promise<IcsVersion> {
    const { db } = useDb();

    const versions = await db.query.icsVersionsTable.findMany({
        where: eq(icsVersionsTable.sessionId, sessionId),
        orderBy: (v, { desc }) => [desc(v.version)],
    });

    if (versions.length > 0) {
        return versions[0];
    }

    const newVersion = await db
        .insert(icsVersionsTable)
        .values({
            id: uuidv7(),
            sessionId,
            version: 1,
            changes: null,
            createdAt: new Date(),
            createdBy: "system",
        })
        .returning();

    return newVersion[0];
}

export async function getRegistrationCount(sessionId: string): Promise<number> {
    const { db } = useDb();

    const registrations = await db.query.usersToSessionsTable.findMany({
        where: eq(usersToSessionsTable.sessionId, sessionId),
    });

    return registrations.length;
}

export async function createOrUpdateVersion(
    sessionId: string,
    changes: ChangeDescription[],
    createdBy = "system",
): Promise<IcsVersion> {
    const { db } = useDb();

    const registrationCount = await getRegistrationCount(sessionId);

    const versions = await db.query.icsVersionsTable.findMany({
        where: eq(icsVersionsTable.sessionId, sessionId),
        orderBy: (v, { desc }) => [desc(v.version)],
    });

    const currentVersion = versions[0];
    const changesText = changes.length > 0 ? JSON.stringify(changes) : null;

    if (registrationCount === 0 && currentVersion) {
        const updated = await db
            .update(icsVersionsTable)
            .set({
                changes: changesText,
                createdAt: new Date(),
                createdBy,
            })
            .where(eq(icsVersionsTable.id, currentVersion.id))
            .returning();

        return updated[0];
    }

    const newVersionNumber = currentVersion ? currentVersion.version + 1 : 1;

    const newVersion = await db
        .insert(icsVersionsTable)
        .values({
            id: uuidv7(),
            sessionId,
            version: newVersionNumber,
            changes: changesText,
            createdAt: new Date(),
            createdBy,
        })
        .returning();

    return newVersion[0];
}

export async function setUserIcsVersion(
    userEmail: string,
    sessionId: string,
    version: number,
): Promise<void> {
    const { db } = useDb();

    await db
        .update(usersToSessionsTable)
        .set({ ics_version_received: version })
        .where(
            and(
                eq(usersToSessionsTable.userEmail, userEmail),
                eq(usersToSessionsTable.sessionId, sessionId),
            ),
        );
}

export async function getVersionHistory(
    sessionId: string,
): Promise<IcsVersion[]> {
    const { db } = useDb();

    return db.query.icsVersionsTable.findMany({
        where: eq(icsVersionsTable.sessionId, sessionId),
        orderBy: (v, { desc }) => [desc(v.version)],
    });
}

export async function getCurrentVersion(
    sessionId: string,
): Promise<IcsVersion | undefined> {
    const { db } = useDb();

    const result = await db.query.icsVersionsTable.findMany({
        where: eq(icsVersionsTable.sessionId, sessionId),
        orderBy: (v, { desc }) => [desc(v.version)],
        limit: 1,
    });

    return result[0];
}

export async function getCurrentVersionNumber(
    sessionId: string,
): Promise<number> {
    const currentVersion = await getCurrentVersion(sessionId);
    return currentVersion?.version ?? 0;
}

export async function getUsersWithVersionStatus(
    sessionId: string,
): Promise<{ userEmail: string; ics_version_received: number | null }[]> {
    const { db } = useDb();

    return db.query.usersToSessionsTable.findMany({
        where: eq(usersToSessionsTable.sessionId, sessionId),
        columns: {
            userEmail: true,
            ics_version_received: true,
        },
    });
}

export function parseChanges(changesJson: string | null): ChangeDescription[] {
    if (!changesJson) return [];

    try {
        return JSON.parse(changesJson) as ChangeDescription[];
    } catch {
        return [];
    }
}

export function formatChangeDescription(change: ChangeDescription): string {
    switch (change.type) {
        case "location":
            return `Ort geändert: ${change.description}`;
        case "teams_link":
            return `MS Teams Link ${change.description}`;
        case "lesson_added":
            return `Termin hinzugefügt: ${change.description}`;
        case "lesson_updated":
            return `Termin geändert: ${change.description}`;
        case "lesson_deleted":
            return `Termin gelöscht: ${change.description}`;
        case "manual":
            return `Manuell: ${change.description}`;
        default:
            return change.description;
    }
}
