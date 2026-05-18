import { z } from "zod";
import { userSchema } from "~~/shared/models";

type useUsersOptions = {
    withRegistrations?: boolean;
};

export function useUsers(options: useUsersOptions = {}) {
    const { withRegistrations = true } = options;

    const schema = withRegistrations
        ? userSchema
        : userSchema.omit({ registrations: true });

    const { data, error, isPending, refresh } = useSchemaFetch(
        `/api/users?withRegistrations=${withRegistrations}`,
        z.array(schema),
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
