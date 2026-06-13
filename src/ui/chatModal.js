import { imageFor } from '../core/artwork.js';
import { escapeHtml } from '../utils/html.js';
import { icons } from './icons.js';

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function createChatModal({ modalManager, chatStore }) {
  let currentModal = null;

  function renderMessages(list, messages) {
    list.innerHTML = messages.map((message) => {
      const isMine = message.from === 'me';
      const detail = message.type === 'file'
        ? `<span class="chat-file-name">${escapeHtml(message.fileName)}</span><span class="chat-file-size">${formatFileSize(message.fileSize)}</span>`
        : escapeHtml(message.content);

      return `
        <div class="chat-message ${isMine ? 'is-mine' : 'is-theirs'}">
          <div class="chat-bubble-message ${message.type === 'file' ? 'is-file' : ''}">
            ${detail}
          </div>
        </div>
      `;
    }).join('');

    list.scrollTop = list.scrollHeight;
  }

  function open(item, profile) {
    if (currentModal) currentModal.close();

    const titleId = `chat-title-${profile.id}`;
    const content = document.createElement('div');
    content.className = 'chat-modal';
    content.innerHTML = `
      <header class="chat-header">
        <div class="chat-avatar">
          <img src="${imageFor(profile.name, profile.color, profile.pale, profile.logo)}" alt="${escapeHtml(profile.name)}" draggable="false" />
        </div>
        <div>
          <h2 id="${titleId}">${escapeHtml(profile.name)}</h2>
          <p>${escapeHtml(profile.intro)}</p>
        </div>
        <button class="modal-close chat-close" type="button" aria-label="关闭对话" title="关闭对话">
          ${icons.close}
        </button>
      </header>
      <div class="chat-messages" aria-label="聊天消息"></div>
      <div class="emoji-panel" aria-hidden="true">
        <button type="button" data-emoji="你好">你好</button>
        <button type="button" data-emoji="收到">收到</button>
        <button type="button" data-emoji="谢谢">谢谢</button>
        <button type="button" data-emoji="稍等">稍等</button>
      </div>
      <footer class="chat-composer">
        <button class="chat-tool" type="button" data-tool="emoji" aria-label="快捷表情" title="快捷表情">
          ${icons.smile}
        </button>
        <button class="chat-tool" type="button" data-tool="file" aria-label="发送文件" title="发送文件">
          ${icons.file}
        </button>
        <input class="chat-file-input" type="file" hidden />
        <textarea data-autofocus rows="1" placeholder="输入消息"></textarea>
        <button class="chat-send" type="button" aria-label="发送" title="发送">
          ${icons.send}
        </button>
      </footer>
    `;

    const messagesList = content.querySelector('.chat-messages');
    const textarea = content.querySelector('textarea');
    const emojiPanel = content.querySelector('.emoji-panel');
    const fileInput = content.querySelector('.chat-file-input');

    function refresh() {
      renderMessages(messagesList, chatStore.getMessages(profile.id));
    }

    function sendText() {
      const value = textarea.value.trim();
      if (!value) return;
      chatStore.addText(profile.id, value);
      textarea.value = '';
      refresh();
    }

    currentModal = modalManager.open({
      className: 'chat-modal-overlay',
      content,
      labelledBy: titleId,
      onClose: () => {
        currentModal = null;
      }
    });

    content.querySelector('.chat-close').addEventListener('click', () => currentModal.close());
    content.querySelector('.chat-send').addEventListener('click', sendText);
    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendText();
      }
    });
    content.querySelector('[data-tool="emoji"]').addEventListener('click', () => {
      const isOpen = emojiPanel.classList.toggle('is-open');
      emojiPanel.setAttribute('aria-hidden', String(!isOpen));
    });
    content.querySelectorAll('[data-emoji]').forEach((button) => {
      button.addEventListener('click', () => {
        chatStore.addEmoji(profile.id, button.dataset.emoji);
        emojiPanel.classList.remove('is-open');
        emojiPanel.setAttribute('aria-hidden', 'true');
        refresh();
      });
    });
    content.querySelector('[data-tool="file"]').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      chatStore.addFile(profile.id, file);
      fileInput.value = '';
      refresh();
    });

    refresh();
  }

  return { open };
}
