import './style.css';
import { imageFor } from './core/artwork.js';
import { BubbleWall } from './core/BubbleWall.js';
import { initialItems } from './data/initialItems.js';
import { getProfileDetail } from './data/profileDetails.js';
import { createChatStore } from './services/chatStore.js';
import { setupLayoutToggle } from './ui/controls.js';
import { setupSearch } from './ui/search.js';
import { escapeHtml } from './utils/html.js';

const layer = document.querySelector('#bubbleLayer');
const layoutToggle = document.querySelector('#layoutToggle');
const searchToggle = document.querySelector('#searchToggle');
const searchPanel = document.querySelector('#searchPanel');
const searchInput = document.querySelector('#bubbleSearch');
const appShell = document.querySelector('.app-shell');
const leftSidebarToggle = document.querySelector('#leftSidebarToggle');
const leftSidebarReveal = document.querySelector('#leftSidebarReveal');
const rightPanelToggle = document.querySelector('#rightPanelToggle');
const rightPanelReveal = document.querySelector('#rightPanelReveal');
const rightPanelResize = document.querySelector('#rightPanelResize');
const rightPanel = document.querySelector('#rightPanel');
const detailPanel = document.querySelector('#detailPanel');
const menuButtons = document.querySelectorAll('[data-view]');
const views = {
  workspace: document.querySelector('#workspaceView'),
  settings: document.querySelector('#settingsView')
};
const bubbleList = document.querySelector('#bubbleList');
const bubbleEditor = document.querySelector('#bubbleEditor');
const bubbleForm = document.querySelector('#bubbleForm');
const addBubbleButton = document.querySelector('#addBubbleButton');
const cancelEditButton = document.querySelector('#cancelEditButton');
const fields = {
  id: document.querySelector('#bubbleId'),
  title: document.querySelector('#bubbleTitle'),
  image: document.querySelector('#bubbleImage'),
  color: document.querySelector('#bubbleColor'),
  pale: document.querySelector('#bubblePale'),
  type: document.querySelector('#bubbleType')
};

