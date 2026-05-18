<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v";
import type { Lesson, Session } from "~/../shared/models";

interface Props {
    session: Session;
    sessionNumber: number;
    courseId: string;
    refreshSession: () => Promise<void>;
}

const props = defineProps<Props>();
const { showToast } = useUserFeedback();
const { t } = useI18n();

const showRegistrations = ref<string>();

function toggleShowRegistrations(sessionId: string) {
    if (showRegistrations.value === sessionId) {
        showRegistrations.value = "";
    } else {
        showRegistrations.value = sessionId;
    }
}

const emit = defineEmits<{
    edit: [session: Session];
    delete: [session: Session];
    "add-lesson": [session: Session];
}>();

const actions = computed(() => [
    [
        {
            label: t("admin.session.editSession"),
            icon: "i-lucide-square-pen",
            onSelect: () => emit("edit", props.session),
        },
        {
            label: "Benachrichtigung senden",
            icon: "i-lucide-mail",
            to: `/admin/courses/${props.courseId}/sessions/${props.session.id}/notify`,
        },
        {
            label: t("admin.session.deleteSession"),
            icon: "i-lucide-trash-2",
            onSelect: () => emit("delete", props.session),
        },
    ],
]);

async function deleteLesson(lesson: Lesson) {
    try {
        await $fetch(
            `/api/courses/${props.courseId}/sessions/${props.session.id}/lessons/${lesson.id}`,
            {
                method: "DELETE",
            },
        );

        await props.refreshSession();
        showToast(t("admin.session.lessonDeletedSuccessfully"), "success");
    } catch (error) {
        showToast(t("admin.session.failedToDeleteLesson"), "error");
        console.error("Error deleting lesson:", error);
    }
}
</script>


<template>
    <div class="border border-gray-200 rounded-lg p-6">
        <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <h4 class="text-lg font-semibold text-gray-900">
                        {{ t("session.title", { number: sessionNumber }) }}
                    </h4>
                    <UBadge v-if="props.session.lessons.length === 0" color="warning">
                        {{ t("admin.session.noLessons") }}
                    </UBadge>
                </div>

                <div class="space-y-1 text-sm text-gray-600">
                    <div v-if="session.location" class="flex items-center">
                        <UIcon name="i-lucide-map-pin" class="h-4 w-4 mr-2" />
                        {{ session.location }}
                    </div>
                    <div v-if="session.teams_link" class="flex items-center">
                        <UIcon name="i-lucide-video" class="h-4 w-4 mr-2" />
                        {{ session.teams_link }}
                    </div>
                    <div class="flex items-center">
                        <UIcon name="i-lucide-user" class="h-4 w-4 mr-2" />
                        <ULink @click="toggleShowRegistrations(session.id)" class="underline cursor-pointer">
                            {{ t("admin.session.registrations", { count: props.session.registrations?.length || 0 }) }}
                        </ULink>
                    </div>
                    <AnimatePresence>
                        <motion.div :initial="{ opacity: 0, height: 0 }" :animate="{ opacity: 1, height: 'auto' }"
                            :exit="{ opacity: 0, height: 0 }" v-if="showRegistrations == session.id">
                            <AdminRegistrationsCard :course-id="courseId" :session="props.session"
                                :refreshSession="props.refreshSession" />
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>

            <UDropdownMenu :items="actions">
                <UButton color="neutral" variant="ghost" icon="i-lucide-ellipsis-vertical" size="sm" />
            </UDropdownMenu>
        </div>

        <div v-if="props.session.lessons.length > 0" class="space-y-3">
            <h5 class="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                {{ t("admin.session.lessons") }}
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AdminLessonCard v-for="(lesson, index) in props.session.lessons" :key="lesson.id" :lesson="lesson"
                    :lesson-number="index + 1" :course-id="courseId" :session-id="session.id" @delete="deleteLesson" />
            </div>
        </div>

        <div class="mt-2">
            <AdminLessonForm :course-id="courseId" :session-id="session.id" :session="session"
                @created="refreshSession" />
        </div>

        <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div class="flex space-x-2">
                <UButton size="xs" color="neutral" variant="ghost" @click="$emit('edit', session)">
                    {{ t("admin.session.editSession") }}
                </UButton>
                <UButton size="xs" color="primary" variant="ghost"
                    :to="`/admin/courses/${courseId}/sessions/${session.id}/notify`">
                    Benachrichtigen
                </UButton>
            </div>
            <div class="text-xs text-gray-500">
                {{ t("admin.session.sessionId", { id: session.id }) }}
            </div>
        </div>
    </div>
</template>
