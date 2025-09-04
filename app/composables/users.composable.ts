import { z } from "zod";
import { userSchema } from "~~/shared/models";

export function useUsers() {
    const { data, error, isPending, refresh } = useSchemaFetch(
        "/api/users",
        z.array(userSchema),
    );

    return {
        users: data,
        error,
        isPending,
        refresh,
    };
}

export async function createUser(userData: {
    email: string;
    isAdmin: boolean;
}) {
    const createUserSchema = z.object({
        email: z.email(),
        isAdmin: z.boolean().default(false),
    });

    return await fetchWithSchema("/api/users", createUserSchema, {
        method: "POST",
        body: userData,
    });
}

export async function updateUser(
    email: string,
    updates: { isAdmin?: boolean },
) {
    const updateUserSchema = z.object({
        isAdmin: z.boolean().optional(),
    });

    return await fetchWithSchema(`/api/users/${email}`, updateUserSchema, {
        method: "PATCH",
        body: updates,
    });
}