const chatStore = createChatStore();
let selectedBubbleId = '';
let rightPanelWidth = 340;
let isResizingRightPanel = false;

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function clampValue(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rightPanelWidthLimits() {
  const parentWidth = appShell.getBoundingClientRect().width;
  return {
    min: Math.min(300, parentWidth * 0.5),
    max: Math.max(300, parentWidth * 0.5)
  };
}

function setRightPanelWidth(width) {
  const { min, max } = rightPanelWidthLimits();
  rightPanelWidth = clampValue(width, min, max);
  appShell.style.setProperty('--right-width', `${Math.round(rightPanelWidth)}px`);
}

function resizeRightPanelFromClientX(clientX) {
  const rect = appShell.getBoundingClientRect();
  setRightPanelWidth(rect.right - clientX);
}

function renderChatMessages(list, messages) {
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

function createId(title) {
  const slug = title
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '');
  const base = slug || `bubble-${Date.now()}`;
  const used = new Set(bubbleWall.getBubbles().map((bubble) => bubble.id));
  if (!used.has(base)) return base;
  let index = 2;
  while (used.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

function setLeftSidebarVisible(isVisible) {
  appShell.classList.toggle('is-left-collapsed', !isVisible);
  leftSidebarToggle.setAttribute('aria-label', isVisible ? '隐藏左侧菜单' : '显示左侧菜单');
  leftSidebarToggle.title = isVisible ? '隐藏左侧菜单' : '显示左侧菜单';
}

function setRightPanelVisible(isVisible) {
  appShell.classList.toggle('is-right-collapsed', !isVisible);
  rightPanelToggle.setAttribute('aria-label', isVisible ? '隐藏功能区域' : '显示功能区域');
  rightPanelToggle.title = isVisible ? '隐藏功能区域' : '显示功能区域';
  if (isVisible) setRightPanelWidth(rightPanelWidth);
}

function switchView(name) {
  for (const [viewName, view] of Object.entries(views)) {
    view.classList.toggle('is-active', viewName === name);
  }

  bubbleWall.setVisible(name === 'workspace');

  menuButtons.forEach((button) => {
    const isActive = button.dataset.view === name;
    button.classList.toggle('is-active', isActive);
    if (isActive) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  });
}

function renderDetail(item) {
  const profile = getProfileDetail(item);
  selectedBubbleId = item.id;
  setRightPanelVisible(true);
  rightPanel.classList.remove('is-chat-mode');
  detailPanel.classList.remove('is-chat');
  detailPanel.innerHTML = `
    <article class="detail-card">
      <div class="detail-avatar">
        <img src="${imageFor(profile.name, profile.color, profile.pale, profile.logo)}" alt="${escapeHtml(profile.name)}" draggable="false" />
      </div>
      <div class="detail-heading">
        <h2>${escapeHtml(profile.name)}</h2>
        <p>${escapeHtml(profile.intro)}</p>
      </div>
      <p class="detail-description">${escapeHtml(profile.description)}</p>
      <div class="detail-tags">
        ${profile.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
      </div>
      <div class="detail-actions">
        <button class="primary-button" type="button" data-detail-action="chat">对话</button>
        <button class="secondary-button" type="button" data-detail-action="edit">编辑</button>
      </div>
    </article>
  `;

  detailPanel.querySelector('[data-detail-action="chat"]').addEventListener('click', () => {
    renderChatPanel(item, profile);
  });
  detailPanel.querySelector('[data-detail-action="edit"]').addEventListener('click', () => {
    switchView('settings');
    openEditor(item);
  });
}

function renderChatPanel(item, profile = getProfileDetail(item)) {
  selectedBubbleId = item.id;
  setRightPanelVisible(true);
  rightPanel.classList.add('is-chat-mode');
  detailPanel.classList.add('is-chat');
  detailPanel.innerHTML = `
    <section class="chat-modal side-chat" aria-label="与 ${escapeHtml(profile.name)} 对话">
      <header class="chat-header">
        <div class="chat-avatar">
          <img src="${imageFor(profile.name, profile.color, profile.pale, profile.logo)}" alt="${escapeHtml(profile.name)}" draggable="false" />
        </div>
        <div>
          <h2>${escapeHtml(profile.name)}</h2>
          <p>${escapeHtml(profile.intro)}</p>
        </div>
        <button class="modal-close chat-back" type="button" aria-label="返回详情" title="返回详情">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>
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
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M8 10h.01M16 10h.01M8 15c1.2 1.3 2.5 2 4 2s2.8-.7 4-2"></path></svg>
        </button>
        <button class="chat-tool" type="button" data-tool="file" aria-label="发送文件" title="发送文件">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path></svg>
        </button>
        <input class="chat-file-input" type="file" hidden />
        <textarea rows="1" placeholder="输入消息"></textarea>
        <button class="chat-send" type="button" aria-label="发送" title="发送">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
        </button>
      </footer>
    </section>
  `;

  const messagesList = detailPanel.querySelector('.chat-messages');
  const textarea = detailPanel.querySelector('textarea');
  const emojiPanel = detailPanel.querySelector('.emoji-panel');
  const fileInput = detailPanel.querySelector('.chat-file-input');

  function refresh() {
    renderChatMessages(messagesList, chatStore.getMessages(profile.id));
  }

  function sendText() {
    const value = textarea.value.trim();
    if (!value) return;
    chatStore.addText(profile.id, value);
    textarea.value = '';
    refresh();
  }

  detailPanel.querySelector('.chat-back').addEventListener('click', () => renderDetail(item));
  detailPanel.querySelector('.chat-send').addEventListener('click', sendText);
  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendText();
    }
  });
  detailPanel.querySelector('[data-tool="emoji"]').addEventListener('click', () => {
    const isOpen = emojiPanel.classList.toggle('is-open');
    emojiPanel.setAttribute('aria-hidden', String(!isOpen));
  });
  detailPanel.querySelectorAll('[data-emoji]').forEach((button) => {
    button.addEventListener('click', () => {
      chatStore.addEmoji(profile.id, button.dataset.emoji);
      emojiPanel.classList.remove('is-open');
      emojiPanel.setAttribute('aria-hidden', 'true');
      refresh();
    });
  });
  detailPanel.querySelector('[data-tool="file"]').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    chatStore.addFile(profile.id, file);
    fileInput.value = '';
    refresh();
  });

  refresh();
  textarea.focus();
}

function renderEmptyDetail() {
  selectedBubbleId = '';
  rightPanel.classList.remove('is-chat-mode');
  detailPanel.classList.remove('is-chat');
  detailPanel.innerHTML = `
    <div class="empty-detail">
      <strong>选择一个气泡</strong>
      <p>点击中间工作台里的气泡后，详情会显示在这里。</p>
    </div>
  `;
}

function openEditor(item = null) {
  bubbleEditor.classList.add('is-open');
  bubbleEditor.setAttribute('aria-hidden', 'false');
  fields.id.value = item?.id || '';
  fields.title.value = item?.title || item?.label || '';
  fields.image.value = item?.image || '';
  fields.color.value = item?.color || '#ffc107';
  fields.pale.value = item?.pale || '#fff3cd';
  fields.type.value = item?.type || 'spark';
  fields.title.focus();
}

function closeEditor() {
  bubbleEditor.classList.remove('is-open');
  bubbleEditor.setAttribute('aria-hidden', 'true');
  bubbleForm.reset();
  fields.id.value = '';
  fields.color.value = '#ffc107';
  fields.pale.value = '#fff3cd';
  fields.type.value = 'spark';
}

function itemFromBubble(bubble) {
  return bubble.item;
}

