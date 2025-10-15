<script lang="ts" setup>
import { motion } from "motion-v";

const { t } = useI18n();

const props = defineProps<{
  message: string;
}>();
</script>

<template>
  <motion.div :initial="{ opacity: 0 }" :animate="{ opacity: 1 }"
    class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    <strong class="font-bold">{{ t("admin.common.error") }}</strong>
    <span class="block sm:inline">{{ props.message }}</span>
  </motion.div>
</template>
