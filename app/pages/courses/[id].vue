<script lang="ts" setup>
const route = useRoute();
const courseId = route.params.id as string;

if (!courseId) {
    throw new Error("Course ID is required");
}

const { course, isPending: isCoursePending, error: courseError } = useCourse(courseId);
const { me, isPending: isMePending, error: meError, refresh: refreshMe } = useMe();

const isPending = computed(() => isCoursePending.value || isMePending.value);
const error = computed(() => courseError.value ?? meError.value);

// Computed values
const totalLessons = computed(() => {
    if (!course.value) return 0;
    return course.value.sessions.reduce((total, session) => {
        return total + session.lessons.length;
    }, 0);
});

const upcomingLessons = computed(() => {
    if (!course.value) return [];
    const now = new Date();
    const lessons = course.value.sessions.flatMap((session) =>
        session.lessons.map((lesson) => ({
            ...lesson,
            sessionLocation: session.location,
            sessionTeamsLink: session.teams_link || course.value?.teams_link,
        })),
    );
    return lessons
        .filter((lesson) => new Date(lesson.start) > now)
        .sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
        )
        .slice(0, 3);
});
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <!-- Loading State -->
        <div v-if="isPending" class="flex items-center justify-center min-h-screen">
            <LoadingView :text="'Loading course details...'" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex items-center justify-center min-h-screen">
            <ErrorView :message="error" />
        </div>

        <!-- Course Content -->
        <div v-else-if="course && me" class="container mx-auto px-4 py-8 max-w-7xl">
            <!-- Hero Section -->
            <div
                class="relative overflow-hidden bg-gradient-to-r from-blue-400 to-cyan-600 rounded-3xl shadow-2xl mb-8">
                <div class="absolute inset-0 bg-black opacity-10"></div>
                <div class="relative px-8 py-12 md:px-12 md:py-16">
                    <div class="flex flex-col md:flex-row items-start justify-between">
                        <div class="flex-1 mb-6 md:mb-0">
                            <div class="flex items-center gap-3 mb-4">
                                <UBadge :color="course.type === 'course' ? 'primary' : 'secondary'" size="lg"
                                    class="px-4 py-2 text-sm font-semibold">
                                    <UIcon name="i-lucide-graduation-cap" class="h-4 w-4 mr-2" />
                                    {{ course.type.charAt(0).toUpperCase() + course.type.slice(1) }}
                                </UBadge>
                            </div>
                            <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                {{ course.title }}
                            </h1>
                            <p class="text-xl text-blue-100 leading-relaxed max-w-3xl">
                                <MDC :value="course.description"></MDC>
                            </p>
                        </div>

                        <!-- Stats Cards -->
                        <div class="flex flex-col md:flex-row gap-4 md:gap-6">
                            <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center min-w-[120px]">
                                <div class="text-3xl font-bold text-white">{{ course.sessions.length }}</div>
                                <div class="text-blue-200 text-sm font-medium">
                                    {{ course.sessions.length === 1 ? 'Session' : 'Sessions' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Main Content -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Course Details Card -->
                    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div class="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <h2 class="text-2xl font-bold text-gray-900 flex items-center">
                                <UIcon name="i-lucide-info" class="h-6 w-6 mr-3 text-blue-600" />
                                Course Information
                            </h2>
                        </div>
                        <div class="p-8">
                            <div class="space-y-6">
                                <div class="flex items-center">
                                    <UIcon name="i-lucide-user" class="h-5 w-5 text-gray-400 mr-4" />
                                    <div>
                                        <div class="text-sm text-gray-500">Organizer</div>
                                        <div class="font-semibold text-gray-900">{{ course.organizer_name }}</div>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    <UIcon name="i-lucide-mail" class="h-5 w-5 text-gray-400 mr-4" />
                                    <div>
                                        <div class="text-sm text-gray-500">Contact</div>
                                        <a :href="`mailto:${course.organizer_mail}`"
                                            class="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                            {{ course.organizer_mail }}
                                        </a>
                                    </div>
                                </div>
                                <div v-if="course.teams_link" class="flex items-start">
                                    <UIcon name="i-lucide-video" class="h-5 w-5 text-gray-400 mr-4 mt-1" />
                                    <div>
                                        <div class="text-sm text-gray-500">Teams Meeting</div>
                                        <a :href="course.teams_link" target="_blank"
                                            class="inline-flex items-center font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                            Join Meeting
                                            <UIcon name="i-lucide-external-link" class="h-4 w-4 ml-1" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sessions Overview -->
                    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div class="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <h2 class="text-2xl font-bold text-gray-900 flex items-center">
                                <UIcon name="i-lucide-calendar-days" class="h-6 w-6 mr-3 text-green-600" />
                                Course Sessions
                            </h2>
                        </div>
                        <div class="p-8">
                            <div v-if="course.sessions.length === 0" class="text-center py-12">
                                <UIcon name="i-lucide-calendar-x" class="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p class="text-gray-500">No sessions scheduled yet.</p>
                            </div>
                            <div v-else class="space-y-6">
                                <div v-for="(session, index) in course.sessions" :key="session.id"
                                    class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                    <SessionView :index="index" :session="session" :courseId="course.id" :user="me"
                                        :refresh-user="refreshMe" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-8">
                    <!-- Upcoming Lessons -->
                    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div class="px-6 py-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-100">
                            <h3 class="text-lg font-bold text-gray-900 flex items-center">
                                <UIcon name="i-lucide-clock" class="h-5 w-5 mr-2 text-orange-600" />
                                Upcoming Lessons
                            </h3>
                        </div>
                        <div class="p-6">
                            <div v-if="upcomingLessons.length === 0" class="text-center py-8">
                                <UIcon name="i-lucide-calendar-check" class="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                <p class="text-gray-500 text-sm">No upcoming lessons</p>
                            </div>
                            <div v-else class="space-y-4">
                                <div v-for="lesson in upcomingLessons" :key="lesson.id"
                                    class="p-4 border border-orange-100 rounded-xl bg-orange-50/50">
                                    <div class="text-sm font-semibold text-gray-900 mb-1">
                                        {{ formatDate(lesson.start).split(',')[0] }}
                                    </div>
                                    <div class="text-xs text-gray-600 mb-2">
                                        {{ formatTime(lesson.start) }} - {{ formatTime(lesson.end) }}
                                    </div>
                                    <div v-if="lesson.sessionLocation" class="flex items-center text-xs text-gray-500">
                                        <UIcon name="i-lucide-map-pin" class="h-3 w-3 mr-1" />
                                        {{ lesson.sessionLocation }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div class="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                            <h3 class="text-lg font-bold text-gray-900 flex items-center">
                                <UIcon name="i-lucide-zap" class="h-5 w-5 mr-2 text-purple-600" />
                                Quick Actions
                            </h3>
                        </div>
                        <div class="p-6 space-y-3">
                            <UButton v-if="course.teams_link" :to="course.teams_link" external color="primary"
                                variant="soft" block size="lg" class="justify-center">
                                <UIcon name="i-lucide-video" class="h-4 w-4 mr-2" />
                                Join Course Meeting
                            </UButton>
                            <UButton :href="`mailto:${course.organizer_mail}?subject=Question about ${course.title}`"
                                color="neutral" variant="soft" block size="lg" class="justify-center">
                                <UIcon name="i-lucide-mail" class="h-4 w-4 mr-2" />
                                Contact Organizer
                            </UButton>
                            <UButton @click="$router.go(-1)" color="neutral" variant="ghost" block size="lg"
                                class="justify-center">
                                <UIcon name="i-lucide-arrow-left" class="h-4 w-4 mr-2" />
                                Back to Courses
                            </UButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>