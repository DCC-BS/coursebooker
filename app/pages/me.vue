<script lang="ts" setup>
import { add, nextMonday, set } from "date-fns";
import { AnimatePresence, motion } from "motion-v";

const { t } = useI18n();
const { me, error, isPending, refresh } = useMe();
const { courses } = useCourses(false, true);

// Helper function to get course by ID
const getCourse = (courseId: string) => {
    return courses.value?.find((course) => course.id === courseId);
};

// Helper function to calculate time until session starts
const getTimeUntilSession = (session: { lessons: { start: Date }[] }) => {
    if (!session.lessons || session.lessons.length === 0) return null;

    const firstLesson = session.lessons[0];
    if (!firstLesson) return null;

    const sessionStart = new Date(firstLesson.start);
    const now = new Date();
    const diffMs = sessionStart.getTime() - now.getTime();

    if (diffMs <= 0) return t("me.startingNow");

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
        return t("me.inDays", diffDays);
    }
    if (diffHours > 0) {
        return t("me.inHours", diffHours);
    }
    if (diffMinutes > 0) {
        return t("me.inMinutes", diffMinutes);
    }
    return t("me.startingSoon");
};

const upcomingSessions = computed(() => {
    const sessions =
        me.value?.registrations
            .map((r) => r.session)
            .filter((s) => s.lessons.length > 0)
            .filter((s) => new Date(s.lessons[0]?.end ?? -1) >= new Date())
            .sort(
                (a, b) =>
                    new Date(a.lessons[0]?.start ?? -1).getTime() -
                    new Date(b.lessons[0]?.start ?? -1).getTime(),
            ) || [];

    const sessionsThisWeek = [];
    const otherSessions = [];

    for (const session of sessions) {
        const start = new Date(session.lessons[0]?.start ?? -1);
        const now = new Date();
        const monday = set(nextMonday(now), {
            hours: 0,
            minutes: 0,
            seconds: 0,
        }); // next Monday 00:00

        console.log(monday);

        // is upcoming and in this week
        if (start <= monday) {
            sessionsThisWeek.push(session);
        } else {
            otherSessions.push(session);
        }
    }

    return { sessionsThisWeek, otherSessions };
});
</script>

