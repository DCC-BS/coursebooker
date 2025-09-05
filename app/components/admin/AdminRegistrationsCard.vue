<script lang="ts" setup>
import type { Session } from '~~/shared/models';
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const props = defineProps<{
    courseId: string;
    session: Session;
    refreshSession: () => Promise<void>;
}>();

const { users } = useUsers({ withRegistrations: false });
const userEmails = computed(() => users.value?.map(u => u.email) ?? []);

const { registerForSession, unregisterFromSession } = useSetSession(props.courseId, props.session.id);
const { showSuccess, showError } = useUserFeedback();

const addRegistrationSchema = z.object({
    email: z.email(),
});

type Schema = z.infer<typeof addRegistrationSchema>;

const formState = reactive<Schema>({
    email: '',
});


async function removeRegistration(email: string) {
    try {
        await unregisterFromSession(email);
        showSuccess({ title: 'Registration removed successfully' });
    } catch (error) {
        showError({ title: 'Failed to remove registration', description: (error as Error).message });
    } finally {
        await props.refreshSession();
    }
}

async function submitAddRegistration(event: FormSubmitEvent<Schema>) {
    event.preventDefault();
    try {
        await registerForSession(formState.email);
        showSuccess({ title: 'Registration added successfully' });
        formState.email = '';
    } catch (error) {
        showError({ title: 'Failed to add registration', description: (error as Error).message });
    } finally {
        await props.refreshSession();
    }
}

</script>

<template>
    <div class="border border-gray-200 rounded-lg p-6">
        <div v-for="registration in props.session.registrations" :key="registration.userEmail">
            <div class="flex gap-2 items-end border-b border-gray-200 p-1 my-1">
                <UIcon name="i-lucide-user" class="w-5 h-5 text-gray-500 mt-1" />
                <div class="flex-1">
                    {{ registration.userEmail }}
                </div>
                <UPopover>
                    <UButton icon="i-lucide-trash-2" color="error" size="sm" variant="outline">
                        Remove
                    </UButton>
                    <template #content>
                        <div class="p-2">
                            <p>Are you sure you want to remove this registration?</p>
                            <div class="flex justify-center mt-2">
                                <UButton color="error" size="sm" variant="outline" class="mr-2">
                                    Cancel
                                </UButton>
                                <UButton color="error" size="sm" @click="removeRegistration(registration.userEmail)">
                                    Confirm
                                </UButton>
                            </div>
                        </div>
                    </template>
                </UPopover>
            </div>
        </div>

        <UForm class="flex gap-2 items-start mt-2" :schema="addRegistrationSchema" :state="formState"
            @submit="submitAddRegistration">

            <UFormField name="email">
                <UInputMenu icon="i-lucide-search" v-model="formState.email" placeholder="Select user"
                    :items="userEmails" createItem />
            </UFormField>

            <UButton icon="i-lucide-user-plus" type="submit">Add Registration</UButton>
        </UForm>
    </div>
</template>