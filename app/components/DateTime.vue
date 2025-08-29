<script setup lang="ts">
import { CalendarDate, DateFormatter } from '@internationalized/date';
import { vMaska } from 'maska/vue';
import { da } from 'zod/v4/locales';

const { emitFormBlur, emitFormChange } = useFormField();

const model = defineModel<Date>({ required: true });

const df = new DateFormatter('de-CH', {
    dateStyle: 'medium'
});

function fromDate(date: Date) {
    return new CalendarDate(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );
}

const date = shallowRef(fromDate(model.value));
const time = ref('10:00');
const hours = ref(10);
const minutes = ref(0);

function onTimeBlur() {
    const [h, m] = time.value.split(':').map(Number);

    if (h === undefined || m === undefined) {
        return;
    }

    hours.value = clamp(h, 0, 23);
    minutes.value = clamp(m, 0, 59);

    time.value = `${String(hours.value).padStart(2, '0')}:${String(minutes.value).padStart(2, '0')}`;

    emitFormBlur();
    emitFormChange();
}

watch(() => [date.value, hours.value, minutes.value], () => {
    if (!date.value) return;

    model.value = new Date(
        date.value.year,
        date.value.month,
        date.value.day,
        hours.value,
        minutes.value
    );

    emitFormChange();
});

watch(model, (newModel) => {
    const newDate = fromDate(newModel);

    if (date.value.compare(newDate) !== 0) {
        date.value = newDate;
    }

    const h = newModel.getHours();
    const m = newModel.getMinutes();

    if (hours.value !== h || minutes.value !== m) {
        hours.value = h;
        minutes.value = m;
        time.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
}, { immediate: true });

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}
</script>

<template>
    <div class="flex items-center gap-2">
        <UPopover>
            <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
                {{ date ? df.format(model) : 'Select a date' }}
            </UButton>

            <template #content>
                <UCalendar v-model="date" class="p-2" :weekStartsOn="1" weekdayFormat="short" />
            </template>
        </UPopover>

        <UInput @blur="onTimeBlur" v-maska="'##:##'" placeholder="HH:MM" icon="i-lucide-clock" v-model="time" />
    </div>
</template>