<template>
  <section class="chat-modal side-chat" :aria-label="`与 ${profile.name} 对话`">
    <header class="chat-header">
      <div class="chat-avatar">
        <img :src="imageFor(profile.name, profile.color, profile.pale, profile.logo)" :alt="profile.name" draggable="false" />
      </div>
      <div>
        <h2>{{ profile.name }}</h2>
        <p>{{ profile.intro }}</p>
      </div>
      <button class="modal-close chat-back" type="button" aria-label="返回详情" title="返回详情" @click="$emit('back')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>
      </button>
    </header>
    <div ref="messagesList" class="chat-messages" aria-label="聊天消息">
      <div v-for="message in messages" :key="message.id" class="chat-message" :class="message.from === 'me' ? 'is-mine' : 'is-theirs'">
        <div class="chat-bubble-message" :class="{ 'is-file': message.type === 'file' }">
          <template v-if="message.type === 'file'">
            <span class="chat-file-name">{{ message.fileName }}</span>
            <span class="chat-file-size">{{ formatFileSize(message.fileSize || 0) }}</span>
          </template>
          <template v-else>{{ message.content }}</template>
        </div>
      </div>
    </div>
    <div class="emoji-panel" :class="{ 'is-open': isEmojiOpen }" :aria-hidden="!isEmojiOpen">
      <button v-for="emoji in quickPhrases" :key="emoji" type="button" @click="sendEmoji(emoji)">{{ emoji }}</button>
    </div>
    <footer class="chat-composer">
      <button class="chat-tool" type="button" data-tool="emoji" aria-label="快捷表情" title="快捷表情" @click="isEmojiOpen = !isEmojiOpen">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M8 10h.01M16 10h.01M8 15c1.2 1.3 2.5 2 4 2s2.8-.7 4-2"></path></svg>
      </button>
      <button class="chat-tool" type="button" data-tool="file" aria-label="发送文件" title="发送文件" @click="fileInput?.click()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path></svg>
      </button>
      <input ref="fileInput" class="chat-file-input" type="file" hidden @change="sendFile" />
      <textarea ref="textarea" v-model="draft" rows="1" placeholder="输入消息" @keydown.enter.exact.prevent="sendText"></textarea>
      <button class="chat-send" type="button" aria-label="发送" title="发送" @click="sendText">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
      </button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { imageFor } from '@/core/artwork';
import { getProfileDetail } from '@/data/profileDetails';
import { useChatStore } from '@/stores/chat';
import type { BubbleItem } from '@/types/bubble';

const props = defineProps<{
  item: BubbleItem;
}>();

defineEmits<{
  back: [];
}>();

const chatStore = useChatStore();
const draft = ref('');
const isEmojiOpen = ref(false);
const messagesList = ref<HTMLElement | null>(null);
const textarea = ref<HTMLTextAreaElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const quickPhrases = ['你好', '收到', '谢谢', '稍等'];

const profile = computed(() => getProfileDetail(props.item));
const messages = computed(() => chatStore.getMessages(profile.value.id));

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesList.value) messagesList.value.scrollTop = messagesList.value.scrollHeight;
  });
}

function sendText() {
  const value = draft.value.trim();
  if (!value) return;
  chatStore.addText(profile.value.id, value);
  draft.value = '';
  scrollToBottom();
}

function sendEmoji(value: string) {
  chatStore.addEmoji(profile.value.id, value);
  isEmojiOpen.value = false;
  scrollToBottom();
}

function sendFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  chatStore.addFile(profile.value.id, file);
  input.value = '';
  scrollToBottom();
}

watch(messages, scrollToBottom);

onMounted(() => {
  scrollToBottom();
  textarea.value?.focus();
});
</script>
