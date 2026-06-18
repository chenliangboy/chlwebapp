<template>
  <section class="chat-modal side-chat" :aria-label="`${item.title} AI 聊天`">
    <header class="chat-header">
      <div class="chat-avatar">
        <img :src="imageFor(item.title, item.color, item.pale, item.image)" :alt="item.title" draggable="false" />
      </div>
      <div>
        <h2>{{ item.title }}</h2>
      </div>
      <button class="modal-close chat-close" type="button" aria-label="关闭" title="关闭" @click="$emit('back')">
        <span aria-hidden="true">&times;</span>
      </button>
    </header>

    <div class="chat-messages">
      <div class="chat-message is-theirs">
        <div class="chat-bubble-message">我是 {{ provider }} 的聊天入口。后续接入接口后，可以在这里流式返回模型回复。</div>
      </div>
      <div v-for="message in messages" :key="message.id" class="chat-message" :class="message.role === 'me' ? 'is-mine' : 'is-theirs'">
        <div class="chat-bubble-message">{{ message.content }}</div>
      </div>
    </div>

    <footer class="chat-composer">
      <div class="chat-composer-tools">
        <span>Enter 发送</span>
      </div>
      <textarea v-model="draft" rows="2" placeholder="向 AI 发送消息" @keydown.enter.exact.prevent="send"></textarea>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { imageFor } from '@/core/artwork';
import { resolveBubbleAction } from '@/workspace/actions';
import type { BubbleItem } from '@/types/bubble';

const props = defineProps<{
  item: BubbleItem;
}>();

defineEmits<{
  back: [];
}>();

const draft = ref('');
const messages = ref<{ id: string; role: 'me' | 'ai'; content: string }[]>([]);
const action = computed(() => resolveBubbleAction(props.item));
const payload = computed(() => action.value.payload || {});
const provider = computed(() => String(payload.value.provider || props.item.title));
const model = computed(() => String(payload.value.model || '默认模型'));

function send() {
  const value = draft.value.trim();
  if (!value) return;
  messages.value.push({ id: `${Date.now()}`, role: 'me', content: value });
  messages.value.push({ id: `${Date.now()}-ai`, role: 'ai', content: `已收到：${value}` });
  draft.value = '';
}
</script>
