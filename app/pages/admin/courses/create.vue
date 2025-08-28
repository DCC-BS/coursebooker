<script setup lang="ts">
import type { Course, CreateCourse } from '~~/shared/models';
import AdminHeader from '~/components/admin/AdminHeader.vue';

// Page meta
definePageMeta({
    layout: false,
    title: 'Create Course'
});

const toast = useToast();

// Form state
const submitting = ref(false);

// Course type options
const typeOptions = [
    { label: 'Course', value: 'course' },
    { label: 'Event', value: 'event' }
];

// Form data
const emptyFormData = {
    type: 'course',
    title: '',
    description: '',
    organizer_name: '',
    organizer_mail: '',
    teams_link: '',
} as Course;

const formData = ref({ ...emptyFormData });

watch(formData, (newVal) => {
    console.log('Form Data Updated:', newVal);
}, { immediate: true, deep: true });

// Computed
const isFormValid = computed(() => {
    return formData.value.title.trim() !== '' &&
        formData.value.description.trim() !== '' &&
        formData.value.organizer_name.trim() !== '' &&
        formData.value.organizer_mail.trim() !== '';
});

// Methods
async function submitForm() {
    if (!isFormValid.value) return;

    submitting.value = true;

    try {
        // Prepare the course data
        const courseData: CreateCourse = {
            type: formData.value.type,
            title: formData.value.title.trim(),
            description: formData.value.description.trim(),
            organizer_name: formData.value.organizer_name.trim(),
            organizer_mail: formData.value.organizer_mail.trim(),
            teams_link: formData.value.teams_link?.trim() || null,
        };

        // const body = createCourseSchema.parse(courseData);
        const body = courseData;

        // Submit to API
        const newCourse = await $fetch<Course>('/api/courses', {
            method: 'POST',
            body
        });

        toast.add({
            title: 'Course created successfully',
            description: `The course "${newCourse.title}" has been created.`,
            icon: 'i-lucide-circle-check',
        });

        await navigateTo(`/admin/courses/${newCourse.id}/edit`);
    } catch (error) {
        console.error('Error creating course:', error);
        // Show error toast
    } finally {
        submitting.value = false;
    }
}

useHead({
    title: 'Create Course - Admin'
});
</script>


<template>
    <div class="min-h-screen bg-gray-50">
        <AdminHeader title="Create Course" />

        <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div class="bg-white shadow rounded-lg">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="text-xl font-semibold text-gray-900">Course Information</h2>
                    <p class="text-sm text-gray-600 mt-1">Fill in the basic details for your new course.</p>
                </div>

                <form @submit.prevent="submitForm" class="p-6 space-y-6">
                    <!-- Course Type -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Course Type
                        </label>
                        <USelectMenu v-model="formData.type" :items="typeOptions" value-key="value"
                            placeholder="Select course type" size="lg" required />
                    </div>

                    <!-- Course Title -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Course Title *
                        </label>
                        <UInput v-model="formData.title" placeholder="Enter course title" size="lg" required />
                    </div>

                    <!-- Course Description -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <UTextarea v-model="formData.description" placeholder="Describe what this course covers..."
                            :rows="4" resize required />
                    </div>

                    <!-- Organizer Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Organizer Name *
                            </label>
                            <UInput v-model="formData.organizer_name" placeholder="Enter organizer name" size="lg"
                                required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Organizer Email *
                            </label>
                            <UInput v-model="formData.organizer_mail" type="email" placeholder="organizer@example.com"
                                size="lg" required />
                        </div>
                    </div>

                    <!-- Teams Link -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Microsoft Teams Link (Optional)
                        </label>
                        <UInput v-model="formData.teams_link" placeholder="https://teams.microsoft.com/..." size="lg" />
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <UButton type="button" color="gray" @click="$router.back()">
                            Cancel
                        </UButton>
                        <UButton type="submit" color="primary" :loading="submitting" :disabled="!isFormValid">
                            Create Course
                        </UButton>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>