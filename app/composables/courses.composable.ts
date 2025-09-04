import { da } from "zod/v4/locales";
import { courseSchema, coursesSchema, type Course } from "~~/shared/models";

function sortSessions(course: Course) {
    course.sessions.sort(
        (a, b) =>
            new Date(a.lessons[0]?.start ?? -1).getTime() -
            new Date(b.lessons[0]?.start ?? -1).getTime(),
    );
}

export function useCourses(admin = false, onlyUpcoming = false) {
    const currentDate = new Date().toISOString();

    let url = `/api/courses?withUsers=${admin}`;
    if (onlyUpcoming) {
        url += `&from=${currentDate}`;
    }

    const { data, error, isPending, refresh } = useSchemaFetch(
        url,
        coursesSchema,
    );

    const courses = computed(() => {
        for (const course of data.value || []) {
            sortSessions(course);
        }
        return data.value;
    });

    return {
        courses,
        error,
        isPending,
        refresh,
    };
}

export function useCourse(
    courseId: string,
    admin = false,
    onlyUpcoming = false,
) {
    const { data, error, isPending, refresh } = useSchemaFetch(
        `/api/courses/${courseId}?withUsers=${admin}&from=${onlyUpcoming ? new Date().toISOString() : ""}`,
        courseSchema,
    );

    const course = computed(() => {
        if (data.value === undefined) return undefined;

        sortSessions(data.value);
        return data.value;
    });

    return {
        course,
        isPending,
        error,
        refresh,
    };
}
