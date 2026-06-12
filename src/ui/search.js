export function setupSearch({ bubbleWall, searchToggle, searchPanel, searchInput }) {
  function setSearchVisible(isVisible) {
    searchPanel.classList.toggle('is-open', isVisible);
    searchPanel.setAttribute('aria-hidden', String(!isVisible));
    searchToggle.classList.toggle('is-active', isVisible);
    searchToggle.setAttribute('aria-expanded', String(isVisible));

    if (isVisible) {
      searchInput.focus();
      return;
    }

    searchInput.value = '';
    bubbleWall.search('');
  }

  function isSearchEventTarget(target) {
    return searchPanel.contains(target) || searchToggle.contains(target);
  }

  searchToggle.addEventListener('click', () => {
    setSearchVisible(!searchPanel.classList.contains('is-open'));
  });

  document.addEventListener('pointerdown', (event) => {
    if (!searchPanel.classList.contains('is-open')) return;
    if (isSearchEventTarget(event.target)) return;
    setSearchVisible(false);
  });

  searchInput.addEventListener('input', (event) => {
    bubbleWall.search(event.target.value);
  });

  window.addEventListener('keydown', (event) => {
    const isFindShortcut = event.key.toLocaleLowerCase() === 'f' && (event.ctrlKey || event.metaKey);
    if (isFindShortcut) {
      event.preventDefault();
      setSearchVisible(true);
      searchInput.select();
      return;
    }

    if (event.key === 'Escape') setSearchVisible(false);
  });

  return { setSearchVisible };
}
