<script setup lang="ts">
import { format } from "date-fns";
import type { Session } from "#shared/models/index";
import type { ChangeDescription } from "#shared/schema";

definePageMeta({
    layout: "admin",
    title: "Benachrichtigung senden",
});

const { t } = useI18n();
const route = useRoute();
const { showToast } = useUserFeedback();

const courseId = route.params.id as string;
const sessionId = route.params.sessionId as string;

const message = ref("");
const includeIcs = ref(true);
const isSending = ref(false);
const activeTab = ref<"compose" | "preview">("compose");
const previewData = ref<{ subject: string; body: string } | null>(null);
const isLoadingPreview = ref(false);

const statusFilter = ref<"all" | "current" | "outdated" | "none">("all");
const versionFilter = ref<string>("all");
const emailSearch = ref("");
const selectedEmails = ref<Set<string>>(new Set());

const { data: sessionData } = await useFetch<Session>(
    `/api/courses/${courseId}/sessions/${sessionId}`,
);

const {
    data: versionData,
    pending,
    refresh,
} = await useFetch(`/api/courses/${courseId}/sessions/${sessionId}/versions`);

const availableVersions = computed(() => {
    if (!versionData.value) return [];
    const versions = new Set<number>();
    for (const user of versionData.value.users) {
        if (user.ics_version_received !== null) {
            versions.add(user.ics_version_received);
        }
    }
    return Array.from(versions).sort((a, b) => b - a);
});

const filteredUsers = computed(() => {
    if (!versionData.value) return [];

    let users = versionData.value.users;

    if (statusFilter.value !== "all") {
        users = users.filter((u) => u.status === statusFilter.value);
    }

    if (versionFilter.value !== "all") {
        const v = Number(versionFilter.value);
        users = users.filter(
            (u) =>
                (versionFilter.value === "none" &&
                    u.ics_version_received === null) ||
                u.ics_version_received === v,
        );
    }

    if (emailSearch.value.trim()) {
        const search = emailSearch.value.trim().toLowerCase();
        users = users.filter((u) => u.userEmail.toLowerCase().includes(search));
    }

    return users;
});

const allFilteredSelected = computed(() => {
    if (filteredUsers.value.length === 0) return false;
    return filteredUsers.value.every((u) =>
        selectedEmails.value.has(u.userEmail),
    );
});

const someFilteredSelected = computed(() => {
    return (
        !allFilteredSelected.value &&
        filteredUsers.value.some((u) => selectedEmails.value.has(u.userEmail))
    );
});

function formatDate(date: Date | string | number): string {
    return format(new Date(date), "dd.MM.yyyy HH:mm");
}

function formatChange(change: ChangeDescription): string {
    switch (change.type) {
        case "location":
            return `Ort: ${change.description}`;
        case "teams_link":
            return `Teams Link: ${change.description}`;
        case "lesson_added":
            return `Termin hinzugefügt: ${change.description}`;
        case "lesson_updated":
            return `Termin geändert: ${change.description}`;
        case "lesson_deleted":
            return `Termin gelöscht: ${change.description}`;
        case "manual":
            return `Manuell: ${change.description}`;
        default:
            return change.description;
    }
}

function getStatusBadge(status: "current" | "outdated" | "none") {
    switch (status) {
        case "current":
            return { color: "success", label: "Aktuell" };
        case "outdated":
            return { color: "warning", label: "Veraltet" };
        case "none":
            return { color: "neutral", label: "Kein ICS" };
    }
}

function toggleSelectAll() {
    if (allFilteredSelected.value) {
        for (const u of filteredUsers.value) {
            selectedEmails.value.delete(u.userEmail);
        }
    } else {
        for (const u of filteredUsers.value) {
            selectedEmails.value.add(u.userEmail);
        }
    }
    selectedEmails.value = new Set(selectedEmails.value);
}

function toggleUser(email: string) {
    if (selectedEmails.value.has(email)) {
        selectedEmails.value.delete(email);
    } else {
        selectedEmails.value.add(email);
    }
    selectedEmails.value = new Set(selectedEmails.value);
}

async function sendNotification() {
    if (selectedEmails.value.size === 0) {
        showToast("Bitte wählen Sie mindestens einen Empfänger aus", "error");
        return;
    }

    isSending.value = true;

    try {
        const result = await $fetch(
            `/api/courses/${courseId}/sessions/${sessionId}/notify`,
            {
                method: "POST",
                body: {
                    message: message.value,
                    includeIcs: includeIcs.value,
                    recipients: Array.from(selectedEmails.value),
                },
            },
        );

        showToast(
            `Benachrichtigung an ${(result as { sentCount: number }).sentCount} Personen gesendet`,
            "success",
        );

        message.value = "";
        selectedEmails.value = new Set();
        await refresh();
    } catch (error) {
        console.error("Error sending notification:", error);
        showToast("Fehler beim Senden der Benachrichtigung", "error");
    } finally {
        isSending.value = false;
    }
}

