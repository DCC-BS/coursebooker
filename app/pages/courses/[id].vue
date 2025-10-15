<script lang="ts" setup>
import { motion } from "motion-v";

const route = useRoute();
const courseId = route.params.id as string;

if (!courseId) {
    throw new Error("Course ID is required");
}

const { t } = useI18n();
const {
    course,
    isPending: isCoursePending,
    error: courseError,
} = useCourse(courseId);
const {
    me,
    isPending: isMePending,
    error: meError,
    refresh: refreshMe,
} = useMe();

const isPending = computed(() => isCoursePending.value || isMePending.value);
const error = computed(() => courseError.value ?? meError.value);

watch(
    course,
    () => {
        if (!course.value) return null;

        filterUpcomingSessions(course.value);
    },
    { immediate: true },
);
</script>

<template>
    <div class="min-h-screen">
        <!-- Loading State -->
        <div v-if="isPending" class="flex items-center justify-center min-h-screen">
            <LoadingView :text="t('courseDetails.loadingCourseDetails')" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex items-center justify-center min-h-screen">
            <ErrorView :message="error" />
        </div>

        <!-- Course Content -->
        <div v-else-if="course && me" class="container mx-auto px-4 py-8 max-w-7xl">
            <!-- Hero Section -->
            <motion.div :initial="{ opacity: 0, y: -50 }" :animate="{ opacity: 1, y: 0 }"
                class="relative overflow-hidden bg-purple-50 rounded-3xl shadow-2xl mb-8">
                <!-- <div class="absolute inset-0 bg-black opacity-10"></div> -->
                <div class="relative px-8 py-12 md:px-12 md:py-16">
                    <div class="flex flex-col md:flex-row items-start justify-between">
                        <div class="flex-1 mb-6 md:mb-0">
                            <div class="flex items-center gap-3 mb-4">
                                <UBadge :color="course.type === 'course' ? 'primary' : 'secondary'" size="lg"
                                    class="px-4 py-2 text-sm font-semibold">
                                    <UIcon name="i-lucide-graduation-cap" class="h-4 w-4 mr-2" />
                                    {{ t(`courseDetails.${course.type}`) }}
                                </UBadge>
                            </div>
                            <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                                {{ course.title }}
                            </h1>
                            <p class="text-xl text-gray-700 leading-relaxed max-w-3xl">
                                <MDC :value="course.description"></MDC>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Main Content -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Course Details Card -->
                    <motion.div :initial="{ opacity: 0, y: -50 }" :animate="{ opacity: 1, y: 0 }"
                        :transition="{ delay: 0.1 }"
                        class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div class="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <h2 class="text-2xl font-bold text-gray-900 flex items-center">
                                <UIcon name="i-lucide-info" class="h-6 w-6 mr-3 text-blue-600" />
                                {{ t('courseDetails.courseInformation') }}
                            </h2>
                        </div>
                        <div class="p-8">
                            <div class="space-y-6">
                                <div class="flex items-center">
                                    <UIcon name="i-lucide-user" class="h-5 w-5 text-gray-400 mr-4" />
                                    <div>
                                        <div class="text-sm text-gray-500">{{ t('courseDetails.organizer') }}</div>
                                        <div class="font-semibold text-gray-900">{{ course.organizer_name }}</div>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    <UIcon name="i-lucide-mail" class="h-5 w-5 text-gray-400 mr-4" />
                                    <div>
                                        <div class="text-sm text-gray-500">{{ t('courseDetails.contact') }}</div>
                                        <a :href="`mailto:${course.organizer_mail}`"
                                            class="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                            {{ course.organizer_mail }}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <!-- Sessions Overview -->
                    <motion.div :initial="{ opacity: 0, y: -50 }" :animate="{ opacity: 1, y: 0 }"
                        :transition="{ delay: 0.2 }"
                        class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div class="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <h2 class="text-2xl font-bold text-gray-900 flex items-center">
                                <UIcon name="i-lucide-calendar-days" class="h-6 w-6 mr-3 text-green-600" />
                                {{ t('courseDetails.upcomingCourseSessions') }}
                            </h2>
                        </div>
                        <div class="p-8">
                            <div v-if="course.sessions.length === 0" class="text-center py-12">
                                <UIcon name="i-lucide-calendar-x" class="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p class="text-gray-500">{{ t('courseDetails.noSessionsScheduled') }}</p>
                            </div>
                            <div v-else class="space-y-6">
                                <div v-for="(session, index) in course.sessions" :key="session.id"
                                    class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                    <SessionView :course="course" :index="index" :session="session"
                                        :courseId="course.id" :user="me" :refresh-user="refreshMe" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-8">
                    <!-- Quick Actions -->
                    <motion.div :initial="{ opacity: 0, y: -50 }" :animate="{ opacity: 1, y: 0 }"
                        :transition="{ delay: 0.1 }"
                        class="sticky top-2 bg-white rounded-2xl shadow-lg border border-gray-100">
                        <div
                            class="px-6 py-4 rounded-t-2xl bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                            <h3 class="text-lg font-bold text-gray-900 flex items-center">
                                <UIcon name="i-lucide-zap" class="h-5 w-5 mr-2 text-purple-600" />
                                {{ t('courseDetails.quickActions') }}
                            </h3>
                        </div>
                        <div class="p-6 space-y-3">
                            <UButton :href="`mailto:${course.organizer_mail}?subject=Question about ${course.title}`"
                                color="neutral" variant="soft" block size="lg" class="justify-center">
                                <UIcon name="i-lucide-mail" class="h-4 w-4 mr-2" />
                                {{ t('courseDetails.contactOrganizer') }}
                            </UButton>
                            <UButton @click="$router.go(-1)" color="neutral" variant="ghost" block size="lg"
                                class="justify-center">
                                <UIcon name="i-lucide-arrow-left" class="h-4 w-4 mr-2" />
                                {{ t('courseDetails.backToCourses') }}
                            </UButton>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    </div>
</template>