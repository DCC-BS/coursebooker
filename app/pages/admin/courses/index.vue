<script setup lang="ts">
import AdminCourseCard from "~/components/admin/AdminCourseCard.vue";
import AdminHeader from "~/components/admin/AdminHeader.vue";
import type {
    Course,
    CreateCourse,
    CreateLesson,
    CreateSession,
    Session,
} from "~~/shared/models";

// Page meta
definePageMeta({
    layout: "admin",
    title: "Manage Courses",
});

const feedback = useUserFeedback();

// Reactive data
const searchQuery = ref("");
const typeFilter = ref("all" as "all" | "course" | "event");
const showDeleteModal = ref(false);
const courseToDelete = ref<Course | null>(null);
const deleting = ref(false);

// Type filter options
const typeOptions = ref([
    { label: "All Types", value: "all" },
    { label: "Course", value: "course" },
    { label: "Event", value: "event" },
]);

// Fetch courses
const { courses, isPending, refresh } = useCourses(true);

function distanceToNow(course: Course) {
    const start = course.sessions[0]?.lessons[0]?.start;
    if (!start) return 0;

    const now = Date.now();
    return Math.abs(start.getTime() - now);
}

// Computed filtered courses
const filteredCourses = computed(() => {
    if (!courses.value) return [];

    let filtered = courses.value;

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
            (course) =>
                course.title.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query) ||
                course.organizer_name.toLowerCase().includes(query),
        );
    }

    // Filter by type
    if (typeFilter.value && typeFilter.value !== "all") {
        filtered = filtered.filter(
            (course) => course.type === typeFilter.value,
        );
    }

    return filtered.sort((a, b) => distanceToNow(a) - distanceToNow(b));
});

// Methods
function editCourse(course: Course) {
    navigateTo(`/admin/courses/${course.id}/edit`);
}

function deleteCourse(course: Course) {
    courseToDelete.value = course;
    showDeleteModal.value = true;
}

async function duplicateCourse(course: Course) {
    const body = {
        ...course,
        title: `${course.title} (Copy)`,
        id: undefined, // Let the backend assign a new ID
    } as CreateCourse;

    try {
        const newCourse = await $fetch<Course>("/api/courses", {
            method: "POST",
            body,
        });

        for (const session of course.sessions) {
            const newSession = await $fetch<Session>(
                `/api/courses/${newCourse.id}/sessions`,
                {
                    method: "POST",
                    body: {
                        ...session,
                        courseId: newCourse.id,
                        id: undefined, // Let the backend assign a new ID
                    } as CreateSession,
                },
            );

            for (const lesson of session.lessons) {
                await $fetch(
                    `/api/courses/${newCourse.id}/sessions/${newSession.id}/lessons`,
                    {
                        method: "POST",
                        body: {
                            ...lesson,
                            sessionId: newSession.id,
                            id: undefined, // Let the backend assign a new ID
                        } as CreateLesson,
                    },
                );
            }
        }

        feedback.showSuccess({ title: "Course duplicated successfully" });
    } catch (error) {
        console.error("Error duplicating course:", error);
        feedback.showError({
            title: "Failed to duplicate course",
            description: error.message,
        });
    } finally {
        refresh();
    }
}

async function confirmDelete() {
    if (!courseToDelete.value) return;

    deleting.value = true;
    try {
        await $fetch(`/api/courses/${courseToDelete.value.id}`, {
            method: "DELETE",
        });

        showDeleteModal.value = false;
        courseToDelete.value = null;
        await refresh();

        feedback.showSuccess({ title: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        const errorMessage = (error as Error).message;

        if (
            errorMessage?.includes(
                "Cannot delete course/event when there are still active sessions",
            )
        ) {
            feedback.showError({
                title: t("admin.course.cannotDeleteWithActiveSessions"),
                description: t("admin.course.deleteSessionsFirst"),
            });
        } else {
            feedback.showError({
                title: "Failed to delete course",
                description: errorMessage,
            });
        }
    } finally {
        deleting.value = false;
    }
}

useHead({
    title: "Manage Courses - Admin",
});
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <AdminHeader title="Manage Courses" />

        <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <!-- Header Actions -->
            <div class="mb-8 flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">Courses</h2>
                    <p class="text-gray-600">Manage all your courses, sessions, and lessons</p>
                </div>
                <UButton to="/admin/courses/create" color="primary" size="lg" icon="i-lucide-plus">
                    Create Course
                </UButton>
            </div>

            <!-- Search and Filters -->
            <div class="mb-6 flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                    <UInput v-model="searchQuery" placeholder="Search courses..." icon="i-lucide-search" size="lg" />
                </div>
                <USelectMenu v-model="typeFilter" :items="typeOptions" value-key="value" placeholder="Filter by type"
                    size="lg" />
            </div>

            <!-- Courses Grid -->
            <div v-if="isPending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow p-6">
                    <USkeleton class="h-6 w-3/4 mb-4" />
                    <USkeleton class="h-4 w-full mb-2" />
                    <USkeleton class="h-4 w-2/3" />
                </div>
            </div>

            <div v-else-if="filteredCourses.length === 0" class="text-center py-12">
                <UIcon name="i-lucide-graduation-cap" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p class="text-gray-500 mb-6">Get started by creating your first course.</p>
                <UButton to="/admin/courses/create" color="primary">
                    Create Course
                </UButton>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AdminCourseCard v-for="course in filteredCourses" :key="course.id" :course="course" @edit="editCourse"
                    @delete="deleteCourse" @duplicate="duplicateCourse" />
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <UModal v-model:open="showDeleteModal">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="text-lg font-semibold">Delete Course</h3>
                    </template>

                    <p class="text-gray-600">
                        {{ t("admin.course.deleteConfirm", { title: courseToDelete?.title || "this course/event" }) }}
                        {{ t("admin.course.deleteWarning") }}
                    </p>

                    <template #footer>
                        <div class="flex justify-end gap-3">
                            <UButton color="secondary" @click="showDeleteModal = false">
                                {{ t("admin.session.cancel") }}
                            </UButton>
                            <UButton color="error" :loading="deleting" @click="confirmDelete">
                                {{ t("admin.course.deleteCourse") }}
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>