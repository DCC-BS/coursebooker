<script setup lang="ts">
import type { Course } from "~~/shared/models";

// Set page meta
definePageMeta({
    layout: false,
    title: 'Admin Dashboard'
});

// Fetch statistics
const courses = await $fetch<Course[]>('/api/courses');

useHead({
    title: 'Admin Dashboard - CourseBooker'
});
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <div class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-6">
                    <div class="flex items-center">
                        <h1 class="text-3xl font-bold text-gray-900">CourseBooker Admin</h1>
                    </div>
                    <div class="flex space-x-4">
                        <UButton to="/admin/courses" color="primary" size="lg" icon="i-heroicons-academic-cap">
                            Manage Courses
                        </UButton>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Courses Card -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <UIcon name="i-heroicons-academic-cap" class="h-6 w-6 text-gray-400" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        Total Courses
                                    </dt>
                                    <dd class="text-lg font-medium text-gray-900">
                                        {{ courses.length || 0 }}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-5 py-3">
                        <div class="text-sm">
                            <NuxtLink to="/admin/courses" class="font-medium text-cyan-700 hover:text-cyan-900">
                                View all courses
                            </NuxtLink>
                        </div>
                    </div>
                </div>

                <!-- Sessions Card -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <UIcon name="i-heroicons-calendar-days" class="h-6 w-6 text-gray-400" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        Total Sessions
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
                                Across all courses
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Lessons Card -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <UIcon name="i-heroicons-clock" class="h-6 w-6 text-gray-400" />
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">
                                        Total Lessons
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
                                Scheduled lessons
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="mt-12">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-6">
                            <div class="flex items-center">
                                <UIcon name="i-heroicons-plus-circle" class="h-8 w-8 text-primary-500" />
                                <div class="ml-4">
                                    <h3 class="text-lg font-medium text-gray-900">Create New Course</h3>
                                    <p class="text-sm text-gray-500">Add a new course with sessions and lessons</p>
                                </div>
                            </div>
                            <div class="mt-4">
                                <UButton to="/admin/courses/create" color="primary" block>
                                    Create Course
                                </UButton>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-6">
                            <div class="flex items-center">
                                <UIcon name="i-heroicons-document-text" class="h-8 w-8 text-primary-500" />
                                <div class="ml-4">
                                    <h3 class="text-lg font-medium text-gray-900">Manage Existing</h3>
                                    <p class="text-sm text-gray-500">Edit or delete existing courses</p>
                                </div>
                            </div>
                            <div class="mt-4">
                                <UButton to="/admin/courses" color="neutral" block>
                                    View All Courses
                                </UButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
