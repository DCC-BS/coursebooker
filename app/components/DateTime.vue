<script setup lang="ts">
import { format } from "date-fns";

const { emitFormChange } = useFormField();

function toNormalizeDateString(date: Date) {
    return format(date, "yyyy-MM-dd'T'HH:mm");
}

const model = defineModel<Date>({ required: true });
const dateString = ref<string>("");

function onDateStringChange() {
    if (!dateString.value) return;

    model.value = new Date(dateString.value);
    emitFormChange();
}

watch(
    model,
    (newModel) => {
        const dateStr = toNormalizeDateString(newModel);

        if (dateStr === dateString.value) {
            return;
        }

        dateString.value = dateStr;
    },
    { immediate: true },
);
</script>

<template>
    <UInput v-model="dateString" @change="onDateStringChange" type="datetime-local" icon="i-lucide-calendar" />
</template>