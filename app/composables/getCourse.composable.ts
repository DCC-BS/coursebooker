import { courseSchema, type Course } from "~~/shared/models";

export function useCourse(courseId: string) {
    const course = ref<Course>();
    const isPending = ref(true);

    const error = ref<string>();

    async function load(): Promise<void> {
        try {
            const response = await fetch(`/api/courses/${courseId}`);

            if (response.ok) {
                const json = await response.json();
                const parsed = courseSchema.parse(json);
                course.value = parsed;
                return;
            }

            console.error("Failed to load course:", response.statusText);
            error.value = "Failed to load course";
        } catch (e: unknown) {
            console.error("Failed to load course:", e);
            error.value = "Failed to load course";
        } finally {
            isPending.value = false;
        }
    }

    load();

    return {
        course,
        isPending,
        error,
    };
}
