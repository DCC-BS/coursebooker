<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import type { Course } from '~/../shared/models/courses.model';

interface Props {
    course: Course;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
    edit: [course: Course];
    delete: [course: Course];
}>();

// Computed values
const totalLessons = computed(() => {
    return props.course.sessions.reduce((total, session) => {
        return total + session.lessons.length;
    }, 0);
});

// Dropdown actions
const actions = [[
    {
        label: 'Edit Course',
        icon: 'i-heroicons-pencil-square',
        click: () => emit('edit', props.course)
    },
    {
        label: 'Manage Sessions',
        icon: 'i-heroicons-calendar-days',
        to: `/admin/courses/${props.course.id}/sessions`
    },
    {
        label: 'Duplicate Course',
        icon: 'i-heroicons-document-duplicate',
        click: () => {
            // TODO: Implement duplicate functionality
        }
    },
    {
        label: 'Delete Course',
        icon: 'i-heroicons-trash',
        click: () => emit('delete', props.course)
    }]
] as DropdownMenuItem[][];
</script>

<template>
    <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
        <div class="p-6">
            <!-- Course Header -->
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <UBadge :color="course.type === 'course' ? 'primary' : 'secondary'" size="sm">
                            {{ course.type.toUpperCase() ?? '' + course.type.slice(1) }}
                        </UBadge>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        {{ course.title }}
                    </h3>
                    <p class="text-sm text-gray-600 line-clamp-2">
                        {{ course.description }}
                    </p>
                </div>

                <!-- Actions Dropdown -->
                <UDropdownMenu :items="actions">
                    <UButton color="neutral" variant="ghost" icon="i-lucide-ellipsis-vertical" size="sm" />
                </UDropdownMenu>
            </div>

            <!-- Course Details -->
            <div class="space-y-2 mb-4">
                <div class="flex items-center text-sm text-gray-600">
                    <UIcon name="i-lucide-user" class="h-4 w-4 mr-2" />
                    {{ course.organizer_name }}
                </div>
                <div class="flex items-center text-sm text-gray-600">
                    <UIcon name="i-lucide-mail" class="h-4 w-4 mr-2" />
                    {{ course.organizer_mail }}
                </div>
                <div v-if="course.teams_link" class="flex items-center text-sm text-gray-600">
                    <UIcon name="i-lucide-video" class="h-4 w-4 mr-2" />
                    Teams Link Available
                </div>
            </div>

            <!-- Statistics -->
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div class="text-center">
                    <div class="text-2xl font-bold text-primary-600">
                        {{ course.sessions.length }}
                    </div>
                    <div class="text-xs text-gray-500">
                        {{ course.sessions.length === 1 ? 'Session' : 'Sessions' }}
                    </div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-primary-600">
                        {{ totalLessons }}
                    </div>
                    <div class="text-xs text-gray-500">
                        {{ totalLessons === 1 ? 'Lesson' : 'Lessons' }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions Footer -->
        <div class="bg-gray-50 px-6 py-3 flex justify-between items-center rounded-b-lg">
            <div class="flex space-x-2">
                <UButton size="xs" color="gray" variant="ghost" @click="$emit('edit', course)">
                    Edit
                </UButton>
                <UButton size="xs" color="primary" variant="ghost" :to="`/admin/courses/${course.id}/sessions`">
                    Sessions
                </UButton>
            </div>
            <div class="text-xs text-gray-500">
                ID: {{ course.id.slice(0, 8) }}...
            </div>
        </div>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
