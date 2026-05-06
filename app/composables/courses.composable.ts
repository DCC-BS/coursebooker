import {
    type Course,
    type CreateCourse,
    courseSchema,
    courseSchemaWithoutSessions,
    coursesSchema,
    type UpdateCourse,
} from "~~/shared/models";

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

type useCourseOptions = {
    admin?: boolean;
    onlyUpcoming?: boolean;
    sorted?: boolean;
    sortedSessions?: boolean;
};

export function useCourse(courseId: string, options: useCourseOptions = {}) {
    const {
        admin = false,
        onlyUpcoming = false,
        sortedSessions = true,
    } = options;

    const { data, error, isPending, refresh } = useSchemaFetch(
        `/api/courses/${courseId}?withUsers=${admin}&from=${onlyUpcoming ? new Date().toISOString() : ""}`,
        courseSchema,
    );

    const course = computed(() => {
        if (data.value === undefined) return undefined;

        if (sortedSessions) {
            sortSessions(data.value);
        }

        return data.value;
    });

    return {
        course,
        isPending,
        error,
        refresh,
    };
}

export async function createCourse(courseData: CreateCourse) {
    return await fetchWithSchema("/api/courses", courseSchemaWithoutSessions, {
        method: "POST",
        body: courseData,
    });
}

export async function updateCourse(courseId: string, updates: UpdateCourse) {
    return await fetchWithSchema(
        `/api/courses/${courseId}`,
        courseSchemaWithoutSessions,
        {
            method: "PATCH",
            body: updates,
        },
    );
}

export async function deleteCourse(courseId: string) {
    return await $fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
    });
}
