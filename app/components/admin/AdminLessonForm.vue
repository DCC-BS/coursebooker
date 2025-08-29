<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date';
import type { MaskInputOptions } from 'maska';
import { vMaska } from 'maska/vue';

// interface Props {

// }

// const props = defineProps<Props>();

const df = new DateFormatter('en-US', {
    dateStyle: 'medium'
})

const date = shallowRef(new CalendarDate(2022, 1, 10));
const time = ref('10:00');

watch(time, (newTime) => {
    let [hours, minutes] = newTime.split(':').map(Number);

    if (!hours || !minutes) {
        return;
    }

    console.log(hours, minutes);

    hours = clamp(hours, 0, 23);
    minutes = clamp(minutes, 0, 59);

    time.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

</script>

<template>
    <div>
        <UPopover>
            <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
                {{ date ? df.format(date.toDate(getLocalTimeZone())) : 'Select a date' }}
            </UButton>

            <template #content>
                <UCalendar v-model="date" class="p-2" />
            </template>
        </UPopover>

        <UInput v-maska="'##:##'" placeholder="HH:MM" icon="i-lucide-clock" v-model="time" />
    </div>
</template>