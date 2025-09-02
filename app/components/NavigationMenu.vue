<script lang="ts" setup>
import { DisclaimerButton } from "@dcc-bs/common-ui.bs.js";
import type { DropdownMenuItem } from "@nuxt/ui";
import { Icon, UIcon } from "#components";

const { t, locale, locales, setLocale } = useI18n();

const availableLocales = computed(() => {
    return locales.value.filter((i) => i.code !== locale.value);
});
const { data, signOut } = useAuth();

const userImage = computed(() => {
    const base64 = data.value?.user?.image;
    return base64 ? base64 : "/LucideCircleUserRound.png";
});

// Navigation menu items
const items = computed<DropdownMenuItem[]>(() =>
    availableLocales.value.map((locale) => ({
        label: locale.name,
        onSelect: async () => setLocale(locale.code),
    })),
);

const logoutItems = computed<DropdownMenuItem[]>(() => [
    {
        label: t("navigation.signOut"),
        icon: "i-lucide-log-out",
        onSelect: async () => {
            await handleSignOut();
        },
    },
]);

async function handleSignOut(): Promise<void> {
    await signOut();
}
</script>

<template>
    <div class="flex justify-between gap-2 p-2 w-full z-50">
        <DisclaimerButton variant="ghost" />
        <div class="text-md md:text-4xl font-bold bg-gradient-to-r text-cyan-600 hover:text-cyan-600">
            {{ t("navigation.app") }}
        </div>
        <div class="flex gap-1">
            <UDropdownMenu :items="items" arrow>
                <UButton variant="ghost" :label="t('navigation.languages')" icon="i-lucide-languages">
                </UButton>
            </UDropdownMenu>
            <UDropdownMenu :items="logoutItems" arrow>
                <img :src="userImage" alt="User Image" class="w-8 h-8 rounded-full" />
            </UDropdownMenu>
        </div>
    </div>
</template>