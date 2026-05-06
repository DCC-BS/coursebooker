<script setup lang="ts">
import NavigationMenu from "~/components/NavigationMenu.vue";
</script>


<template>
    <NavigationMenu />
    <slot />

    <DataBsFooter />
</template>