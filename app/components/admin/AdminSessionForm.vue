<script setup lang="ts">
import {
    type CreateSession,
    createSessionSchema,
    type Session,
    type UpdateSession,
} from "~/../shared/models";

interface Props {
    courseId: string;
    session?: Session;
}

const props = defineProps<Props>();

const { showSuccess, showError } = useUserFeedback();

const title = computed(() =>
    props.session ? `Edit Session ${props.session.id}` : "Add New Session",
);
const creating = ref(false);

watch(
    () => props.session,
    (newSession) => {
        if (newSession) {
            state.location = newSession.location ?? undefined;
            state.teams_link = newSession.teams_link ?? undefined;
        }
    },
);

const state = reactive({
    location: props.session?.location || "",
    teams_link: props.session?.teams_link || "",
    courseId: props.courseId,
    ics_file: undefined,
} as CreateSession);

const emit = defineEmits<{
    update: [session: Session];
    cancel: [];
}>();

async function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;

    console.log(target.files[0]);

    const arrayBuffer = await target.files[0]?.arrayBuffer();
    state.ics_file = arrayBuffer ? new Blob([arrayBuffer]) : undefined;
}

function onSubmit() {
    creating.value = true;

    if (props.session) {
        updateSession();
    } else {
        createSession();
    }
}

function createSession() {
    const formData = new FormData();
    if (state.location) {
        formData.append("location", state.location);
    }
    if (state.teams_link) {
        formData.append("teams_link", state.teams_link);
    }
    if (state.ics_file) {
        formData.append("ics_file", state.ics_file);
    }

    $fetch<Session>(`/api/courses/${props.courseId}/sessions/`, {
        method: "POST",
        body: formData,
    })
        .then((newSession) => {
            emit("update", newSession);
            showSuccess({ title: "Session created successfully" });
        })
        .catch((error) => {
            console.error("Error creating session:", error);
            showError({
                title: "Failed to create session. Please try again.",
            });
        })
        .finally(() => {
            creating.value = false;
        });
}

function updateSession() {
    if (!props.session) {
        throw new Error("No session to update");
    }

    const body = {
        location: state.location,
        teams_link: state.teams_link,
        ics_file: state.ics_file,
    } as UpdateSession;

    const formData = new FormData();
    formData.append("location", body.location || "");
    formData.append("teams_link", body.teams_link || "");
    if (body.ics_file) {
        formData.append("ics_file", body.ics_file);
    }

    $fetch<Session>(
        `/api/courses/${props.courseId}/sessions/${props.session.id}`,
        {
            method: "PATCH",
            body: formData,
        },
    )
        .then((updatedSession) => {
            emit("update", updatedSession);
            showSuccess({ title: "Session updated successfully" });
        })
        .catch((error) => {
            console.error("Error updating session:", error);

            showError({
                title: "Failed to update session. Please try again.",
            });
        });
}

function removeIcsFile() {
    $fetch<Session>(
        `/api/courses/${props.courseId}/sessions/${props.session?.id}/ics`,
        {
            method: "DELETE",
        },
    )
        .then((updatedSession) => {
            emit("update", updatedSession);
            showSuccess({ title: "ICS file removed successfully" });
        })
        .catch((error) => {
            console.error("Error removing ICS file:", error);

            showError({
                title: "Failed to remove ICS file. Please try again.",
            });
        });
}
</script>

<template>
    <UCard>
        <template #header>
            <h3 class="text-lg font-semibold">{{ title }}</h3>
        </template>
        <UForm :schema="createSessionSchema" :state="state" @submit="onSubmit" class="space-y-4">
            <UFormField label="Location" name="location">
                <UInput class="w-full" v-model="state.location" placeholder="Enter session location" size="lg" />
            </UFormField>

            <UFormField label="Teams Link" name="teams_link">
                <UInput class="w-full" v-model="state.teams_link" placeholder="https://teams.microsoft.com/..."
                    size="lg" />
            </UFormField>

            <UFormField label="ICS File" name="ics_file">
                <UInput class="w-full" accept=".ics," @change="handleFileChange" placeholder="Upload ICS File" size="lg"
                    type="file" />

                <div v-if="props.session?.ics_url" class="mt-2">
                    <a :href="props.session.ics_url" download>Download ICS File</a>

                    <UPopover>
                        <UButton size="xs" variant="link" color="error" class="ml-2">Remove</UButton>
                        <template #content>
                            <div class="p-2">
                                <p class="text-sm">Are you sure you want to remove it?</p>
                                <UButton size="sm" color="error" class="mt-2" @click="removeIcsFile">
                                    Yes, Remove
                                </UButton>
                            </div>
                        </template>
                    </UPopover>
                </div>
            </UFormField>

            <div class="flex justify-end gap-3 mt-2">
                <UButton type="button" color="neutral" @click="emit('cancel')">
                    Cancel
                </UButton>
                <UButton type="submit" color="primary" :loading="creating">
                    {{ props.session ? 'Update Session' : 'Create Session' }}
                </UButton>
            </div>
        </UForm>
    </UCard>
</template>