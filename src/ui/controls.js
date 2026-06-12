export function setupLayoutToggle({ bubbleWall, layoutToggle }) {
  function syncButton(mode) {
    layoutToggle.setAttribute('aria-pressed', String(mode === 'grid'));
    const nextTitle = mode === 'grid' ? '切换为自由布局' : '切换为网格布局';
    layoutToggle.setAttribute('aria-label', nextTitle);
    layoutToggle.title = nextTitle;
  }

  bubbleWall.onLayoutModeChange(syncButton);

  layoutToggle.addEventListener('click', () => {
    bubbleWall.setLayoutMode(bubbleWall.layoutMode === 'free' ? 'grid' : 'free');
  });
}
