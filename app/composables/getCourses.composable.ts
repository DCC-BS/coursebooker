import { type Course, coursesSchema } from "~~/shared/models";

export function useCourse() {
    const courses: Ref<Course[]> = ref<Course[]>([]);
    const isPending = ref(true);

    const error = ref<string>();

    async function load(): Promise<void> {
        try {
            const response = await fetch("/api/courses");

            if (response.ok) {
                const json = await response.json();
                const parsed = coursesSchema.parse(json);
                courses.value = parsed;
            }

            console.error("Failed to load courses:", response.statusText);
            error.value = "Failed to load courses";
        } catch (e: unknown) {
            console.error("Failed to load courses:", e);
            error.value = "Failed to load courses";
        } finally {
            isPending.value = false;
        }
    }

    load();

    return {
        courses,
        isPending,
        error,
    };
}
