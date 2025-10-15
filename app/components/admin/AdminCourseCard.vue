<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { Course, Session } from "~~/shared/models";

interface Props {
    course: Course;
}

const props = defineProps<Props>();
const { t } = useI18n();

// Emits
const emit = defineEmits<{
    edit: [course: Course];
    delete: [course: Course];
    duplicate: [course: Course];
}>();

function distanceToNow(session: Session) {
    const start = session?.lessons[0]?.start;
    if (!start) return 0;

    const now = Date.now();
    return start.getTime() - now;
}

function getNextSession(course: Course) {
    const sessions = course.sessions.sort((a, b) => {
        return distanceToNow(a) - distanceToNow(b);
    });

    let nextSession = undefined as Session | undefined;

    for (const session of sessions) {
        nextSession = session;
        if (distanceToNow(session) > 0) {
            break;
        }
    }

    const start = nextSession?.lessons[0]?.start;
    if (!start) return "N/A";

    const now = Date.now();
    const diff = now - start.getTime();

    const minutes = Math.abs(Math.floor(diff / 1000 / 60));
    const hours = Math.abs(Math.floor(minutes / 60));
    const timeStr = `${hours} hour${hours === 1 ? "" : "s"} ${minutes % 60} minute${minutes % 60 === 1 ? "" : "s"}`;

    if (diff < 0) {
        return t("admin.courseCard.nextStartsIn", { time: timeStr });
    }

    return t("admin.courseCard.lastStartedAgo", { time: timeStr });
}

// Computed values
const totalRegistrations = computed(() => {
    return props.course.sessions.reduce((total, session) => {
        return total + (session.registrations?.length ?? 0);
    }, 0);
});

// Dropdown actions
const actions = computed(() => [
    [
        {
            label: t("admin.courseCard.editCourse"),
            icon: "i-lucide-square-pen",
            onSelect: () => emit("edit", props.course),
        },
        {
            label: t("admin.courseCard.manageSessions"),
            icon: "i-lucide-calendar-days",
            to: `/admin/courses/${props.course.id}/sessions`,
        },
        {
            label: t("admin.courseCard.duplicateCourse"),
            icon: "i-lucide-copy",
            onSelect: () => emit("duplicate", props.course),
        },
        {
            label: t("admin.courseCard.deleteCourse"),
            icon: "i-lucide-trash-2",
            onSelect: () => emit("delete", props.course),
        },
    ],
] as DropdownMenuItem[][]);
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

                        <span>{{ getNextSession(course) }}</span>
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
                    {{ t("admin.courseCard.teamsLinkAvailable") }}
                </div>
            </div>

            <!-- Statistics -->
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div class="text-center">
                    <div class="text-2xl font-bold text-primary-600">
                        {{ course.sessions.length }}
                    </div>
                    <div class="text-xs text-gray-500">
                        {{ course.sessions.length === 1 ? t("admin.course.sessions") : t("admin.course.sessions") }}
                    </div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-primary-600">
                        {{ totalRegistrations }}
                    </div>
                    <div class="text-xs text-gray-500">
                        {{ totalRegistrations === 1 ? t("admin.session.registrations", { count: 1 }) :
                            t("admin.session.registrations", { count: totalRegistrations }) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions Footer -->
        <div class="bg-gray-50 px-6 py-3 flex justify-between items-center rounded-b-lg">
            <div class="flex space-x-2">
                <UButton size="xs" color="neutral" variant="ghost" @click="$emit('edit', course)">
                    {{ t("admin.courseCard.edit") }}
                </UButton>
                <UButton size="xs" color="primary" variant="ghost" :to="`/admin/courses/${course.id}/sessions`">
                    {{ t("admin.courseCard.sessions") }}
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
