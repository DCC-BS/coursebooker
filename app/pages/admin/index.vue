<script setup lang="ts">
// Set page meta
definePageMeta({
    layout: "admin",
    title: "Admin Dashboard",
});

const { t } = useI18n();

// Fetch statistics
const { courses, isPending } = useCourses();

useHead({
    title: computed(() => t("admin.dashboard.pageTitle")),
});
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <div class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-6">
                    <div class="flex items-center">
                        <h1 class="text-3xl font-bold text-gray-900">{{ t("admin.dashboard.coursebookerAdmin") }}</h1>
                    </div>
                    <div class="flex space-x-4">
                        <UButton to="/" color="neutral" variant="ghost" icon="i-lucide-eye">
                            {{ t("admin.dashboard.viewSite") }}
                        </UButton>
                        <UButton to="/admin/users" color="primary" size="lg" icon="i-lucide-users">
                            {{ t("admin.users.manageUsers") }}
                        </UButton>
                        <UButton to="/admin/courses" color="primary" size="lg" icon="i-lucide-graduation-cap">
                            {{ t("admin.dashboard.manageCourses") }}
                        </UButton>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isPending || !courses">
            <LoadingView :text="t('admin.dashboard.loadingCourses')" />
        </div>
        <div v-else class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Courses Card -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <UIcon name="i-lucide-graduation-cap" class="h-6 w-6 text-gray-400" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        {{ t("admin.dashboard.totalCourses") }}
                                    </dt>
                                    <dd class="text-lg font-medium text-gray-900">
                                        {{ courses.length ?? 0 }}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-5 py-3">
                        <div class="text-sm">
                            <NuxtLink to="/admin/courses" class="font-medium text-cyan-700 hover:text-cyan-900">
                                {{ t("admin.dashboard.viewAllCourses") }}
                            </NuxtLink>
                        </div>
                    </div>
                </div>

                <!-- Sessions Card -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <UIcon name="i-lucide-calendar-days" class="h-6 w-6 text-gray-400" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        {{ t("admin.dashboard.totalSessions") }}
                                    </dt>
                                    <dd class="text-lg font-medium text-gray-900">
                                        {{courses.reduce((acc, course) => acc + (course.sessions?.length || 0), 0) || 0
                                        }}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-5 py-3">
                        <div class="text-sm">
                            <span class="font-medium text-gray-700">
                                {{ t("admin.dashboard.acrossAllCourses") }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Lessons Card -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <UIcon name="i-lucide-clock" class="h-6 w-6 text-gray-400" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        {{ t("admin.dashboard.totalLessons") }}
                                    </dt>
                                    <dd class="text-lg font-medium text-gray-900">
                                        {{courses.reduce((acc, course) => acc + (course.sessions?.length || 0), 0) || 0
                                        }}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-5 py-3">
                        <div class="text-sm">
                            <span class="font-medium text-gray-700">
                                {{ t("admin.dashboard.scheduledLessons") }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="mt-12">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ t("admin.dashboard.quickActions") }}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-6">
                            <div class="flex items-center">
                                <UIcon name="i-lucide-circle-plus" class="h-8 w-8 text-primary-500" />
                                <div class="ml-4">
                                    <h3 class="text-lg font-medium text-gray-900">{{
                                        t("admin.dashboard.createNewCourse") }}</h3>
                                    <p class="text-sm text-gray-500">{{ t("admin.dashboard.createNewCourseDesc") }}</p>
                                </div>
                            </div>
                            <div class="mt-4">
                                <UButton to="/admin/courses/create" color="primary" block>
                                    {{ t("admin.dashboard.createCourse") }}
                                </UButton>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-6">
                            <div class="flex items-center">
                                <UIcon name="i-lucide-file-text" class="h-8 w-8 text-primary-500" />
                                <div class="ml-4">
                                    <h3 class="text-lg font-medium text-gray-900">{{ t("admin.dashboard.manageExisting")
                                        }}</h3>
                                    <p class="text-sm text-gray-500">{{ t("admin.dashboard.manageExistingDesc") }}</p>
                                </div>
                            </div>
                            <div class="mt-4">
                                <UButton to="/admin/courses" color="neutral" block>
                                    {{ t("admin.dashboard.viewAllCoursesBtn") }}
                                </UButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
