<script setup lang="ts">
import type { Lesson, Session } from "~/../shared/models";

interface Props {
    session: Session;
    sessionNumber: number;
    courseId: string;
}

const props = defineProps<Props>();
const feedback = useUserFeedback();

// Emits
const emit = defineEmits<{
    changed: [];
    edit: [session: Session];
    delete: [session: Session];
    "add-lesson": [session: Session];
}>();

// Dropdown actions
const actions = [
    [
        {
            label: "Edit Session",
            icon: "i-lucide-square-pen",
            onSelect: () => emit("edit", props.session),
        },
        {
            label: "Delete Session",
            icon: "i-lucide-trash-2",
            onSelect: () => emit("delete", props.session),
        },
    ],
];

// Methods
async function deleteLesson(lesson: Lesson) {
    try {
        await $fetch(
            `/api/courses/${props.courseId}/sessions/${props.session.id}/lessons/${lesson.id}`,
            {
                method: "DELETE",
            },
        );
        emit("changed");
        feedback.showSuccess({ title: "Lesson deleted successfully" });
    } catch (error) {
        feedback.showError({ title: "Failed to delete lesson" });
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
                        Session {{ sessionNumber }}
                    </h4>
                    <UBadge v-if="session.lessons.length === 0" color="warning">No
                        Lessons</UBadge>
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
                </div>
            </div>

            <!-- Actions Dropdown -->
            <UDropdownMenu :items="actions">
                <UButton color="neutral" variant="ghost" icon="i-lucide-ellipsis-vertical" size="sm" />
            </UDropdownMenu>
        </div>

        <!-- Lessons List -->
        <div v-if="session.lessons.length > 0" class="space-y-3">
            <h5 class="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                Lessons
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AdminLessonCard v-for="(lesson, index) in session.lessons" :key="lesson.id" :lesson="lesson"
                    :lesson-number="index + 1" :course-id="courseId" :session-id="session.id" @delete="deleteLesson" />
            </div>
        </div>

        <div>
            <AdminLessonForm :course-id="courseId" :session-id="session.id" @created="emit('changed')" />
        </div>

        <!-- Quick Actions -->
        <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div class="flex space-x-2">
                <UButton size="xs" color="neutral" variant="ghost" @click="$emit('edit', session)">
                    Edit Session
                </UButton>
            </div>
            <div class="text-xs text-gray-500">
                ID: {{ session.id }}
            </div>
        </div>
    </div>
</template>
