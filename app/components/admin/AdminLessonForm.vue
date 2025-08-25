<script setup lang="ts">
import type { Lesson } from '~/../shared/models/lession.model';

interface Props {
    lesson: Lesson & { tempId: string };
    lessonNumber: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    update: [lesson: Lesson & { tempId: string }];
    delete: [];
}>();

function formatDateTimeLocal(date: Date): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

function updateStartTime(value: string) {
    const updatedLesson = {
        ...props.lesson,
        start: new Date(value)
    };
    emit('update', updatedLesson);
}

function updateEndTime(value: string) {
    const updatedLesson = {
        ...props.lesson,
        end: new Date(value)
    };
    emit('update', updatedLesson);
}

function formatDuration(start: Date, end: Date): string {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime.getTime() - startTime.getTime();

    if (diffMs <= 0) {
        return 'Invalid duration';
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
        return `${minutes} minutes`;
    } else if (minutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
    }
}
</script>

<template>
    <div class="bg-gray-50 border border-gray-200 rounded p-3">
        <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-gray-700">
                Lesson {{ lessonNumber }}
            </span>
            <UButton color="red" variant="ghost" icon="i-heroicons-trash" size="xs" @click="$emit('delete')">
                Remove
            </UButton>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Start Time -->
            <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                    Start Time
                </label>
                <UInput :model-value="formatDateTimeLocal(lesson.start)" @update:model-value="updateStartTime($event)"
                    type="datetime-local" size="sm" />
            </div>

            <!-- End Time -->
            <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                    End Time
                </label>
                <UInput :model-value="formatDateTimeLocal(lesson.end)" @update:model-value="updateEndTime($event)"
                    type="datetime-local" size="sm" />
            </div>
        </div>

        <!-- Duration Display -->
        <div class="mt-2 text-xs text-gray-500">
            Duration: {{ formatDuration(lesson.start, lesson.end) }}
        </div>
    </div>
</template>
