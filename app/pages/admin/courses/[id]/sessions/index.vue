<script setup lang="ts">
import type { Session } from "~/../shared/models";

// Page meta
definePageMeta({
    layout: "admin",
    title: "Manage Sessions",
});

const { t } = useI18n();

// Get route params
const route = useRoute();
const courseId = route.params.id as string;
const currentSession = ref<Session>();

// State
const showSessionModal = ref(false);
const showDeleteModal = ref(false);
const sessionToDelete = ref<Session>();
const sessionIsPast = ref(false);
const deleting = ref(false);

const { showToast } = useUserFeedback();

// Fetch course data
const { course, isPending, error, refresh } = useCourse(courseId, {
    admin: true,
    sortedSessions: false,
});

// Computed
const sessions = computed(() => {
    return course.value ? course.value.sessions : [];
});

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

function deleteSession(session: Session) {
    sessionToDelete.value = session;

    const now = new Date();
    const isInPast = session.lessons.every((lesson) => lesson.end < now);
    sessionIsPast.value = isInPast;

    showDeleteModal.value = true;
}

async function confirmDeleteSession() {
    if (!sessionToDelete.value) return;

    deleting.value = true;
    try {
        await $fetch(
            `/api/courses/${courseId}/sessions/${sessionToDelete.value.id}`,
            {
                method: "DELETE",
            },
        );

        showDeleteModal.value = false;
        sessionToDelete.value = undefined;
        await refresh();

        showToast(t("admin.course.sessionDeletedSuccessfully"), "success");
    } catch (error) {
        console.error("Error deleting session:", error);
        showToast(
            `${t("admin.course.failedToDeleteSession")}: ${(error as Error).message}`,
            "error",
        );
    } finally {
        deleting.value = false;
    }
}

function addLessonToSession(session: Session) {
    // Navigate to lessons management for this session
    navigateTo(`/admin/courses/${courseId}/sessions/${session.id}/lessons`);
}

useHead({
    title: computed(() =>
        course.value
            ? t("admin.course.manageSessionsTitle", {
                  title: course.value.title,
              })
            : t("admin.course.manageSessionsGeneric"),
    ),
});
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <AdminHeader
            :title="course ? t('admin.course.manageSessionsHeader', { title: course.title }) : t('admin.course.manageSessionsGeneric')" />

        <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div v-if="isPending" class="bg-white shadow rounded-lg p-6">
                <LoadingView :text="t('admin.course.loadingText')" />
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
                                <span>{{ sessions.length }} {{ t("admin.course.sessions").toLowerCase() }}</span>
                                <span>•</span>
                                <span>{{ totalLessons }} {{ t("admin.course.lessons") }}</span>
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
                                <h3 class="text-lg font-semibold text-gray-900">{{ t("admin.course.sessions") }}</h3>
                                <p class="text-sm text-gray-600 mt-1">{{ t("admin.course.manageDessionsDesc") }}</p>
                            </div>
                            <UButton color="primary" icon="i-lucide-plus" @click="addSession">
                                {{ t("admin.course.addSession") }}
                            </UButton>
                        </div>
                    </div>

                    <div class="p-6">
                        <div v-if="sessions.length === 0" class="text-center py-12">
                            <UIcon name="i-lucide-calendar-days" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h4 class="text-lg font-medium text-gray-900 mb-2">{{ t("admin.course.noSessionsYet") }}
                            </h4>
                            <p class="text-gray-500 mb-6">{{ t("admin.course.getStartedAddSession") }}</p>
                            <UButton color="primary" @click="addSession">
                                {{ t("admin.course.addSession") }}
                            </UButton>
                        </div>

                        <div v-else class="space-y-6">
                            <AdminSessionCard v-for="(session, index) in sessions" :key="session.id" :session="session"
                                :session-number="index + 1" :course-id="course.id" @edit="editSession"
                                @delete="deleteSession" @add-lesson="addLessonToSession" :refresh-session="refresh" />
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

        <!-- Delete Session Confirmation Modal -->
        <UModal v-model:open="showDeleteModal">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="text-lg font-semibold">{{ t("admin.session.deleteSessionTitle") }}</h3>
                    </template>

                    <p class="text-gray-600 mb-4">
                        {{ t("admin.session.deleteSessionConfirm", { title: sessionToDelete?.title || "this session" })
                        }}
                    </p>

                    <p v-if="sessionIsPast" class="text-amber-600 mb-4">
                        <UIcon name="i-lucide-info" class="h-4 w-4 inline mr-1" />
                        {{ t("admin.session.deleteSessionPast") }}
                    </p>

                    <p v-if="sessionToDelete?.registrations && sessionToDelete.registrations.length > 0 && !sessionIsPast"
                        class="text-amber-600 mb-4">
                        <UIcon name="i-lucide-mail" class="h-4 w-4 inline mr-1" />
                        {{ t("admin.session.deleteSessionRegistrations", {
                            count: sessionToDelete.registrations.length
                        }) }}
                    </p>

                    <template #footer>
                        <div class="flex justify-end gap-3">
                            <UButton color="secondary" @click="showDeleteModal = false">
                                {{ t("admin.session.cancel") }}
                            </UButton>
                            <UButton color="error" :loading="deleting" @click="confirmDeleteSession">
                                {{ t("admin.session.deleteSessionConfirmButton") }}
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>
