<template>
  <button class="icon-button" :class="{ danger }" type="button" :aria-label="label" :title="label">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  danger?: boolean;
}>();
</script>
