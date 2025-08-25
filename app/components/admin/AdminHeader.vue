<script setup>
const props = defineProps({
    title: {
        type: String,
        required: true
    }
});
</script>

<template>
    <div class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-6">
                <div class="flex items-center space-x-4">
                    <NuxtLink to="/admin" class="text-primary-600 hover:text-primary-700 transition-colors">
                        <UIcon name="i-heroicons-arrow-left" class="h-5 w-5" />
                    </NuxtLink>
                    <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <UButton to="/" color="gray" variant="ghost" icon="i-heroicons-eye">
                        View Site
                    </UButton>
                    <UButton to="/admin" color="gray" icon="i-heroicons-home">
                        Dashboard
                    </UButton>
                </div>
            </div>
        </div>
    </div>
</template>
