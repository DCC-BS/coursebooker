<script lang="ts" setup>
import type { FormKitSchemaNode } from "@formkit/core";
import type { Course, Session, User } from "~~/shared/models";

const props = defineProps<{
    index: number;
    session: Session;
    course: Course;
    user: User;
    refreshUser: () => void;
}>();

const { t } = useI18n();
const isRegistered = computed(() =>
    props.user.registrations.some((r) => r.session.id === props.session.id),
);
const { registerForSession, unregisterFromSession } = useSetSession(
    props.course.id,
    props.session.id,
);
const isRegisterFormOpen = ref(false);

const formSchema = computed<FormKitSchemaNode[]>(() => {
    try {
        return JSON.parse(
            props.course.form_schema || "[]",
        ) as FormKitSchemaNode[];
    } catch {
        return [];
    }
});

async function register() {
    console.log(formSchema.value);
    if (formSchema.value.length === 0) {
        await registerForSession(props.user.email);
        props.refreshUser();
        return;
    }

    // Open drawer for form
    isRegisterFormOpen.value = true;
}

async function unregister() {
    await unregisterFromSession(props.user.email);
    props.refreshUser();
}

async function onRegisterSubmit(data: unknown) {
    await registerForSession(props.user.email, JSON.stringify(data, null, 2));
    props.refreshUser();
    isRegisterFormOpen.value = false;
}
</script>

<template>
    <div>
        <div class="flex items-start justify-between mb-4">
            <div class="flex items-center">
                <div
                    class="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                    {{ index + 1 }}
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">{{ course.title }}
                    </h3>
                    <div v-if="session.location" class="flex items-center text-sm text-gray-600 mt-1">
                        <UIcon name="i-lucide-map-pin" class="h-4 w-4 mr-1" />
                        {{ session.location }}
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <UBadge :color="isRegistered ? 'success' : 'neutral'" size="sm">
                    <UIcon :name="isRegistered ? 'i-lucide-check-circle' : 'i-lucide-user-x'" class="h-3 w-3 mr-1" />
                    {{ isRegistered ? t("session.registered") : t("session.notRegistered") }}
                </UBadge>
            </div>
        </div>

        <!-- Session Lessons -->
        <div v-if="session.lessons.length > 0" class="ml-12 space-y-3">
            <div v-for="lesson in session.lessons" :key="lesson.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                    <UIcon name="i-lucide-clock" class="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                        <div class="font-medium text-gray-900">
                            {{ formatDate(lesson.start) }}
                        </div>
                        <div class="text-sm text-gray-600">
                            {{ formatTime(lesson.start) }} - {{ formatTime(lesson.end) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Registration Button -->
        <div class="flex justify-end mt-4">
            <UButton v-if="!isRegistered" @click="() => register()" color="primary" size="lg" icon="i-lucide-user-plus">
                {{ t("session.registerForSession", { type: t(`courseDetails.${course.type}`) }) }}
            </UButton>
            <UButton v-else @click="() => unregister()" color="error" size="sm" icon="i-lucide-user-minus"
                variant="outline">
                {{ t("session.unregister") }}
            </UButton>
        </div>
    </div>
    <UDrawer v-model:open="isRegisterFormOpen">
        <template #content>
            <div class="p-4 flex flex-col items-stretch gap-2 max-w-[400px] w-full m-auto">
                <h2 class="text-xl font-semibold mb-4">{{ props.course.title }}</h2>
                <FormKit type="form" :actions="false" @submit="onRegisterSubmit">
                    <FormKitSchema :schema="formSchema" />
                    <UButton type="submit">{{ t("session.registerForSession", {
                        type: t(`courseDetails.${course.type}`)
                    }) }}</UButton>
                </FormKit>
            </div>
        </template>
    </UDrawer>
</template>
