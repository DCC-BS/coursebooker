import type { ZodType, z } from "zod";
// import type { FetchOptions } from "ofetch";

export type FetchOptions = Parameters<typeof $fetch>[1];

export async function fetchWithSchema<T extends ZodType>(
    url: string,
    schema: T,
    options: FetchOptions = {},
): Promise<z.infer<T>> {
    const response = await $fetch.raw(url, options);

    if (response.ok) {
        const parsed = schema.safeParse(response._data);

        if (parsed.success && parsed.data !== undefined) {
            return parsed.data;
        }

        let errorMsg = `Schema validation for ${url} failed output was \n ${JSON.stringify(response._data)} \n`;

        if (parsed.error) {
            parsed.error.issues.forEach((issue) => {
                errorMsg += `\n - Path: ${issue.path} Issue: ${issue.message}`;
            });
        }

        throw new Error(errorMsg);
    }

    if (response._data) {
        console.error("Fetch failed:", response._data);
    }

    console.error("Fetch failed:", response.statusText);
    throw new Error(response.statusText);
}

export function useSchemaFetch<T>(
    urls: string,
    schema: ZodType<T>,
    options: FetchOptions = {},
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

            console.error(e);
            error.value =
                e &&
                typeof e === "object" &&
                "message" in e &&
                typeof e.message === "string"
                    ? e.message
                    : String(e);
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
