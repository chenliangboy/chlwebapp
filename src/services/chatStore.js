export function createChatStore() {
  const conversations = new Map();

  function ensureConversation(profileId) {
    if (!conversations.has(profileId)) {
      conversations.set(profileId, [
        {
          id: `${profileId}-welcome`,
          from: 'them',
          type: 'text',
          content: '你好，欢迎打开对话。这里可以继续扩展成真实聊天。',
          createdAt: Date.now()
        }
      ]);
    }

    return conversations.get(profileId);
  }

  function addMessage(profileId, message) {
    const messages = ensureConversation(profileId);
    const nextMessage = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      from: 'me',
      createdAt: Date.now(),
      ...message
    };

    messages.push(nextMessage);
    return nextMessage;
  }

  return {
    getMessages(profileId) {
      return [...ensureConversation(profileId)];
    },
    addText(profileId, content) {
      return addMessage(profileId, { type: 'text', content });
    },
    addEmoji(profileId, content) {
      return addMessage(profileId, { type: 'emoji', content });
    },
    addFile(profileId, file) {
      return addMessage(profileId, {
        type: 'file',
        fileName: file.name,
        fileSize: file.size,
        content: file.name
      });
    }
  };
}
