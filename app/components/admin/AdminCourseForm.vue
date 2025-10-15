<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { z } from "zod";
import { type Course, createCourseSchema } from "~/../shared/models";
import FormEditor from "./FormEditor.vue";

const props = defineProps<{
    course?: Course;
    courseId?: string;
    refresh?: () => Promise<void>;
}>();

const { t } = useI18n();
const { showError, showSuccess } = useUserFeedback();
const router = useRouter();

// Form state
const submitting = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);
const schema = createCourseSchema;
type Schema = z.infer<typeof schema>;

// Course type options
const typeOptions = computed(() => [
    { label: t("admin.courseForm.course"), value: "course" },
    { label: t("admin.courseForm.event"), value: "event" },
]);

// Form data - initialize with course data
const form = ref({
    type: "course" as "course" | "event",
    title: "",
    description: "",
    organizer_name: "",
    organizer_mail: "",
    form_schema: "[]",
} as Schema);

watch(
    () => props.course,
    (newCourse) => {
        if (newCourse) {
            form.value = {
                type: newCourse.type,
                title: newCourse.title,
                description: newCourse.description || "",
                organizer_name: newCourse.organizer_name,
                organizer_mail: newCourse.organizer_mail,
                form_schema: newCourse.form_schema || "[]",
            };
        }
    },
    { immediate: true },
);

// Methods
function onCancel() {
    const routes = router.getRoutes();
    if (routes.length > 1) {
        router.back();
    } else {
        router.push("/admin/courses");
    }
}

async function submitForm(event: FormSubmitEvent<Schema>) {
    try {
        // Prepare the update data
        const data = {
            type: event.data.type,
            title: event.data.title.trim(),
            description: event.data.description?.trim(),
            organizer_name: event.data.organizer_name.trim(),
            organizer_mail: event.data.organizer_mail.trim(),
            form_schema: event.data.form_schema || "[]",
        };

        // Update via API
        if (!props.courseId) {
            const createdCourse = await createCourse(data);
            showSuccess({ title: t("admin.courseForm.courseCreated") });
            await router.push(`/admin/courses/${createdCourse.id}/edit`);
        } else {
            await updateCourse(props.courseId, data);
            // Refresh course data
            await props.refresh?.();
            showSuccess({ title: t("admin.courseForm.courseUpdated") });
        }
    } catch (error) {
        console.error("Error updating course:", error);
        showError({
            title: t("admin.courseForm.failedToUpdateCourse"),
            description: (error as Error).message,
        });
    } finally {
        submitting.value = false;
    }
}

async function onDeleteCourse() {
    if (!props.course) return;

    deleting.value = true;
    try {
        await deleteCourse(props.courseId);

        // Redirect to course list
        await navigateTo("/admin/courses");
        showSuccess({ title: t("admin.courseForm.courseDeleted") });
    } catch (error) {
        console.error("Error deleting course:", error);
        showError({
            title: t("admin.courseForm.failedToDeleteCourse"),
            description: (error as Error).message,
        });
    } finally {
        deleting.value = false;
        showDeleteModal.value = false;
    }
}
</script>

<template>
    <div>
        <UForm :state="form" :schema="schema" @submit="submitForm" @error="(e) => console.error('Form error:', e)"
            class="p-6 space-y-6">
            <!-- Course Type -->
            <UFormField :label="t('admin.courseForm.courseType')" name="type">
                <USelect v-model="form.type" :items="typeOptions" value-key="value"
                    :placeholder="t('admin.courseForm.selectCourseType')" size="lg" required />
            </UFormField>

            <!-- Course Title -->
            <UFormField :label="t('admin.courseForm.courseTitle')" name="title">
                <UInput v-model="form.title" :placeholder="t('admin.courseForm.enterCourseTitle')" size="lg" required />
            </UFormField>

            <!-- Course Description -->
            <UFormField :label="t('admin.courseForm.courseDescription')" name="description">
                <UTextarea v-model="form.description" :placeholder="t('admin.courseForm.describeCourse')" :rows="4"
                    resize required class="justify-stretch w-full" />
            </UFormField>

            <!-- Organizer Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <UFormField :label="t('admin.courseForm.organizerName')" name="organizer_name">
                        <UInput v-model="form.organizer_name" :placeholder="t('admin.courseForm.enterOrganizerName')"
                            size="lg" required />
                    </UFormField>
                </div>
                <div>
                    <UFormField :label="t('admin.courseForm.organizerEmail')" name="organizer_mail">
                        <UInput v-model="form.organizer_mail" type="email"
                            :placeholder="t('admin.courseForm.organizerEmailPlaceholder')" size="lg" required />
                    </UFormField>
                </div>

                <UDrawer>
                    <UButton>{{ t('admin.courseForm.customRegistrationForm') }}</UButton>
                    <template #content>
                        <FormEditor v-model="form.form_schema" />
                    </template>
                </UDrawer>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-between pt-6 border-t border-gray-200">
                <div>
                    <UButton v-if="props.course" type="button" color="error" variant="outline" icon="i-lucide-trash-2"
                        @click="showDeleteModal = true">
                        {{ t('admin.courseForm.deleteCourse') }}
                    </UButton>
                </div>
                <div class="flex space-x-4">
                    <UButton type="button" color="neutral" @click="onCancel">
                        {{ t('admin.courseForm.cancel') }}
                    </UButton>
                    <UButton type="submit" color="primary" :loading="submitting">
                        {{ t('admin.courseForm.updateCourse') }}
                    </UButton>
                </div>
            </div>
        </UForm>
    </div>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteModal">
        <template #content>
            <UCard>
                <template #header>
                    <h3 class="text-lg font-semibold">{{ t('admin.courseForm.deleteCourseTitle') }}</h3>
                </template>

                <p class="text-gray-600">
                    {{ t('admin.courseForm.deleteCourseConfirm', { title: course?.title }) }}
                </p>

                <template #footer>
                    <div class="flex justify-end gap-3">
                        <UButton color="neutral" @click="showDeleteModal = false">
                            {{ t('admin.courseForm.cancel') }}
                        </UButton>
                        <UButton color="error" :loading="deleting" @click="onDeleteCourse">
                            {{ t('admin.courseForm.deleteCourse') }}
                        </UButton>
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>
