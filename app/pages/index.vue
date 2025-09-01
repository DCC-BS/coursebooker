<script setup lang="ts">

const { data: courses, pending } = useFetch('/api/courses');


</script>

<template>
    <h1>Welcome to CourseBooker</h1>

    <div v-if="pending">
        <div>Loading courses...</div>
        <div>
            <UIcon name="i-lucide-loader-circle" class="animate-spin" />
        </div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="course in courses" :key="course.id">
            <div class="text-lg font-semibold">{{ course.title }}</div>
        </div>
    </div>
</template>