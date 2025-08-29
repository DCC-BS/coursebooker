<script setup lang="ts">
import { type Session, type CreateSession, type UpdateSession, createSessionSchema } from '~/../shared/models';

interface Props {
    courseId: string;
    session?: Session;
}

const props = defineProps<Props>();
const title = computed(() => props.session ? `Edit Session ${props.session.id}` : 'Add New Session');
const creating = ref(false);
const feedback = useUserFeedback();

watch(() => props.session, (newSession) => {
    if (newSession) {
        state.location = newSession.location ?? undefined;
        state.teams_link = newSession.teams_link ?? undefined;
    }
});

const state = reactive({
    location: props.session?.location || '',
    teams_link: props.session?.teams_link || '',
    courseId: props.courseId,
} as CreateSession);

const emit = defineEmits<{
    update: [session: Session];
    cancel: [];
}>();

function onSubmit() {
    creating.value = true;

    if (props.session) {
        updateSession();
    } else {
        createSession();
    }
}

function createSession() {
    const body = {
        location: state.location,
        teams_link: state.teams_link,
        courseId: state.courseId,
    } as CreateSession;

    $fetch<Session>(`/api/courses/${props.courseId}/sessions/`, {
        method: 'POST',
        body,
    }).then((newSession) => {
        emit('update', newSession);
    }).catch((error) => {
        console.error('Error creating session:', error);
        feedback.showError({
            title: 'Failed to create session. Please try again.'
        });
    }).finally(() => {
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
    } as UpdateSession;

    $fetch<Session>(`/api/courses/${props.courseId}/sessions/${props.session.id}`, {
        method: 'PATCH',
        body,
    }).then((updatedSession) => {
        emit('update', updatedSession);
    }).catch((error) => {
        console.error('Error updating session:', error);

        feedback.showError({
            title: 'Failed to update session. Please try again.'
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