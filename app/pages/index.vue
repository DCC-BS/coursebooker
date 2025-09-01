<script setup lang="ts">
import type { Session } from '~~/shared/models';


const { courses, isPending, error } = useCourse();


</script>

<template>
    <h1>Welcome to CourseBooker</h1>

    <div v-if="isPending">
        <div>Loading courses...</div>
        <div>
            <UIcon name="i-lucide-loader-circle" class="animate-spin" />
        </div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <div v-for="course in courses" :key="course.id" class="ring-1 ring-gray-200 p-4 rounded-lg bg-white">
            <div class="text-lg font-semibold">{{ course.title }}</div>
            <div> {{ course.description.length > 100 ? course.description.slice(0, 100) + '...' : course.description }}
            </div>

            <div>Sessions:</div>

            <div v-for="session in course.sessions" :key="session.id" class="mt-2 p-2 border rounded">
                <div class="font-medium">Duration: {{ getSessionDuration(session as Session) }}</div>
                <div class="font-medium">Location: {{ session.location }}</div>
                <div class="font-medium">Date: {{ getSessionDate(session as Session) }}</div>

            </div>

            <UButton :to="`/courses/${course.id}`" variant="solid" class="mt-4 w-full">
                View Course
            </UButton>
        </div>
    </div>
</template>