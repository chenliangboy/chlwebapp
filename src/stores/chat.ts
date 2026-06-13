import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ChatMessage } from '@/types/chat';

function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Record<string, ChatMessage[]>>({});

  function ensureConversation(profileId: string) {
    if (!conversations.value[profileId]) {
      conversations.value[profileId] = [
        {
          id: `${profileId}-welcome`,
          from: 'them',
          type: 'text',
          content: '你好，欢迎打开对话。这里可以继续扩展成真实聊天。',
          createdAt: Date.now()
        }
      ];
    }

    return conversations.value[profileId];
  }

  function getMessages(profileId: string) {
    return [...ensureConversation(profileId)];
  }

  function addMessage(profileId: string, message: Omit<ChatMessage, 'id' | 'from' | 'createdAt'>) {
    const nextMessage: ChatMessage = {
      id: makeId(),
      from: 'me',
      createdAt: Date.now(),
      ...message
    };
    ensureConversation(profileId).push(nextMessage);
    return nextMessage;
  }

  function addText(profileId: string, content: string) {
    return addMessage(profileId, { type: 'text', content });
  }

  function addEmoji(profileId: string, content: string) {
    return addMessage(profileId, { type: 'emoji', content });
  }

  function addFile(profileId: string, file: File) {
    return addMessage(profileId, {
      type: 'file',
      fileName: file.name,
      fileSize: file.size,
      content: file.name
    });
  }

  return {
    conversations,
    getMessages,
    addText,
    addEmoji,
    addFile
  };
});
