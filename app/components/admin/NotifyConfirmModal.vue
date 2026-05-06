<script setup lang="ts">
import { format } from "date-fns";
import type { CourseChanges, SessionChanges } from "~~/server/utils/mail.utils";

interface Props {
    open: boolean;
    changes: SessionChanges | CourseChanges | null;
    registrationCount: number;
    isPastSession?: boolean;
    isCourseUpdate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isPastSession: false,
    isCourseUpdate: false,
});

const emit = defineEmits<{
    confirm: [notifyUsers: boolean];
    cancel: [];
}>();

function isSessionChanges(
    changes: SessionChanges | CourseChanges | null,
): changes is SessionChanges {
    if (!changes) return false;
    return (
        "location" in changes ||
        "teams_link" in changes ||
        "lessonsAdded" in changes ||
        "lessonsUpdated" in changes ||
        "lessonsDeleted" in changes
    );
}

function isCourseChanges(
    changes: SessionChanges | CourseChanges | null,
): changes is CourseChanges {
    if (!changes) return false;
    return "description" in changes;
}

function formatSessionChangeDescription(changes: SessionChanges): string[] {
    const lines: string[] = [];

    if (changes.location) {
        const oldVal = changes.location.old || "Nicht gesetzt";
        const newVal = changes.location.new || "Nicht gesetzt";
        lines.push(`Der Ort wurde geändert: ${oldVal} → ${newVal}`);
    }

    if (changes.teams_link) {
        if (changes.teams_link.old && !changes.teams_link.new) {
            lines.push("Der MS Teams Link wurde entfernt");
        } else if (!changes.teams_link.old && changes.teams_link.new) {
            lines.push("Ein MS Teams Link wurde hinzugefügt");
        } else {
            lines.push("Der MS Teams Link wurde aktualisiert");
        }
    }

    if (changes.lessonsAdded) {
        for (const lesson of changes.lessonsAdded) {
            lines.push(
                `Neuer Termin hinzugefügt: ${format(lesson.start, "dd.MM.yyyy HH:mm")} - ${format(lesson.end, "HH:mm")}`,
            );
        }
    }

    if (changes.lessonsUpdated) {
        for (const lesson of changes.lessonsUpdated) {
            lines.push(
                `Termin geändert: ${format(lesson.oldStart, "dd.MM.yyyy HH:mm")} → ${format(lesson.newStart, "dd.MM.yyyy HH:mm")}`,
            );
        }
    }

    if (changes.lessonsDeleted) {
        for (const lesson of changes.lessonsDeleted) {
            lines.push(
                `Termin gelöscht: ${format(lesson.start, "dd.MM.yyyy HH:mm")} - ${format(lesson.end, "HH:mm")}`,
            );
        }
    }

    return lines;
}

function formatCourseChangeDescription(changes: CourseChanges): string[] {
    const lines: string[] = [];

    if (changes.description) {
        lines.push("Die Beschreibung wurde aktualisiert");
    }

    return lines;
}

const changeDescriptions = computed(() => {
    if (!props.changes) return [];

    if (isCourseChanges(props.changes)) {
        return formatCourseChangeDescription(props.changes);
    }

    if (isSessionChanges(props.changes)) {
        return formatSessionChangeDescription(props.changes);
    }

    return [];
});

function onSaveWithoutNotify() {
    emit("confirm", false);
}

function onSaveAndNotify() {
    emit("confirm", true);
}

function onCancel() {
    emit("cancel");
}
</script>

<template>
    <UModal :open="open" @close="onCancel">
        <UCard>
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-bell" class="h-5 w-5 text-primary-500" />
                    <h3 class="text-lg font-semibold">Änderungen speichern</h3>
                </div>
            </template>

            <div class="space-y-4">
                <div v-if="changeDescriptions.length > 0">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Folgende Änderungen wurden vorgenommen:</h4>
                    <ul class="space-y-1 text-sm text-gray-600">
                        <li v-for="(change, index) in changeDescriptions" :key="index" class="flex items-start gap-2">
                            <UIcon name="i-lucide-chevron-right" class="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                            <span>{{ change }}</span>
                        </li>
                    </ul>
                </div>

                <div class="bg-gray-50 rounded-lg p-3">
                    <div class="flex items-center gap-2 text-sm">
                        <UIcon name="i-lucide-users" class="h-4 w-4 text-gray-500" />
                        <span>
                            <strong>{{ registrationCount }}</strong>
                            {{ registrationCount === 1 ? "Person ist" : "Personen sind" }} für {{
                                isCourseUpdate ? "diesen Kurs" : "diese Session" }} angemeldet.
                        </span>
                    </div>
                </div>

                <div v-if="isPastSession && !isCourseUpdate" class="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div class="flex items-start gap-2">
                        <UIcon name="i-lucide-alert-triangle" class="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p class="text-sm font-medium text-amber-800">Vergangene Session</p>
                            <p class="text-sm text-amber-700">
                                Diese Session liegt in der Vergangenheit. Eine Benachrichtigung wird nicht empfohlen.
                            </p>
                        </div>
                    </div>
                </div>

                <div v-if="registrationCount > 0 && (!isPastSession || isCourseUpdate)"
                    class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div class="flex items-start gap-2">
                        <UIcon name="i-lucide-info" class="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p class="text-sm text-blue-700">
                            Möchten Sie die angemeldeten Personen über diese Änderungen per E-Mail informieren?
                        </p>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <UButton color="neutral" variant="ghost" @click="onCancel">
                        Abbrechen
                    </UButton>
                    <UButton color="neutral" @click="onSaveWithoutNotify">
                        Speichern ohne Benachrichtigung
                    </UButton>
                    <UButton v-if="registrationCount > 0 && (!isPastSession || isCourseUpdate)" color="primary"
                        @click="onSaveAndNotify">
                        Speichern und benachrichtigen
                    </UButton>
                </div>
            </template>
        </UCard>
    </UModal>
</template>
