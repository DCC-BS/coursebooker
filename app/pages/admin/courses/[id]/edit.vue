<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Course, Session, updateCourseSchema } from "~/../shared/models";

// Page meta
definePageMeta({
    layout: "admin",
    title: "Edit Course",
});

const { t } = useI18n();

// Get route params
const route = useRoute();
const courseId = route.params.id as string;

// Fetch course data
const {
    data: course,
    pending,
    error,
    refresh,
} = await useFetch<Course>(`/api/courses/${courseId}`);

// Form data - initialize with course data
const form = reactive({
    type: "course",
    title: "",
    description: "",
    organizer_name: "",
    organizer_mail: "",
} as Course);

// Watch for course data and populate form
watch(
    course,
    (newCourse) => {
        if (newCourse) {
            form.type = newCourse.type;
            form.title = newCourse.title;
            form.description = newCourse.description;
            form.organizer_name = newCourse.organizer_name;
            form.organizer_mail = newCourse.organizer_mail;
        }
    },
    { immediate: true },
);

// Methods
async function submitForm(event: FormSubmitEvent<Course>) {
    try {
        // Prepare the update data
        const updateData = {
            type: event.data.type,
            title: event.data.title.trim(),
            description: event.data.description?.trim(),
            organizer_name: event.data.organizer_name.trim(),
            organizer_mail: event.data.organizer_mail.trim(),
        };

        // Update via API
        await $fetch(`/api/courses/${courseId}`, {
            method: "PATCH",
            body: updateData,
        });

        // Refresh course data
        await refresh();
    } catch (error) {
        console.error("Error updating course:", error);
        // Show error toast
    } finally {
        submitting.value = false;
    }
}

async function deleteCourse() {
    if (!course.value) return;

    deleting.value = true;
    try {
        await $fetch(`/api/courses/${courseId}`, {
            method: "DELETE",
        });

        // Redirect to course list
        await navigateTo("/admin/courses");
    } catch (error) {
        console.error("Error deleting course:", error);
        // Show error toast
    } finally {
        deleting.value = false;
        showDeleteModal.value = false;
    }
}

useHead({
    title: computed(() =>
        course.value
            ? t("admin.course.editCourseTitle", { title: course.value.title })
            : t("admin.course.editCourseGeneric"),
    ),
});
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <AdminHeader :title="t('admin.course.editCourse')" />

        <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div v-if="pending" class="bg-white shadow rounded-lg p-6">
                <div class="animate-pulse">
                    <USkeleton class="h-8 w-1/3 mb-4" />
                    <USkeleton class="h-4 w-full mb-2" />
                    <USkeleton class="h-4 w-2/3" />
                </div>
            </div>

            <div v-else-if="error" class="bg-white shadow rounded-lg p-6">
                <div class="text-center">
                    <UIcon name="i-lucide-triangle-alert" class="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t("admin.course.courseNotFound") }}</h3>
                    <p class="text-gray-600 mb-4">{{ t("admin.course.courseNotFoundDesc") }}</p>
                    <UButton to="/admin/courses" color="primary">
                        {{ t("admin.course.backToCourses") }}
                    </UButton>
                </div>
            </div>

            <div v-else class="bg-white shadow rounded-lg">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="text-xl font-semibold text-gray-900">{{ t("admin.course.editCourseHeader") }}</h2>
                    <p class="text-sm text-gray-600 mt-1">{{ t("admin.course.updateCourseDetails") }}</p>
                </div>

                <AdminCourseForm :course="course" :course-id="courseId" :refresh="refresh" />
            </div>

            <!-- Sessions Management Link -->
            <div v-if="course" class="mt-6 bg-white shadow rounded-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">{{ t("admin.course.sessionsAndLessons") }}</h3>
                        <p class="text-sm text-gray-600 mt-1">{{ t("admin.course.manageSessionsDesc") }}</p>
                    </div>
                    <UButton :to="`/admin/courses/${course.id}/sessions`" color="primary" icon="i-lucide-calendar-days">
                        {{ t("admin.course.manageSessions") }}
                    </UButton>
                </div>
            </div>
        </div>
    </div>
</template>