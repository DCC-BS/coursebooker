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

const { showError, showSuccess } = useUserFeedback();
const router = useRouter();

// Form state
const submitting = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);
const schema = createCourseSchema;
type Schema = z.infer<typeof schema>;

// Course type options
const typeOptions = [
    { label: "Course", value: "course" },
    { label: "Event", value: "event" },
];

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
            showSuccess({ title: "Course created successfully" });
            await router.push(`/admin/courses/${createdCourse.id}/edit`);
        } else {
            await updateCourse(props.courseId, data);
            // Refresh course data
            await props.refresh?.();
            showSuccess({ title: "Course updated successfully" });
        }
    } catch (error) {
        console.error("Error updating course:", error);
        showError({
            title: "Failed to update course",
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
        showSuccess({ title: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        showError({
            title: "Failed to delete course",
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
            <UFormField label="Course Type" name="type">
                <USelect v-model="form.type" :items="typeOptions" value-key="value" placeholder="Select course type"
                    size="lg" required />
            </UFormField>

            <!-- Course Title -->
            <UFormField label="Course Title" name="title">
                <UInput v-model="form.title" placeholder="Enter course title" size="lg" required />
            </UFormField>

            <!-- Course Description -->
            <UFormField label="Course Description" name="description">
                <UTextarea v-model="form.description" placeholder="Describe what this course covers..." :rows="4" resize
                    required class="justify-stretch w-full" />
            </UFormField>

            <!-- Organizer Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <UFormField label="Organizer Name" name="organizer_name">
                        <UInput v-model="form.organizer_name" placeholder="Enter organizer name" size="lg" required />
                    </UFormField>
                </div>
                <div>
                    <UFormField label="Organizer Email" name="organizer_mail">
                        <UInput v-model="form.organizer_mail" type="email" placeholder="organizer@example.com" size="lg"
                            required />
                    </UFormField>
                </div>

                <UDrawer>
                    <UButton>Customize Registration Form</UButton>
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
                        Delete Course
                    </UButton>
                </div>
                <div class="flex space-x-4">
                    <UButton type="button" color="neutral" @click="onCancel">
                        Cancel
                    </UButton>
                    <UButton type="submit" color="primary" :loading="submitting">
                        Update Course
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
                    <h3 class="text-lg font-semibold">Delete Course</h3>
                </template>

                <p class="text-gray-600">
                    Are you sure you want to delete "<span class="font-semibold">{{ course?.title }}</span>"?
                    This action cannot be undone and will also delete all associated sessions and lessons.
                </p>

                <template #footer>
                    <div class="flex justify-end gap-3">
                        <UButton color="neutral" @click="showDeleteModal = false">
                            Cancel
                        </UButton>
                        <UButton color="error" :loading="deleting" @click="onDeleteCourse">
                            Delete Course
                        </UButton>
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>