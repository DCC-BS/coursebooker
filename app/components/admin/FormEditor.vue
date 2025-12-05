<script lang="ts" setup>
import type { FormKitSchemaDefinition, FormKitSchemaNode } from "@formkit/core";
import { FormKitSchema } from "@formkit/vue";

const formSchemaStr = defineModel<string>();
const parseError = ref<string>();

const formSchema = computed<FormKitSchemaDefinition>(() =>
    parse(formSchemaStr.value || "[]"),
);

const submitResult = ref<string>();

function parse(schemaStr: string) {
    try {
        const parsed = JSON.parse(schemaStr);
        parseError.value = undefined;
        return parsed;
    } catch (e) {
        parseError.value = (e as Error).message;
        return [];
    }
}

function onSubmit(data: unknown) {
    submitResult.value = JSON.stringify(data, null, 2);
}

function addCommentField() {
    const node: FormKitSchemaNode = {
        $formkit: "textarea",
        name: "Anmerkungen",
        label: "Anmerkungen",
        help: "Zusätzliche Anmerkungen",
        validation: "length:0,500",
    };

    const schema = parse(formSchemaStr.value || "[]") as FormKitSchemaNode[];
    schema.push(node);
    formSchemaStr.value = JSON.stringify(schema, null, 2);
}

function addNumberField() {
    const node: FormKitSchemaNode = {
        $formkit: "number",
        name: "Teilnehmerzahl",
        label: "Teilnehmerzahl",
        help: "Anzahl der Teilnehmer",
        validation: "required|integer|min:1",
    };

    const schema = parse(formSchemaStr.value || "[]") as FormKitSchemaNode[];
    schema.push(node);
    formSchemaStr.value = JSON.stringify(schema, null, 2);
}

function addTextField() {
    const node: FormKitSchemaNode = {
        $formkit: "text",
        name: "Vorname",
        label: "Vorname",
        help: "Dein Vorname",
        validation: "required|alpha",
    };

    const schema = parse(formSchemaStr.value || "[]") as FormKitSchemaNode[];
    schema.push(node);
    formSchemaStr.value = JSON.stringify(schema, null, 2);
}

function addOptionsField() {
    const node: FormKitSchemaNode = {
        $formkit: "select",
        name: "Essenspräferenz",
        label: "Essenspräferenz",
        help: "Wähle deine Essenspräferenz",
        options: [
            { value: "fleisch", label: "Fleisch" },
            { value: "vegetarisch", label: "Vegetarisch" },
            { value: "vegan", label: "Vegan" },
        ],
        validation: "required",
    };

    const schema = parse(formSchemaStr.value || "[]") as FormKitSchemaNode[];
    schema.push(node);
    formSchemaStr.value = JSON.stringify(schema, null, 2);
}
</script>

<template>
    <div class="min-h-[700px] overflow-auto">
        <div class="grid grid-cols-2">
            <div class="p-6">
                <h2 class="text-lg font-semibold mb-4">Form Schema (JSON)</h2>
                <a href="https://formkit.com/essentials/schema" target="_blank"
                    class="text-sm text-blue-600 underline mb-4 inline-block">FormKit Schema Documentation</a>
                <div class="flex gap-2 pb-2">
                    <UButton size="sm" color="primary" @click="addCommentField">Add Comment Field</UButton>
                    <UButton size="sm" color="primary" @click="addNumberField">Add Number Field</UButton>
                    <UButton size="sm" color="primary" @click="addTextField">Add Text Field</UButton>
                    <UButton size="sm" color="primary" @click="addOptionsField">Add Options Field</UButton>
                </div>
                <UTextarea v-model="formSchemaStr" class="w-full" :rows="20" />
                <div v-if="parseError" class="mt-2 text-sm text-red-600">Error parsing schema: {{ parseError }}
                </div>
            </div>
            <div class="p-6">
                <h2 class="text-lg font-semibold mb-4">Form Preview</h2>

                <FormKit type="form" :actions="false" @submit="onSubmit">
                    <FormKitSchema :schema="formSchema" />
                    <UButton type="submit">Submit</UButton>
                </FormKit>

                <div v-if="submitResult" class="mt-4">
                    <h3 class="text-md font-semibold mb-2">Submitted Data:</h3>
                    <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{{ submitResult }}</pre>
                </div>
            </div>
        </div>
    </div>
</template>