async function loadPreview() {
    isLoadingPreview.value = true;
    try {
        const result = await $fetch<{
            subject: string;
            body: string;
            includeIcs: boolean;
        }>(`/api/courses/${courseId}/sessions/${sessionId}/notify/preview`, {
            method: "POST",
            body: {
                message: message.value,
                includeIcs: includeIcs.value,
            },
        });
        previewData.value = result;
    } catch (error) {
        console.error("Error loading preview:", error);
        showToast("Fehler beim Laden der Vorschau", "error");
    } finally {
        isLoadingPreview.value = false;
    }
}

function switchTab(tab: "compose" | "preview") {
    activeTab.value = tab;
    if (tab === "preview") {
        loadPreview();
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <AdminHeader title="Benachrichtigung senden" />

        <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div v-if="pending" class="bg-white shadow rounded-lg p-6">
                <USkeleton class="h-8 w-1/3 mb-4" />
                <USkeleton class="h-4 w-full mb-2" />
                <USkeleton class="h-4 w-2/3" />
            </div>

            <template v-else-if="versionData">
                <div class="space-y-6">
                    <div class="bg-white shadow rounded-lg p-6">
                        <h2 class="text-lg font-semibold text-gray-900 mb-4">
                            ICS Version Status
                        </h2>
                        <div class="flex items-center gap-4">
                            <div class="text-sm text-gray-600">
                                Aktuelle Version:
                                <UBadge color="primary" size="lg">
                                    v{{ versionData.currentVersion }}
                                </UBadge>
                            </div>
                            <div class="text-sm text-gray-600">
                                Registrierungen:
                                <strong>{{
                                    versionData.totalRegistrations
                                    }}</strong>
                            </div>
                            <div class="text-sm text-gray-600">
                                Veraltet/Ohne ICS:
                                <strong class="text-amber-600">{{
                                    versionData.outdatedCount
                                    }}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white shadow rounded-lg p-6">
                        <h2 class="text-lg font-semibold text-gray-900 mb-4">
                            Versionsverlauf
                        </h2>

                        <div v-if="versionData.versions.length === 0" class="text-sm text-gray-500">
                            Noch keine Versionen vorhanden
                        </div>

                        <div v-else class="space-y-4">
                            <div v-for="version in versionData.versions" :key="version.id"
                                class="border border-gray-200 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-2">
                                        <UBadge color="primary">v{{ version.version }}</UBadge>
                                        <span class="text-sm text-gray-500">
                                            {{ formatDate(version.createdAt) }}
                                        </span>
                                    </div>
                                    <span class="text-xs text-gray-400">
                                        {{ version.createdBy }}
                                    </span>
                                </div>
                                <div v-if="version.changesParsed.length > 0" class="text-sm text-gray-600">
                                    <ul class="list-disc list-inside">
                                        <li v-for="(
change, idx
                                            ) in version.changesParsed" :key="idx">
                                            {{ formatChange(change) }}
                                        </li>
                                    </ul>
                                </div>
                                <div v-else class="text-sm text-gray-400 italic">
                                    Keine Änderungsbeschreibung
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white shadow rounded-lg p-6">
                        <h2 class="text-lg font-semibold text-gray-900 mb-4">
                            Empfänger-Übersicht
                        </h2>

                        <div class="flex flex-wrap gap-3 mb-4">
                            <USelect v-model="statusFilter" :items="[
                                { label: 'Alle Status', value: 'all' },
                                { label: 'Aktuell', value: 'current' },
                                { label: 'Veraltet', value: 'outdated' },
                                { label: 'Kein ICS', value: 'none' },
                            ]" class="w-40" placeholder="Status filtern" />
                            <USelect v-model="versionFilter" :items="[
                                { label: 'Alle Versionen', value: 'all' },
                                { label: 'Kein ICS', value: 'none' },
                                ...availableVersions.map((v) => ({
                                    label: `v${v}`,
                                    value: String(v),
                                })),
                            ]" class="w-44" placeholder="Version filtern" />
                            <UInput v-model="emailSearch" icon="i-lucide-search" placeholder="E-Mail suchen..."
                                class="w-64" />
                        </div>

                        <div v-if="versionData.users.length === 0" class="text-sm text-gray-500">
                            Keine Registrierungen vorhanden
                        </div>

                        <div v-else-if="filteredUsers.length === 0" class="text-sm text-gray-500">
                            Keine Empfänger entsprechen den Filterkriterien
                        </div>

                        <div v-else class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                            <UCheckbox :model-value="allFilteredSelected
                                                " :indeterminate="someFilteredSelected
                                                    " @update:model-value="
                                                        toggleSelectAll
                                                    " />
                                        </th>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            E-Mail
                                        </th>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Erhaltene Version
                                        </th>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="user in filteredUsers" :key="user.userEmail" :class="{
                                        'bg-primary-50': selectedEmails.has(
                                            user.userEmail,
                                        ),
                                    }" class="cursor-pointer hover:bg-gray-50" @click="toggleUser(user.userEmail)">
                                        <td class="px-4 py-3" @click.stop>
                                            <UCheckbox :model-value="selectedEmails.has(
                                                user.userEmail,
                                            )
                                                " @update:model-value="
                                                    toggleUser(user.userEmail)
                                                    " />
                                        </td>
                                        <td class="px-4 py-3 text-sm text-gray-900">
                                            {{ user.userEmail }}
                                        </td>
                                        <td class="px-4 py-3 text-sm text-gray-500">
                                            {{
                                                user.ics_version_received !==
                                                    null
                                                    ? `v${user.ics_version_received}`
                                                    : "-"
                                            }}
                                        </td>
                                        <td class="px-4 py-3 text-sm">
                                            <UBadge :color="getStatusBadge(user.status)
                                                .color
                                                " size="sm">
                                                {{
                                                    getStatusBadge(user.status)
                                                        .label
                                                }}
                                            </UBadge>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="text-sm text-gray-500 mt-3">
                            {{ filteredUsers.length }} von
                            {{ versionData.users.length }} angezeigt &middot;
                            {{ selectedEmails.size }} ausgewählt
                        </div>
                    </div>

                    <div class="bg-white shadow rounded-lg p-6">
                        <div class="flex items-center gap-1 mb-4 border-b border-gray-200 pb-3">
                            <button class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors" :class="activeTab === 'compose'
                                ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                                : 'text-gray-500 hover:text-gray-700'
                                " @click="switchTab('compose')">
                                <UIcon name="i-lucide-pen-line" class="mr-1.5 inline-block align-text-bottom" />
                                Verfassen
                            </button>
                            <button class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors" :class="activeTab === 'preview'
                                ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                                : 'text-gray-500 hover:text-gray-700'
                                " @click="switchTab('preview')">
                                <UIcon name="i-lucide-eye" class="mr-1.5 inline-block align-text-bottom" />
                                Vorschau
                            </button>
                        </div>

                        <div v-if="activeTab === 'compose'" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Nachricht an die ausgewählten Personen
                                </label>
                                <UTextarea v-model="message" :rows="4"
                                    placeholder="Geben Sie hier Ihre Nachricht ein..." class="w-full" />
                            </div>

                            <div class="flex items-center gap-2">
                                <UCheckbox v-model="includeIcs" />
                                <label class="text-sm text-gray-700">
                                    Aktualisierte ICS-Datei mitsenden
                                </label>
                            </div>

                            <div class="flex justify-between items-center pt-4 border-t">
                                <div class="text-sm text-gray-500">
                                    Empfänger:
                                    {{ selectedEmails.size }} Personen
                                    ausgewählt
                                </div>
                                <UButton color="primary" :loading="isSending" :disabled="selectedEmails.size === 0
                                    " @click="sendNotification">
                                    Benachrichtigung senden
                                </UButton>
                            </div>
                        </div>

                        <div v-else class="space-y-4">
                            <div v-if="isLoadingPreview" class="space-y-3">
                                <USkeleton class="h-6 w-1/3" />
                                <USkeleton class="h-40 w-full" />
                            </div>

                            <div v-else-if="previewData">
                                <div class="mb-4">
                                    <label
                                        class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                        Betreff
                                    </label>
                                    <div class="text-sm font-semibold text-gray-900 bg-gray-50 rounded-lg px-4 py-2">
                                        {{ previewData.subject }}
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <label
                                        class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                        Empfänger (Beispiel)
                                    </label>
                                    <div class="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2">
                                        firstname.lastname@example.com
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <div class="flex items-center justify-between mb-1">
                                        <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nachricht
                                        </label>
                                        <UBadge v-if="previewData.includeIcs" color="primary" size="sm">
                                            <UIcon name="i-lucide-paperclip" class="mr-1" />
                                            ICS-Anhang
                                        </UBadge>
                                    </div>
                                    <div
                                        class="text-sm text-gray-800 bg-gray-50 rounded-lg px-4 py-3 whitespace-pre-wrap font-mono leading-relaxed border border-gray-200">
                                        {{ previewData.body }}
                                    </div>
                                </div>

                                <div class="flex justify-between items-center pt-4 border-t">
                                    <div class="text-sm text-gray-500">
                                        Empfänger:
                                        {{ selectedEmails.size }} Personen
                                        ausgewählt
                                    </div>
                                    <div class="flex gap-2">
                                        <UButton color="neutral" variant="outline" @click="switchTab('compose')">
                                            Bearbeiten
                                        </UButton>
                                        <UButton color="primary" :loading="isSending" :disabled="selectedEmails.size === 0
                                            " @click="sendNotification">
                                            Benachrichtigung senden
                                        </UButton>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="text-center text-sm text-gray-500 py-8">
                                Wechseln Sie zur Vorschau, um eine Vorschau der E-Mail zu
                                sehen.
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <div v-else class="bg-white shadow rounded-lg p-6">
                <div class="text-center">
                    <UIcon name="i-lucide-alert-circle" class="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p class="text-gray-600">Session nicht gefunden</p>
                    <UButton :to="`/admin/courses/${courseId}/sessions`" color="primary" class="mt-4">
                        Zurück zu Sessions
                    </UButton>
                </div>
            </div>
        </div>
    </div>
</template>
