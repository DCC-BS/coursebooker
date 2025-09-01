<script lang="ts" setup>
const props = defineProps<{
    text: string;
}>();
</script>

<template>
    <div class="flex flex-col items-center justify-center py-16">
        <UIcon name="i-lucide-loader-circle" class="animate-spin w-12 h-12 text-blue-500 mb-4" />
        <p class="text-lg text-gray-600">{{ props.text }}</p>
    </div>
</template>