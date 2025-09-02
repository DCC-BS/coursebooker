import { coursesSchema } from "~~/shared/models";

export function useCourses(admin = false) {
    const { data, error, isPending, refresh } = useSchemaFetch(
        `/api/courses?withUsers=${admin}`,
        coursesSchema,
    );

    return {
        courses: data,
        error,
        isPending,
        refresh,
    };
}
