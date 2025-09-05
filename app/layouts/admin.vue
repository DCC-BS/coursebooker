<script lang="ts" setup>
import LoadingView from '~/components/LoadingView.vue';

const isAdmin = ref(false);
const isPending = ref(true);

onMounted(() => {
    fetchMe().then((data) => {
        isAdmin.value = data?.isAdmin ?? false;
    }).catch((error) => {
        console.error("Error fetching user data:", error);
        isAdmin.value = false;
    }).finally(() => {
        isPending.value = false;
    });
});

</script>

<template>
    <div v-if="isPending">
        <LoadingView text="loading ..." />
    </div>
    <div v-else-if="isAdmin">
        <NavigationMenu />
        <slot />
    </div>
    <div v-else>
        <p>You do not have permission to view this content.</p>
    </div>
</template>