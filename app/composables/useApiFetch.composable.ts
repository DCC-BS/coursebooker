import type { ZodType, z } from "zod";

export async function fetchWithSchema<T extends ZodType>(
    url: string,
    schema: T,
    options: RequestInit = {},
): Promise<z.infer<T>> {
    const response = await $fetch.raw(url, { ...options } as any);

    if (response.ok) {
        const parsed = schema.parse(response._data);
        return parsed;
    }

    console.error("Failed to load user:", response.statusText);
    throw new Error("Failed to load user");
}

export function useSchemaFetch<T>(
    urls: string,
    schema: ZodType<T>,
    options: RequestInit = {},
    initalFetch = true,
) {
    const data = ref<T>();
    const error = ref<string>();
    const isPending = ref(false);
    let abortController = new AbortController();

    async function refresh(): Promise<void> {
        try {
            abortController.abort();
            abortController = new AbortController();
            data.value = await fetchWithSchema(urls, schema, {
                signal: abortController.signal,
                ...options,
            });
        } catch (e: unknown) {
            if (typeof e === "string" && e === "aborted") {
                return;
            }

            if (
                e &&
                typeof e === "object" &&
                "case" in e &&
                e.case === "aborted"
            ) {
                return;
            }

            console.error("Failed to load session:", e);
            error.value = "Failed to load session";
        } finally {
            isPending.value = false;
        }
    }

    if (initalFetch) {
        refresh();
    }

    return {
        data,
        error,
        isPending,
        refresh,
    };
}
