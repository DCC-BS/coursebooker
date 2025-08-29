<script setup lang="ts">
import type { Course, CreateSession, Session } from '~/../shared/models';

// Page meta
definePageMeta({
    layout: false,
    title: 'Manage Sessions'
});

// Get route params
const route = useRoute();
const courseId = route.params.id as string;
const currentSession = ref<Session>();

// State
const showSessionModal = ref(false);

// Fetch course data
const { data: course, pending, error, refresh } = await useFetch<Course>(`/api/courses/${courseId}`);

// Computed
const totalLessons = computed(() => {
    if (!course.value) return 0;
    return course.value.sessions.reduce((total: number, session: Session) => {
        return total + session.lessons.length;
    }, 0);
});

// Methods
function addSession() {
    currentSession.value = undefined;
    showSessionModal.value = true;
}

function editSession(session: Session) {
    currentSession.value = session;
    showSessionModal.value = true;
}

async function deleteSession(session: Session) {
    try {
        await $fetch(`/api/courses/${courseId}/sessions/${session.id}`, {
            method: 'DELETE'
        });

        await refresh();

    } catch (error) {
        console.error('Error deleting session:', error);
    }
}

function addLessonToSession(session: Session) {
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
                    <UIcon name="i-lucide-triangle-alert" class="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Course Not Found</h3>
                    <p class="text-gray-600 mb-4">The course you're looking for doesn't exist or has been deleted.</p>
                    <UButton to="/admin/courses" color="primary">
                        Back to Courses
                    </UButton>
                </div>
            </div>

            <div v-else-if="course">
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
                        <UBadge :color="course.type === 'course' ? 'primary' : 'secondary'" size="lg">
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
                            <UButton color="primary" icon="i-lucide-plus" @click="addSession">
                                Add Session
                            </UButton>
                        </div>
                    </div>

                    <div class="p-6">
                        <div v-if="course.sessions.length === 0" class="text-center py-12">
                            <UIcon name="i-lucide-calendar-days" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h4 class="text-lg font-medium text-gray-900 mb-2">No sessions yet</h4>
                            <p class="text-gray-500 mb-6">Get started by adding your first session.</p>
                            <UButton color="primary" @click="addSession">
                                Add Session
                            </UButton>
                        </div>

                        <div v-else class="space-y-6">
                            <AdminSessionCard v-for="(session, index) in course.sessions" :key="session.id"
                                :session="session" :session-number="index + 1" :course-id="course.id"
                                @edit="editSession" @delete="deleteSession" @add-lesson="addLessonToSession"
                                @changed="refresh" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Session Modal -->
        <UModal v-model:open="showSessionModal">
            <template #content>
                <AdminSessionForm :course-id="courseId" :session="currentSession" @cancel="showSessionModal = false"
                    @update="(_) => { refresh(); showSessionModal = false }" />
            </template>
        </UModal>
    </div>
</template>