<template>
    <div class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <!-- Header -->
        <motion.div :initial="{ opacity: 0, y: -50 }" :animate="{ opacity: 1, y: 0 }" class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="text-center">
                    <h1 class="text-4xl font-bold text-gray-900 mb-2">
                        {{ t('me.dashboard') }}
                    </h1>
                    <p class="text-lg text-gray-600">
                        {{ t('me.welcomeBack') }}
                    </p>
                    <div v-if="me"
                        class="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                        <UIcon name="i-lucide-user" class="w-4 h-4 mr-2" />
                        {{ me.email }}
                    </div>
                </div>
            </div>
        </motion.div>

        <!-- Loading State -->
        <motion.div v-if="isPending" :initial="{ opacity: 0 }" :animate="{ opacity: 1 }"
            class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <LoadingView :text="t('me.loadingSessions')" />
        </motion.div>

        <!-- Error State -->
        <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p class="text-red-800">{{ error }}</p>
            </div>
        </div>

        <!-- Main Content -->
        <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- This Week Section -->
            <motion.div :initial="{ opacity: 0, y: 30 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.2 }"
                class="mb-8">
                <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <UIcon name="i-lucide-calendar-clock" class="w-6 h-6 text-blue-600" />
                            {{ t('me.thisWeek') }}
                        </h2>
                        <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            {{ upcomingSessions.sessionsThisWeek.length }} {{ upcomingSessions.sessionsThisWeek.length
                                === 1 ? t('me.session') : t('me.sessions') }}
                        </span>
                    </div>

                    <div v-if="upcomingSessions.sessionsThisWeek.length === 0"
                        class="text-center py-12 bg-gray-50 rounded-lg">
                        <UIcon name="i-lucide-calendar-x" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('me.noSessionsThisWeek') }}</h3>
                        <p class="text-gray-600">{{ t('me.noSessionsThisWeekMessage') }}</p>
                        <UButton :to="'/'" variant="outline" class="mt-4">
                            <UIcon name="i-lucide-search" class="w-4 h-4 mr-2" />
                            {{ t('me.browseCourses') }}
                        </UButton>
                    </div>

                    <div v-else class="space-y-4">
                        <AnimatePresence>
                            <motion.div v-for="(session, i) in upcomingSessions.sessionsThisWeek" :key="session.id"
                                :initial="{ opacity: 0, x: -50 }" :animate="{
                                    opacity: 1,
                                    x: 0,
                                    transition: { duration: 0.4, delay: 0.1 * i }
                                }" :hover="{ x: 4, transition: { duration: 0.2 } }"
                                class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 hover:shadow-md transition-shadow duration-200">

                                <!-- Course Info Header -->
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-1">
                                        <h3 class="text-lg font-bold text-gray-900 mb-1">
                                            {{ getCourse(session.courseId)?.title || t('me.unknownCourse') }}
                                        </h3>
                                        <p class="text-sm text-gray-600 line-clamp-2">
                                            {{ getCourse(session.courseId)?.description || '' }}
                                        </p>
                                    </div>
                                    <UBadge
                                        :color="getCourse(session.courseId)?.type === 'course' ? 'primary' : 'secondary'"
                                        size="sm">
                                        {{ getCourse(session.courseId)?.type || 'course' }}
                                    </UBadge>
                                </div>

                                <!-- Time Until Start -->
                                <div class="mb-4 p-3 bg-blue-100 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <UIcon name="i-lucide-clock" class="w-4 h-4 text-blue-600" />
                                        <span class="text-sm font-medium text-blue-800">
                                            {{ getTimeUntilSession(session) }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Session Details -->
                                <div class="space-y-3">
                                    <div class="flex items-center gap-2 text-sm text-gray-600">
                                        <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                                        <span>{{ getSessionDate(session as any) }}</span>
                                    </div>
                                    <div class="flex items-center gap-2 text-sm text-gray-600">
                                        <UIcon name="i-lucide-clock" class="w-4 h-4" />
                                        <span>{{ getSessionDuration(session as any) }}</span>
                                    </div>
                                    <div v-if="session.location" class="flex items-center gap-2 text-sm text-gray-600">
                                        <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                                        <span>{{ session.location }}</span>
                                    </div>
                                    <div v-if="session.teams_link"
                                        class="flex items-center gap-2 text-sm text-gray-600">
                                        <UIcon name="i-lucide-video" class="w-4 h-4" />
                                        <a :href="session.teams_link" target="_blank"
                                            class="text-blue-600 hover:text-blue-800 hover:underline">
                                            {{ t('me.joinTeamsMeeting') }}
                                        </a>
                                    </div>
                                </div>

                                <!-- View Course Button -->
                                <div class="mt-4 pt-4 border-t border-blue-200">
                                    <UButton :to="`/courses/${session.courseId}`" variant="outline" size="sm"
                                        class="w-full">
                                        <UIcon name="i-lucide-external-link" class="w-4 h-4 mr-2" />
                                        {{ t('home.viewCourseDetails') }}
                                    </UButton>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <!-- Later Section -->
            <motion.div :initial="{ opacity: 0, y: 30 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.4 }"
                class="mb-8">
                <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <UIcon name="i-lucide-calendar" class="w-6 h-6 text-purple-600" />
                            {{ t('me.upcomingSessions') }}
                        </h2>
                        <span class="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                            {{ t('me.sessionsCount', { count: upcomingSessions.otherSessions.length }) }}
                        </span>
                    </div>

                    <div v-if="upcomingSessions.otherSessions.length === 0"
                        class="text-center py-12 bg-gray-50 rounded-lg">
                        <UIcon name="i-lucide-calendar-check" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('me.noUpcomingSessions') }}</h3>
                        <p class="text-gray-600">{{ t('me.allSetForNearFuture') }}</p>
                    </div>

                    <div v-else class="space-y-4">
                        <AnimatePresence>
                            <motion.div v-for="(session, i) in upcomingSessions.otherSessions" :key="session.id"
                                :initial="{ opacity: 0, x: -50 }" :animate="{
                                    opacity: 1,
                                    x: 0,
                                    transition: { duration: 0.4, delay: 0.1 * i }
                                }" :hover="{ x: 4, transition: { duration: 0.2 } }"
                                class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200 hover:shadow-md transition-shadow duration-200">

                                <!-- Course Info Header -->
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-1">
                                        <h3 class="text-lg font-bold text-gray-900 mb-1">
                                            {{ getCourse(session.courseId)?.title || t('me.unknownCourse') }}
                                        </h3>
                                        <p class="text-sm text-gray-600 line-clamp-2">
                                            {{ getCourse(session.courseId)?.description || '' }}
                                        </p>
                                    </div>
                                    <UBadge
                                        :color="getCourse(session.courseId)?.type === 'course' ? 'primary' : 'secondary'"
                                        size="sm">
                                        {{ getCourse(session.courseId)?.type || 'course' }}
                                    </UBadge>
                                </div>

                                <!-- Time Until Start -->
                                <div class="mb-4 p-3 bg-purple-100 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <UIcon name="i-lucide-clock" class="w-4 h-4 text-purple-600" />
                                        <span class="text-sm font-medium text-purple-800">
                                            {{ getTimeUntilSession(session) }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Session Details -->
                                <div class="space-y-3">
                                    <div class="flex items-center gap-2 text-sm text-gray-600">
                                        <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                                        <span>{{ getSessionDate(session as any) }}</span>
                                    </div>
                                    <div class="flex items-center gap-2 text-sm text-gray-600">
                                        <UIcon name="i-lucide-clock" class="w-4 h-4" />
                                        <span>{{ getSessionDuration(session as any) }}</span>
                                    </div>
                                    <div v-if="session.location" class="flex items-center gap-2 text-sm text-gray-600">
                                        <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                                        <span>{{ session.location }}</span>
                                    </div>
                                    <div v-if="session.teams_link"
                                        class="flex items-center gap-2 text-sm text-gray-600">
                                        <UIcon name="i-lucide-video" class="w-4 h-4" />
                                        <a :href="session.teams_link" target="_blank"
                                            class="text-blue-600 hover:text-blue-800 hover:underline">
                                            {{ t('me.joinTeamsMeeting') }}
                                        </a>
                                    </div>
                                </div>

                                <!-- View Course Button -->
                                <div class="mt-4 pt-4 border-t border-purple-200">
                                    <UButton :to="`/courses/${session.courseId}`" variant="outline" size="sm"
                                        class="w-full">
                                        <UIcon name="i-lucide-external-link" class="w-4 h-4 mr-2" />
                                        {{ t('home.viewCourseDetails') }}
                                    </UButton>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <!-- Quick Actions -->
            <motion.div :initial="{ opacity: 0, y: 30 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.6 }">
                <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <UIcon name="i-lucide-zap" class="w-5 h-5 text-yellow-500" />
                        {{ t('me.quickActions') }}
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <UButton :to="'/'" variant="outline" size="lg" class="justify-start">
                            <UIcon name="i-lucide-search" class="w-5 h-5 mr-3" />
                            {{ t('me.browseAllCourses') }}
                        </UButton>
                        <UButton @click="refresh" variant="outline" size="lg" class="justify-start">
                            <UIcon name="i-lucide-refresh-cw" class="w-5 h-5 mr-3" />
                            {{ t('me.refreshSessions') }}
                        </UButton>
                    </div>
                </div>
            </motion.div>
        </div>
    </div>
</template>