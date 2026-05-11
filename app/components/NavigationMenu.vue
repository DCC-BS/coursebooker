<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

const { t, locale, locales, setLocale } = useI18n();
const { data, signOut } = useAppAuth();

const userImage = computed(() => {
    return data.value?.user?.image;
});

const availableLocales = computed(() => {
    return locales.value.filter((i) => i.code !== locale.value);
});

const currentLocale = computed(() => {
    return locale.value?.toUpperCase() ?? "EN";
});

// Navigation menu items
const items = computed<DropdownMenuItem[]>(() =>
    availableLocales.value.map((locale) => ({
        label: locale.code.toUpperCase(),
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
    await navigateTo("/api/auth/authorize", { external: true });
    await signOut();
}
</script>

<template>
    <div class="flex justify-between gap-2 p-2 w-full z-50">
        <ULink to="/">
            <div class="text-xl font-bold mt-4 ml-4">
                {{ t("navigation.app") }}
            </div>
        </ULink>

        <div class="flex items-center gap-2">
            <UButton
                to="/me"
                color="primary"
                variant="ghost"
                icon="i-lucide-graduation-cap"
            >
                {{ t("navigation.myCourses") }}
            </UButton>

            <UDropdownMenu :items="items" variant="ghost">
                <UButton variant="ghost" :label="currentLocale" color="neutral">
                </UButton>
            </UDropdownMenu>

            <UDropdownMenu :items="logoutItems" arrow>
                <img
                    v-if="userImage"
                    :src="userImage"
                    alt="User Image"
                    class="w-8 h-8 rounded-full"
                />
                <UIcon
                    v-else
                    name="i-lucide-user"
                    class="h-6 w-6 rounded-full"
                />
            </UDropdownMenu>
        </div>
    </div>
</template>
