<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";
import type { Session } from "~~/shared/models";

const props = defineProps<{
    courseId: string;
    session: Session;
    refreshSession: () => Promise<void>;
}>();

const { users } = useUsers({ withRegistrations: false });
const addedUsers = ref<string[]>([]);
const userEmails = computed(
    () => users.value?.map((u) => u.email).concat(addedUsers.value) ?? [],
);

const { registerForSession, unregisterFromSession } = useSetSession(
    props.courseId,
    props.session.id,
);
const { showSuccess, showError } = useUserFeedback();

const addRegistrationSchema = z.object({
    email: z.email(),
});

type Schema = z.infer<typeof addRegistrationSchema>;

const formState = reactive<Schema>({
    email: "",
});

async function removeRegistration(email: string) {
    try {
        await unregisterFromSession(email);
        showSuccess({ title: "Registration removed successfully" });
    } catch (error) {
        showError({
            title: "Failed to remove registration",
            description: (error as Error).message,
        });
    } finally {
        await props.refreshSession();
    }
}

async function submitAddRegistration(event: FormSubmitEvent<Schema>) {
    event.preventDefault();
    try {
        await registerForSession(formState.email);
        showSuccess({ title: "Registration added successfully" });
        formState.email = "";
    } catch (error) {
        showError({
            title: "Failed to add registration",
            description: (error as Error).message,
        });
    } finally {
        await props.refreshSession();
    }
}

function addedUser(email: string) {
    if (!addedUsers.value.includes(email)) {
        addedUsers.value.push(email);
    }
}

function exportCsvFile() {
    const csvContent = toCsv();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
        "download",
        `registrations_session_${props.session.id}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function toCsv() {
    if (!props.session.registrations) {
        return "";
    }

    const additionalDataKeys = [] as string[];
    for (const reg of props.session.registrations) {
        if (reg.additional_data) {
            try {
                const data = JSON.parse(reg.additional_data);
                for (const key of Object.keys(data)) {
                    if (!additionalDataKeys.includes(key)) {
                        additionalDataKeys.push(key);
                    }
                }
            } catch {
                // ignore
            }
        }
    }

    const header = ["Email", ...additionalDataKeys];
    console.log(header);
    const rows = props.session.registrations.map((reg) => {
        const row = [reg.userEmail];
        if (reg.additional_data) {
            try {
                const data = JSON.parse(reg.additional_data);
                for (const key of additionalDataKeys) {
                    row.push(data[key] || "");
                }
            } catch {
                for (let i = 0; i < additionalDataKeys.length; i++) {
                    row.push("");
                }
            }
        } else {
            for (let i = 0; i < additionalDataKeys.length; i++) {
                row.push("");
            }
        }
        return row;
    });

    const csvContent =
        header.join(",") +
        "\n" +
        rows
            .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
            .join("\n");
    return csvContent;
}
</script>

<template>
    <div class="border border-gray-200 rounded-lg p-6">
        <UButton @click="exportCsvFile" icon="i-lucide-download" color="primary" size="sm" variant="outline">
            Export Registrations as CSV
        </UButton>

        <div v-for="registration in props.session.registrations" :key="registration.userEmail">
            <div class="flex gap-2 items-end border-b border-gray-200 p-1 my-1">
                <UIcon name="i-lucide-user" class="w-5 h-5 text-gray-500 mt-1" />
                <div class="flex-1">
                    {{ registration.userEmail }}
                </div>
                <UPopover v-if="registration.additional_data">
                    <UButton icon="i-lucide-info" color="info" size="sm" variant="outline">
                        Info
                    </UButton>
                    <template #content>
                        <div class="p-2">
                            <pre> {{ registration.additional_data }}</pre>
                        </div>
                    </template>
                </UPopover>
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
                    :items="userEmails" createItem @create="addedUser" />
            </UFormField>

            <UButton icon="i-lucide-user-plus" type="submit">Add Registration</UButton>
        </UForm>
    </div>
</template>