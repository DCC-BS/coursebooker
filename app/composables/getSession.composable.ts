import z from "zod";
import { sessionSchema, sessionToUsersSchema } from "~~/shared/models";

export function useSession(courseId: string, sessionId: string, admin = false) {
    const schema = admin
        ? sessionSchema.extend({ registrations: z.array(sessionToUsersSchema) })
        : sessionSchema;

    const { data, error, isPending } = useSchemaFetch(
        `/api/courses/${courseId}/sessions/${sessionId}?withUsers=${admin}`,
        schema,
    );

    return {
        session: data,
        isPending,
        error,
    };
}

export function useSetSession(courseId: string, sessionId: string) {
    async function registerForSession(userMail: string | "me") {
        await $fetch(
            `/api/courses/${courseId}/sessions/${sessionId}/register`,
            {
                method: "POST",
                body: JSON.stringify({ userEmail: userMail }),
            },
        );
    }

    async function unregisterFromSession(userMail: string | "me") {
        await $fetch(
            `/api/courses/${courseId}/sessions/${sessionId}/unregister`,
            {
                method: "POST",
                body: JSON.stringify({ userEmail: userMail }),
            },
        );
    }

    return {
        registerForSession,
        unregisterFromSession,
    };
}
