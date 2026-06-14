<template>
  <section class="workspace-tool-panel">
    <header class="tool-panel-header">
      <div>
        <span>{{ typeLabel }}</span>
        <h2>{{ item.title }}</h2>
        <p>{{ item.subtitle || action.url || '外部功能入口' }}</p>
      </div>
      <a v-if="action.url" class="icon-button" :href="action.url" target="_blank" rel="noreferrer" aria-label="新窗口打开" title="新窗口打开">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7"></path><path d="M10 14 21 3"></path><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"></path></svg>
      </a>
    </header>

    <div class="embedded-frame">
      <iframe v-if="action.url" :src="action.url" :title="item.title" loading="lazy"></iframe>
      <div v-else class="panel-placeholder">
        <strong>还没有配置功能地址</strong>
        <p>为这个气泡添加 action.url 后，就可以在这里加载对应页面。</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getBubbleTypeDefinition } from '@/data/bubbleTypes';
import { resolveBubbleAction } from '@/workspace/actions';
import type { BubbleItem } from '@/types/bubble';

const props = defineProps<{
  item: BubbleItem;
}>();

const action = computed(() => resolveBubbleAction(props.item));
const typeLabel = computed(() => getBubbleTypeDefinition(props.item.category).label);
</script>
