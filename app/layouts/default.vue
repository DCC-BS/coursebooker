<script setup lang="ts">
import { DataBsBanner } from "@dcc-bs/common-ui.bs.js";
import NavigationMenu from "~/components/NavigationMenu.vue";
</script>


<template>
    <NavigationMenu />
    <slot />
    <DataBsBanner />
</template>