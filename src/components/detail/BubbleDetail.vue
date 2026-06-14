<template>
  <article class="detail-card">
    <div class="detail-avatar">
      <img :src="imageFor(profile.name, profile.color, profile.pale, profile.logo)" :alt="profile.name" draggable="false" />
    </div>
    <div class="detail-heading">
      <h2>{{ profile.name }}</h2>
      <p>{{ item.subtitle || profile.intro }}</p>
    </div>
    <p class="detail-description">{{ profile.description }}</p>
    <dl class="detail-meta">
      <div>
        <dt>分类</dt>
        <dd>{{ typeDefinition.label }}</dd>
      </div>
      <div v-if="actionLabel">
        <dt>打开方式</dt>
        <dd>{{ actionLabel }}</dd>
      </div>
    </dl>
    <div class="detail-tags">
      <span v-for="tag in profile.tags" :key="tag">{{ tag }}</span>
    </div>
    <div class="detail-actions">
      <button class="primary-button" type="button" @click="$emit('open')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>
        <span>{{ primaryActionText }}</span>
      </button>
      <button v-if="item.category !== 'friend'" class="secondary-button" type="button" @click="$emit('chat')">聊天</button>
      <button class="secondary-button" type="button" @click="$emit('edit')">编辑</button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { imageFor } from '@/core/artwork';
import { getBubbleTypeDefinition } from '@/data/bubbleTypes';
import { getProfileDetail } from '@/data/profileDetails';
import { resolveBubbleAction } from '@/workspace/actions';
import type { BubbleItem } from '@/types/bubble';

const props = defineProps<{
  item: BubbleItem;
}>();

defineEmits<{
  open: [];
  chat: [];
  edit: [];
}>();

const profile = computed(() => getProfileDetail(props.item));
const typeDefinition = computed(() => getBubbleTypeDefinition(props.item.category));
const action = computed(() => resolveBubbleAction(props.item));
const primaryActionText = computed(() => {
  if (props.item.category === 'friend') return '打开聊天';
  if (props.item.category === 'game') return '启动游戏';
  if (props.item.category === 'agent') return '打开工具';
  if (props.item.category === 'ai-chat') return '开始对话';
  if (props.item.category === 'tool') return '打开入口';
  return '打开';
});
const actionLabel = computed(() => {
  if (action.value.kind === 'open-url') return '外部链接';
  if (action.value.panel) return action.value.panel;
  return '';
});
</script>
