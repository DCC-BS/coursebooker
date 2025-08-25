<script setup lang="ts">
import type { Course } from '~/../shared/models/courses.model';
import type { CourseSession } from '~/../shared/models/session.model';

// Page meta
definePageMeta({
    layout: false,
    title: 'Manage Sessions'
});

// Get route params
const route = useRoute();
const courseId = route.params.id as string;

// State
const showAddSessionModal = ref(false);
const creating = ref(false);

// New session form
const newSession = reactive({
    location: '',
    teams_link: ''
});

// Fetch course data
const { data: course, pending, error, refresh } = await useFetch<Course>(`/api/courses/${courseId}`);

// Computed
const totalLessons = computed(() => {
    if (!course.value) return 0;
    return course.value.sessions.reduce((total: number, session: CourseSession) => {
        return total + session.lessons.length;
    }, 0);
});

// Methods
function addSession() {
    newSession.location = '';
    newSession.teams_link = '';
    showAddSessionModal.value = true;
}

async function createSession() {
    creating.value = true;
    try {
        await $fetch(`/api/courses/${courseId}/sessions`, {
            method: 'POST',
            body: {
                location: newSession.location,
                teams_link: newSession.teams_link || undefined
            }
        });

        showAddSessionModal.value = false;
        await refresh();

    } catch (error) {
        console.error('Error creating session:', error);
    } finally {
        creating.value = false;
    }
}

function editSession(session: CourseSession) {
    // Navigate to session edit page
    navigateTo(`/admin/courses/${courseId}/sessions/${session.id}/edit`);
}

async function deleteSession(session: CourseSession) {
    try {
        await $fetch(`/api/courses/${courseId}/sessions/${session.id}`, {
            method: 'DELETE'
        });

        await refresh();

    } catch (error) {
        console.error('Error deleting session:', error);
    }
}

function addLessonToSession(session: CourseSession) {
    // Navigate to lessons management for this session
    navigateTo(`/admin/courses/${courseId}/sessions/${session.id}/lessons`);
}

useHead({
    title: computed(() => course.value ? `Manage Sessions - ${course.value.title}` : 'Manage Sessions')
});
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <AdminHeader :title="`Manage Sessions - ${course?.title || 'Course'}`" />

        <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div v-if="pending" class="bg-white shadow rounded-lg p-6">
                <div class="animate-pulse">
                    <USkeleton class="h-8 w-1/3 mb-4" />
                    <USkeleton class="h-4 w-full mb-2" />
                    <USkeleton class="h-4 w-2/3" />
                </div>
            </div>

            <div v-else-if="error" class="bg-white shadow rounded-lg p-6">
                <div class="text-center">
                    <UIcon name="i-heroicons-exclamation-triangle" class="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Course Not Found</h3>
                    <p class="text-gray-600 mb-4">The course you're looking for doesn't exist or has been deleted.</p>
                    <UButton to="/admin/courses" color="primary">
                        Back to Courses
                    </UButton>
                </div>
            </div>

            <div v-else>
                <!-- Course Info Header -->
                <div class="bg-white shadow rounded-lg p-6 mb-6">
                    <div class="flex items-start justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ course.title }}</h2>
                            <p class="text-gray-600 mb-4">{{ course.description }}</p>
                            <div class="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{{ course.organizer_name }}</span>
                                <span>•</span>
                                <span>{{ course.sessions.length }} sessions</span>
                                <span>•</span>
                                <span>{{ totalLessons }} lessons</span>
                            </div>
                        </div>
                        <UBadge :color="course.type === 'course' ? 'blue' : 'green'" size="lg">
                            {{ course.type.charAt(0).toUpperCase() + course.type.slice(1) }}
                        </UBadge>
                    </div>
                </div>

                <!-- Sessions Management -->
                <div class="bg-white shadow rounded-lg">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">Sessions</h3>
                                <p class="text-sm text-gray-600 mt-1">Manage sessions and their lessons for this course.
                                </p>
                            </div>
                            <UButton color="primary" icon="i-heroicons-plus" @click="addSession">
                                Add Session
                            </UButton>
                        </div>
                    </div>

                    <div class="p-6">
                        <div v-if="course.sessions.length === 0" class="text-center py-12">
                            <UIcon name="i-heroicons-calendar-days" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h4 class="text-lg font-medium text-gray-900 mb-2">No sessions yet</h4>
                            <p class="text-gray-500 mb-6">Get started by adding your first session.</p>
                            <UButton color="primary" @click="addSession">
                                Add Session
                            </UButton>
                        </div>

                        <div v-else class="space-y-6">
                            <AdminSessionCard v-for="(session, index) in course.sessions" :key="session.id"
                                :session="session" :session-number="index + 1" :course-id="course.id"
                                @edit="editSession" @delete="deleteSession" @add-lesson="addLessonToSession" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Session Modal -->
        <UModal v-model="showAddSessionModal">
            <UCard>
                <template #header>
                    <h3 class="text-lg font-semibold">Add New Session</h3>
                </template>

                <form @submit.prevent="createSession" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>
                        <UInput v-model="newSession.location" placeholder="Enter session location" size="lg" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Teams Link (Optional)
                        </label>
                        <UInput v-model="newSession.teams_link" placeholder="https://teams.microsoft.com/..."
                            size="lg" />
                    </div>
                </form>

                <template #footer>
                    <div class="flex justify-end gap-3">
                        <UButton type="button" color="gray" @click="showAddSessionModal = false">
                            Cancel
                        </UButton>
                        <UButton type="submit" color="primary" :loading="creating" @click="createSession">
                            Create Session
                        </UButton>
                    </div>
                </template>
            </UCard>
        </UModal>
    </div>
</template>
