<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

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
    <div class="sticky top-0 flex justify-between gap-2 p-2 w-full z-50">
        <div>
            <UButton to="/" variant="ghost" icon="i-lucide-home">
            </UButton>
        </div>
        <div class="flex gap-1">
            <UButton to="/me" color="primary" variant="ghost" icon="i-lucide-graduation-cap">
                {{ t("navigation.myCourses") }}
            </UButton>
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