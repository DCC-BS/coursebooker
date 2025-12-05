<script lang="ts" setup>
import { motion } from "motion-v";

const route = useRoute();
const sessionId = route.params.sessionId as string;

if (!sessionId) {
    throw new Error("Session ID is required");
}

const { t } = useI18n();

// Extract courseId from query parameter or route
const courseId = computed(() => route.params.courseId as string);

if (!courseId.value) {
    throw new Error("Course ID is required");
}

const {
    session,
    isPending: isSessionPending,
    error: sessionError,
} = useSession(courseId.value, sessionId);

const {
    course,
    isPending: isCoursePending,
    error: courseError,
} = useCourse(courseId.value);

const {
    me,
    isPending: isMePending,
    error: meError,
    refresh: refreshMe,
} = useMe();

const isPending = computed(
    () => isSessionPending.value || isCoursePending.value || isMePending.value,
);
const error = computed(
    () => sessionError.value ?? courseError.value ?? meError.value,
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

    <!-- Session Content -->
    <div v-else-if="session && course && me" class="container mx-auto px-4 py-6 max-w-7xl">
      <!-- Compact Header -->
      <motion.div :initial="{ opacity: 0, y: -20 }" :animate="{ opacity: 1, y: 0 }"
        class="bg-white rounded-xl shadow-md border border-gray-100 mb-6 p-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <UBadge :color="course.type === 'course' ? 'primary' : 'secondary'" size="sm">
                <UIcon name="i-lucide-graduation-cap" class="h-3 w-3 mr-1" />
                {{ t(`courseDetails.${course.type}`) }}
              </UBadge>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold mb-2 leading-tight">
              {{ course.title }}
            </h1>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-user" class="h-4 w-4" />
                <span>{{ course.organizer_name }}</span>
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-mail" class="h-4 w-4" />
                <a :href="`mailto:${course.organizer_mail}`"
                  class="text-blue-600 hover:text-blue-700 transition-colors">
                  {{ course.organizer_mail }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Session Details -->
          <motion.div :initial="{ opacity: 0, y: -20 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.1 }"
            class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <h2 class="text-xl font-bold text-gray-900 flex items-center">
                <UIcon name="i-lucide-calendar-days" class="h-5 w-5 mr-2 text-blue-600" />
                {{ t('courseDetails.sessionDetails') }}
              </h2>
            </div>
            <div class="p-6">
              <SessionView :course="course" :index="0" :session="session" :user="me" :refresh-user="refreshMe" />
            </div>
          </motion.div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <!-- Quick Actions -->
          <motion.div :initial="{ opacity: 0, y: -20 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.1 }"
            class="sticky top-2 bg-white rounded-xl shadow-md border border-gray-100">
            <div class="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <h3 class="text-base font-bold text-gray-900 flex items-center">
                <UIcon name="i-lucide-zap" class="h-4 w-4 mr-2 text-purple-600" />
                {{ t('courseDetails.quickActions') }}
              </h3>
            </div>
            <div class="p-4 space-y-2">
              <UButton :href="`mailto:${course.organizer_mail}?subject=Question about ${course.title}`" color="neutral"
                variant="soft" block size="md" class="justify-center">
                <UIcon name="i-lucide-mail" class="h-4 w-4 mr-2" />
                {{ t('courseDetails.contactOrganizer') }}
              </UButton>
              <UButton :to="`/courses/${course.id}`" color="neutral" variant="ghost" block size="md"
                class="justify-center">
                <UIcon name="i-lucide-arrow-left" class="h-4 w-4 mr-2" />
                {{ t('courseDetails.backToCourse') }}
              </UButton>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
</template>