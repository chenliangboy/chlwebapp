<template>
  <article class="detail-card">
    <div class="detail-avatar">
      <img :src="imageFor(profile.name, profile.color, profile.pale, profile.logo)" :alt="profile.name" draggable="false" />
    </div>
    <div class="detail-heading">
      <h2>{{ profile.name }}</h2>
      <p>{{ profile.intro }}</p>
    </div>
    <p class="detail-description">{{ profile.description }}</p>
    <div class="detail-tags">
      <span v-for="tag in profile.tags" :key="tag">{{ tag }}</span>
    </div>
    <div class="detail-actions">
      <button class="primary-button" type="button" @click="$emit('chat')">对话</button>
      <button class="secondary-button" type="button" @click="$emit('edit')">编辑</button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { imageFor } from '@/core/artwork';
import { getProfileDetail } from '@/data/profileDetails';
import type { BubbleItem } from '@/types/bubble';

const props = defineProps<{
  item: BubbleItem;
}>();

defineEmits<{
  chat: [];
  edit: [];
}>();

const profile = computed(() => getProfileDetail(props.item));
</script>
