import { courseSchema } from "~~/shared/models";

export function useCourse(courseId: string, admin = false) {
    const { data, error, isPending } = useSchemaFetch(
        `/api/courses/${courseId}?withUsers=${admin}`,
        courseSchema,
    );
    return {
        course: data,
        isPending,
        error,
    };
}
