<script setup lang="ts">
import type { Session } from '~/../shared/models';

interface Props {
    session?: Session;
}

const props = defineProps<Props>();
const title = computed(() => props.session ? `Edit Session ${props.session.id}` : 'Add New Session');

watch(() => props.session, (newSession) => {
    if (newSession) {
        form.location = newSession.location ?? undefined;
        form.teams_link = newSession.teams_link ? undefined;
    }
});

const form = reactive({
    location: props.session?.location || '',
    teams_link: props.session?.teams_link || ''
});

const emit = defineEmits<{
    update: [session: Session];
    cancel: [];
}>();

</script>


<template>
    <UCard>
        <template #header>
            <h3 class="text-lg font-semibold">{{ title }}</h3>
        </template>

        <form @submit.prevent="createSession" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Location
                </label>
                <UInput v-model="form.location" placeholder="Enter session location" size="lg" />
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Teams Link (Optional)
                </label>
                <UInput v-model="form.teams_link" placeholder="https://teams.microsoft.com/..." size="lg" />
            </div>
        </form>

        <template #footer>
            <div class="flex justify-end gap-3">
                <UButton type="button" color="neutral" @click="emit('cancel')">
                    Cancel
                </UButton>
                <UButton type="submit" color="primary" :loading="creating" @click="createSession">
                    Create Session
                </UButton>
            </div>
        </template>
    </UCard>
</template>
