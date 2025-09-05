<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { add } from "date-fns";
import * as z from "zod";
import {
    type CreateLesson,
    createLessonSchema,
    type Lesson,
    type UpdateLesson,
    updateLessonSchema,
} from "~~/shared/models";

const props = defineProps<{
    courseId: string;
    sessionId: string;
    lesson?: Lesson;
}>();

const emit = defineEmits<{
    created: [];
    updated: [];
}>();

const feedback = useUserFeedback();
const isSubmitting = ref(false);
const fromDuration = ref("");

const schema = z
    .object({
        start: z
            .date()
            .min(new Date(), { error: "Start Date must be in the future" }),
        end: z.date(),
    })
    .refine((data) => data.end > data.start, {
        error: "End Date must be after Start Date",
        path: ["end"],
    });

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
    start: new Date(),
    end: add(new Date(), { hours: 1 }),
});

watch(
    () => props.lesson,
    (newLesson) => {
        if (newLesson) {
            state.start = new Date(newLesson.start);
            state.end = new Date(newLesson.end);
        }
    },
    { immediate: true },
);

function endFromDuration() {
    if (fromDuration.value.trim() === "") {
        return;
    }

    const parts = fromDuration.value.match(/(\d+)\s*(m|h)/g);
    if (!parts) {
        console.error("Invalid duration format");
        feedback.showError({ title: "Invalid duration format" });
        return;
    }

    let totalMinutes = 0;

    for (const part of parts) {
        const match = part.match(/(\d+)\s*(m|h)/);
        if (!match) {
            console.error("Invalid duration format");
            feedback.showError({ title: "Invalid duration format" });
            return;
        }

        const value = Number.parseInt(match[1], 10);
        const unit = match[2];

        if (unit === "m") {
            totalMinutes += value;
        } else if (unit === "h") {
            totalMinutes += value * 60;
        }
    }

    console.log("start", state.start, "totalMinutes", totalMinutes);

    state.end = add(state.start, { minutes: totalMinutes });
}

function onSubmit(event: FormSubmitEvent<Schema>) {
    if (props.lesson) {
        updateLesson(event.data);
    } else {
        createLesson(event.data);
    }
}

async function createLesson(data: Schema) {
    isSubmitting.value = true;

    const lesson = {
        sessionId: props.sessionId,
        start: data.start,
        end: data.end,
    } as CreateLesson;

    await $fetch(
        `/api/courses/${props.courseId}/sessions/${props.sessionId}/lessons`,
        {
            method: "POST",
            body: createLessonSchema.parse(lesson),
        },
    )
        .then(() => {
            feedback.showSuccess({ title: "Lesson created successfully" });
            emit("created");
        })
        .catch((error) => {
            console.error(error);
            feedback.showError({ title: "Failed to create lesson" });
        })
        .finally(() => {
            isSubmitting.value = false;
        });
}

async function updateLesson(data: Schema) {
    if (!props.lesson) {
        return;
    }

    isSubmitting.value = true;

    const lesson = {
        start: data.start,
        end: data.end,
    } as UpdateLesson;

    await $fetch<Lesson>(
        `/api/courses/${props.courseId}/sessions/${props.sessionId}/lessons/${props.lesson.id}`,
        {
            method: "PUT",
            body: updateLessonSchema.parse(lesson),
        },
    )
        .then(() => {
            feedback.showSuccess({ title: "Lesson updated successfully" });
            emit("updated");
        })
        .catch((error) => {
            console.error(error);
            feedback.showError({ title: "Failed to update lesson" });
        })
        .finally(() => {
            isSubmitting.value = false;
        });
}
</script>

<template>
    <UForm :state="state" :schema="schema" @submit="onSubmit" class="flex gap-2 items-start">
        <UFormField label="Start Time" name="start">
            <DateTime v-model="state.start" />
        </UFormField>
        <UFormField label="End Time" name="end">
            <UPopover>
                <div>
                    <DateTime v-model="state.end" />
                </div>
                <template #content>
                    <div class="flex flex-col p-2">
                        <span>Duration of the event. (m for minutes, h for hours)</span>
                        <UInput v-model="fromDuration" @change="endFromDuration" placeholder=" 1h 30m" />
                    </div>
                </template>
            </UPopover>
        </UFormField>

        <UButton :loading="isSubmitting" type="submit" icon="i-lucide-plus" class="mt-6">Add Lesson</UButton>
    </UForm>
</template>