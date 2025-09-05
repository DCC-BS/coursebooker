<script setup lang="ts">
import AdminCourseForm from "~/components/admin/AdminCourseForm.vue";
import AdminHeader from "~/components/admin/AdminHeader.vue";

// Page meta
definePageMeta({
    layout: "admin",
    title: "Create Course",
});

const { t } = useI18n();

useHead({
    title: computed(() => t("admin.course.createCourseTitle")),
});
</script>


<template>
    <div class="min-h-screen bg-gray-50">
        <AdminHeader :title="t('admin.course.createCourse')" />

        <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div class="bg-white shadow rounded-lg">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="text-xl font-semibold text-gray-900">{{ t("admin.course.courseInformation") }}</h2>
                    <p class="text-sm text-gray-600 mt-1">{{ t("admin.course.fillCourseDetails") }}</p>
                </div>

                <AdminCourseForm />
            </div>
        </div>
    </div>
</template>