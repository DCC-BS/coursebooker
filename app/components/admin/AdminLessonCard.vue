<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { format } from "date-fns";
import type { Lesson } from "~/../shared/models";

interface Props {
    lesson: Lesson;
    lessonNumber: number;
    courseId: string;
    sessionId: string;
}

const props = defineProps<Props>();
const { t } = useI18n();

// Emits
const emit = defineEmits<{
    edit: [lesson: Lesson];
    delete: [lesson: Lesson];
}>();

// Dropdown actions
const actions = computed(
    () =>
        [
            [
                {
                    label: t("admin.lessonCard.editLesson"),
                    icon: "i-lucide-square-pen",
                    onSelect: () => emit("edit", props.lesson),
                },
                {
                    label: t("admin.lessonCard.deleteLesson"),
                    icon: "i-lucide-trash-2",
                    onSelect: () => emit("delete", props.lesson),
                },
            ],
        ] as DropdownMenuItem[][],
);

// Utility functions
function formatDateTime(date: Date): string {
    return format(date, "dd.MM.yyyy, HH:mm");
}

function formatDuration(start: Date, end: Date): string {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime.getTime() - startTime.getTime();

    if (diffMs <= 0) {
        return t("admin.lessonCard.invalid");
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
        return `${minutes}m`;
    }
    if (minutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
}
</script>

<template>
    <div class="bg-gray-50 border border-gray-200 rounded p-3">
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">
                {{ t("admin.lessonCard.lesson") }} {{ lessonNumber }}
            </span>
            <UDropdownMenu :items="actions">
                <UButton color="neutral" variant="ghost" icon="i-lucide-ellipsis-vertical" size="xs" />
            </UDropdownMenu>
        </div>

        <div class="space-y-1 text-xs text-gray-600">
            <div class="flex items-center">
                <UIcon name="i-lucide-calendar" class="h-3 w-3 mr-1" />
                {{ formatDateTime(lesson.start) }}
            </div>
            <div class="flex items-center">
                <UIcon name="i-lucide-calendar" class="h-3 w-3 mr-1" />
                {{ formatDateTime(lesson.end) }}
            </div>
            <div class="text-primary-600 font-medium">
                {{ t("admin.lessonCard.duration", { duration: formatDuration(lesson.start, lesson.end) }) }}
            </div>
        </div>
    </div>
</template>
