<script setup lang="ts">
import type { Course, Session } from '~/../shared/models';

// Page meta
definePageMeta({
    layout: false,
    title: 'Edit Course'
});

// Get route params
const route = useRoute();
const courseId = route.params.id as string;

// Form state
const submitting = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);

// Course type options
const typeOptions = [
    { label: 'Course', value: 'course' },
    { label: 'Event', value: 'event' }
];

// Fetch course data
const { data: course, pending, error, refresh } = await useFetch<Course>(`/api/courses/${courseId}`);

// Form data - initialize with course data
const form = reactive({
    type: 'course',
    title: '',
    description: '',
    organizer_name: '',
    organizer_mail: '',
    teams_link: '',
    sessions: [] as Session[],
} as Course);

// Watch for course data and populate form
watch(course, (newCourse) => {
    if (newCourse) {
        form.type = newCourse.type;
        form.title = newCourse.title;
        form.description = newCourse.description;
        form.organizer_name = newCourse.organizer_name;
        form.organizer_mail = newCourse.organizer_mail;
        form.teams_link = newCourse.teams_link || '';
    }
}, { immediate: true });

// Computed
const isFormValid = computed(() => {
    return form.title.trim() !== '' &&
        form.description.trim() !== '' &&
        form.organizer_name.trim() !== '' &&
        form.organizer_mail.trim() !== '';
});

// Methods
async function submitForm() {
    if (!isFormValid.value || !course.value) return;

    submitting.value = true;

    try {
        // Prepare the update data
        const updateData = {
            type: form.type,
            title: form.title.trim(),
            description: form.description.trim(),
            organizer_name: form.organizer_name.trim(),
            organizer_mail: form.organizer_mail.trim(),
            teams_link: form.teams_link?.trim() || undefined
        };

        // Update via API
        await $fetch(`/api/courses/${courseId}`, {
            method: 'PATCH',
            body: updateData
        });

        // Refresh course data
        await refresh();
    } catch (error) {
        console.error('Error updating course:', error);
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
            method: 'DELETE'
        });

        // Redirect to course list
        await navigateTo('/admin/courses');

    } catch (error) {
        console.error('Error deleting course:', error);
        // Show error toast
    } finally {
        deleting.value = false;
        showDeleteModal.value = false;
    }
}

useHead({
    title: computed(() => course.value ? `Edit ${course.value.title} - Admin` : 'Edit Course - Admin')
});
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <AdminHeader title="Edit Course" />

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
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Course Not Found</h3>
                    <p class="text-gray-600 mb-4">The course you're looking for doesn't exist or has been deleted.</p>
                    <UButton to="/admin/courses" color="primary">
                        Back to Courses
                    </UButton>
                </div>
            </div>

            <div v-else class="bg-white shadow rounded-lg">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="text-xl font-semibold text-gray-900">Edit Course</h2>
                    <p class="text-sm text-gray-600 mt-1">Update the details for this course.</p>
                </div>

                <form @submit.prevent="submitForm" class="p-6 space-y-6">
                    <!-- Course Type -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Course Type
                        </label>
                        <USelect v-model="form.type" :items="typeOptions" value-key="value"
                            placeholder="Select course type" size="lg" required />
                    </div>

                    <!-- Course Title -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Course Title *
                        </label>
                        <UInput v-model="form.title" placeholder="Enter course title" size="lg" required />
                    </div>

                    <!-- Course Description -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <UTextarea v-model="form.description" placeholder="Describe what this course covers..."
                            :rows="4" resize required />
                    </div>

                    <!-- Organizer Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Organizer Name *
                            </label>
                            <UInput v-model="form.organizer_name" placeholder="Enter organizer name" size="lg"
                                required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Organizer Email *
                            </label>
                            <UInput v-model="form.organizer_mail" type="email" placeholder="organizer@example.com"
                                size="lg" required />
                        </div>
                    </div>

                    <!-- Teams Link -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Microsoft Teams Link (Optional)
                        </label>
                        <UInput v-model="form.teams_link" placeholder="https://teams.microsoft.com/..." size="lg" />
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-between pt-6 border-t border-gray-200">
                        <div>
                            <UButton type="button" color="error" variant="outline" icon="i-lucide-trash-2"
                                @click="showDeleteModal = true">
                                Delete Course
                            </UButton>
                        </div>
                        <div class="flex space-x-4">
                            <UButton type="button" color="neutral" @click="$router.back()">
                                Cancel
                            </UButton>
                            <UButton type="submit" color="primary" :loading="submitting" :disabled="!isFormValid">
                                Update Course
                            </UButton>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Sessions Management Link -->
            <div v-if="course" class="mt-6 bg-white shadow rounded-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">Sessions & Lessons</h3>
                        <p class="text-sm text-gray-600 mt-1">Manage sessions and lessons for this course separately.
                        </p>
                    </div>
                    <UButton :to="`/admin/courses/${course.id}/sessions`" color="primary" icon="i-lucide-calendar-days">
                        Manage Sessions
                    </UButton>
                </div>
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
                        Are you sure you want to delete "<span class="font-semibold">{{ course?.title }}</span>"?
                        This action cannot be undone and will also delete all associated sessions and lessons.
                    </p>

                    <template #footer>
                        <div class="flex justify-end gap-3">
                            <UButton color="neutral" @click="showDeleteModal = false">
                                Cancel
                            </UButton>
                            <UButton color="error" :loading="deleting" @click="deleteCourse">
                                Delete Course
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>