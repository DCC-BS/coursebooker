<script setup lang="ts">
import NavigationMenu from '~/components/NavigationMenu.vue';
import { DataBsBanner } from '@dcc-bs/common-ui.bs.js';

</script>


<template>
    <NavigationMenu />
    <slot />
    <DataBsBanner />
</template>