function renderBubbleList() {
  const items = bubbleWall.getBubbles().map(itemFromBubble);
  bubbleList.innerHTML = items.map((item) => `
    <article class="bubble-list-item" data-id="${escapeHtml(item.id)}">
      <div class="list-avatar">
        <img src="${imageFor(item.title || item.label, item.color, item.pale, item.image)}" alt="${escapeHtml(item.title || item.label)}" draggable="false" />
      </div>
      <div class="list-content">
        <strong>${escapeHtml(item.title || item.label)}</strong>
        <span>${escapeHtml(item.type || 'spark')}</span>
      </div>
      <div class="list-actions">
        <button class="icon-button" type="button" data-action="edit" aria-label="编辑" title="编辑">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"></path><path d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z"></path></svg>
        </button>
        <button class="icon-button danger" type="button" data-action="delete" aria-label="删除" title="删除">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M6 6l1 15h10l1-15"></path></svg>
        </button>
      </div>
    </article>
  `).join('');
}

const bubbleWall = new BubbleWall({
  layer,
  items: initialItems,
  onBubbleOpen: (bubble) => renderDetail(bubble.item)
});

setupLayoutToggle({ bubbleWall, layoutToggle });
setupSearch({ bubbleWall, searchToggle, searchPanel, searchInput });
renderEmptyDetail();
renderBubbleList();

leftSidebarToggle.addEventListener('click', () => setLeftSidebarVisible(false));
leftSidebarReveal.addEventListener('click', () => setLeftSidebarVisible(true));
rightPanelToggle.addEventListener('click', () => setRightPanelVisible(false));
rightPanelReveal.addEventListener('click', () => setRightPanelVisible(true));

rightPanelResize.addEventListener('pointerdown', (event) => {
  if (appShell.classList.contains('is-right-collapsed')) return;
  isResizingRightPanel = true;
  appShell.classList.add('is-resizing-right-panel');
  rightPanelResize.setPointerCapture(event.pointerId);
  resizeRightPanelFromClientX(event.clientX);
});

rightPanelResize.addEventListener('pointermove', (event) => {
  if (!isResizingRightPanel) return;
  resizeRightPanelFromClientX(event.clientX);
});

function stopRightPanelResize(event) {
  if (!isResizingRightPanel) return;
  isResizingRightPanel = false;
  appShell.classList.remove('is-resizing-right-panel');
  if (rightPanelResize.hasPointerCapture(event.pointerId)) {
    rightPanelResize.releasePointerCapture(event.pointerId);
  }
}

rightPanelResize.addEventListener('pointerup', stopRightPanelResize);
rightPanelResize.addEventListener('pointercancel', stopRightPanelResize);
rightPanelResize.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  const step = event.shiftKey ? 40 : 16;
  setRightPanelWidth(rightPanelWidth + (event.key === 'ArrowLeft' ? step : -step));
});

window.addEventListener('resize', () => setRightPanelWidth(rightPanelWidth));
window.addEventListener('beforeunload', () => bubbleWall.savePositions(true));

menuButtons.forEach((button) => {
  button.addEventListener('click', () => switchView(button.dataset.view));
});

addBubbleButton.addEventListener('click', () => openEditor());
cancelEditButton.addEventListener('click', closeEditor);

bubbleList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  const itemNode = event.target.closest('[data-id]');
  if (!button || !itemNode) return;

  const bubble = bubbleWall.getBubbles().find((entry) => entry.id === itemNode.dataset.id);
  if (!bubble) return;

  if (button.dataset.action === 'edit') {
    openEditor(bubble.item);
    return;
  }

  if (button.dataset.action === 'delete') {
    bubbleWall.removeBubble(bubble.id);
    if (selectedBubbleId === bubble.id) renderEmptyDetail();
    renderBubbleList();
    closeEditor();
  }
});

bubbleForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = fields.title.value.trim();
  if (!title) return;

  const id = fields.id.value || createId(title);
  const data = {
    id,
    title,
    image: fields.image.value.trim(),
    color: fields.color.value,
    pale: fields.pale.value,
    type: fields.type.value
  };

  const existing = fields.id.value ? bubbleWall.updateBubble(fields.id.value, data) : bubbleWall.addBubble(data);
  const bubble = existing || bubbleWall.getBubbles().find((entry) => entry.id === id);
  renderBubbleList();
  closeEditor();
  if (bubble) renderDetail(bubble.item);
});

window.bubbleWall = {
  addBubble: (data) => {
    const bubble = bubbleWall.addBubble(data);
    renderBubbleList();
    return bubble;
  },
  updateBubble: (id, data) => {
    const bubble = bubbleWall.updateBubble(id, data);
    renderBubbleList();
    if (bubble && selectedBubbleId === id) renderDetail(bubble.item);
    return bubble;
  },
  removeBubble: (id) => {
    const removed = bubbleWall.removeBubble(id);
    renderBubbleList();
    if (selectedBubbleId === id) renderEmptyDetail();
    return removed;
  },
  getBubbles: () => bubbleWall.getBubbles(),
  setLayoutMode: (mode) => bubbleWall.setLayoutMode(mode),
  search: (value) => bubbleWall.search(value)
};

