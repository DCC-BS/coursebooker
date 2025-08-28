<script setup lang="ts">
import type { Course } from '~~/shared/models';
import AdminHeader from '~/components/admin/AdminHeader.vue';
import AdminCourseCard from '~/components/admin/AdminCourseCard.vue';

// Page meta
definePageMeta({
    layout: false,
    title: 'Manage Courses'
});

// Reactive data
const searchQuery = ref('');
const typeFilter = ref('');
const showDeleteModal = ref(false);
const courseToDelete = ref<Course | null>(null);
const deleting = ref(false);

// Type filter options
const typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Course', value: 'course' },
    { label: 'Event', value: 'event' }
];

// Fetch courses
const { data: coursesData, pending, refresh } = await useFetch<Course[]>('/api/courses');

// Computed filtered courses
const filteredCourses = computed(() => {
    if (!coursesData.value) return [];

    let filtered = coursesData.value;

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(course =>
            course.title.toLowerCase().includes(query) ||
            course.description.toLowerCase().includes(query) ||
            course.organizer_name.toLowerCase().includes(query)
        );
    }

    // Filter by type
    if (typeFilter.value) {
        filtered = filtered.filter(course => course.type === typeFilter.value);
    }

    return filtered;
});

// Methods
function editCourse(course: Course) {
    navigateTo(`/admin/courses/${course.id}/edit`);
}

function deleteCourse(course: Course) {
    courseToDelete.value = course;
    showDeleteModal.value = true;
}

async function confirmDelete() {
    if (!courseToDelete.value) return;

    deleting.value = true;
    try {
        await $fetch(`/api/courses/${courseToDelete.value.id}`, {
            method: 'DELETE'
        });

        showDeleteModal.value = false;
        courseToDelete.value = null;
        await refresh();

        // Show success toast
        // You might want to add a toast notification here
    } catch (error) {
        console.error('Error deleting course:', error);
        // Show error toast
    } finally {
        deleting.value = false;
    }
}

useHead({
    title: 'Manage Courses - Admin'
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
                <UButton to="/admin/courses/create" color="primary" size="lg" icon="i-heroicons-plus">
                    Create Course
                </UButton>
            </div>

            <!-- Search and Filters -->
            <div class="mb-6 flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                    <UInput v-model="searchQuery" placeholder="Search courses..." icon="i-heroicons-magnifying-glass"
                        size="lg" />
                </div>
                <USelectMenu v-model="typeFilter" :items="typeOptions" value-key="value" placeholder="Filter by type"
                    size="lg" />
            </div>

            <!-- Courses Grid -->
            <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow p-6">
                    <USkeleton class="h-6 w-3/4 mb-4" />
                    <USkeleton class="h-4 w-full mb-2" />
                    <USkeleton class="h-4 w-2/3" />
                </div>
            </div>

            <div v-else-if="filteredCourses.length === 0" class="text-center py-12">
                <UIcon name="i-heroicons-academic-cap" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p class="text-gray-500 mb-6">Get started by creating your first course.</p>
                <UButton to="/admin/courses/create" color="primary">
                    Create Course
                </UButton>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AdminCourseCard v-for="course in filteredCourses" :key="course.id" :course="course" @edit="editCourse"
                    @delete="deleteCourse" />
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
                        Are you sure you want to delete "<span class="font-semibold">{{ courseToDelete?.title
                        }}</span>"?
                        This action cannot be undone and will also delete all associated sessions and lessons.
                    </p>

                    <template #footer>
                        <div class="flex justify-end gap-3">
                            <UButton color="secondary" @click="showDeleteModal = false">
                                Cancel
                            </UButton>
                            <UButton color="error" :loading="deleting" @click="confirmDelete">
                                Delete Course
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>