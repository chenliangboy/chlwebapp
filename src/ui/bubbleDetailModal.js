import { getProfileDetail } from '../data/profileDetails.js';
import { imageFor } from '../core/artwork.js';
import { escapeHtml } from '../utils/html.js';
import { icons } from './icons.js';

const actionMeta = {
  chat: { label: '对话', icon: 'message' },
  addFriend: { label: '加好友', icon: 'userPlus' },
  more: { label: '更多', icon: 'more' }
};

export function createBubbleDetailModal({ modalManager, onAction }) {
  let currentModal = null;

  function open(item) {
    if (currentModal) currentModal.close();

    const profile = getProfileDetail(item);
    const titleId = `profile-title-${profile.id}`;
    const content = document.createElement('div');
    content.className = 'profile-modal';
    content.innerHTML = `
      <button class="modal-close" type="button" aria-label="关闭详情" title="关闭详情">
        ${icons.close}
      </button>
      <header class="profile-modal-header">
        <div class="profile-avatar">
          <img src="${imageFor(profile.name, profile.color, profile.pale, profile.logo)}" alt="${escapeHtml(profile.name)}" draggable="false" />
        </div>
        <div class="profile-heading">
          <h2 id="${titleId}">${escapeHtml(profile.name)}</h2>
          <p>${escapeHtml(profile.intro)}</p>
        </div>
      </header>
      <div class="profile-modal-body">
        <p>${escapeHtml(profile.description)}</p>
        <div class="profile-tags">
          ${profile.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
      <footer class="profile-actions">
        ${profile.actions.map((action) => {
          const meta = actionMeta[action] || actionMeta.more;
          return `
            <button class="profile-action" type="button" data-action="${action}">
              ${icons[meta.icon]}
              <span>${meta.label}</span>
            </button>
          `;
        }).join('')}
      </footer>
    `;

    currentModal = modalManager.open({
      className: 'profile-modal-overlay',
      content,
      labelledBy: titleId,
      onClose: () => {
        currentModal = null;
      }
    });

    content.querySelector('.modal-close').addEventListener('click', () => currentModal.close());
    content.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        onAction(button.dataset.action, item, profile);
      });
    });
  }

  return { open };
}
