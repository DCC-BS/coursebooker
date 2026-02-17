import { userSchema } from "~~/shared/models";
import {
    type FetchOptions,
    fetchWithSchema,
    useSchemaFetch,
} from "./useApiFetch.composable";

export async function fetchMe(options: FetchOptions = {}) {
    return fetchWithSchema("/api/me", userSchema, options);
}

export function useMe() {
    const { data, error, isPending, refresh } = useSchemaFetch(
        "/api/me",
        userSchema,
        {},
        false,
    );

    onMounted(() => {
        refresh();
    });

    return { me: data, error, isPending, refresh };
}
