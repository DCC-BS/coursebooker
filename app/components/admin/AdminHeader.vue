<script setup>
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
});

const { t } = useI18n();

const router = useRouter();
</script>

<template>
    <div class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-6">
                <div class="flex items-center space-x-4">
                    <NuxtLink @click="router.back()" class="text-primary-600 hover:text-primary-700 transition-colors">
                        <UIcon name="i-lucide-arrow-left" class="h-5 w-5" />
                    </NuxtLink>
                    <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <UButton to="/" color="gray" variant="ghost" icon="i-lucide-eye">
                        {{ t("admin.components.header.viewSite") }}
                    </UButton>
                    <UButton to="/admin" color="gray" icon="i-lucide-house">
                        {{ t("admin.components.header.dashboard") }}
                    </UButton>
                </div>
            </div>
        </div>
    </div>
</template>
