import { sessionSchema, type Session } from "~~/shared/models";

export function useSession(courseId: string, sessionId: string) {
    const session = ref<Session>();
    const isPending = ref(true);

    const error = ref<string>();

    async function load(): Promise<void> {
        try {
            const response = await fetch(
                `/api/courses/${courseId}/sessions/${sessionId}`,
            );

            if (response.ok) {
                const json = await response.json();
                const parsed = sessionSchema.parse(json);
                session.value = parsed;
                return;
            }

            console.error("Failed to load session:", response.statusText);
            error.value = "Failed to load session";
        } catch (e: unknown) {
            console.error("Failed to load session:", e);
            error.value = "Failed to load session";
        } finally {
            isPending.value = false;
        }
    }

    load();

    return {
        session,
        isPending,
        error,
    };
}
