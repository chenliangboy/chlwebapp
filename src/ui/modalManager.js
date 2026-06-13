export function createModalManager() {
  const root = document.createElement('div');
  root.className = 'modal-root';
  root.setAttribute('aria-live', 'polite');
  document.body.appendChild(root);

  const stack = [];

  function updateBodyState() {
    document.body.classList.toggle('has-modal-open', stack.length > 0);
  }

  function closeTop() {
    const current = stack[stack.length - 1];
    if (current) current.close();
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') closeTop();
  }

  window.addEventListener('keydown', handleKeyDown);

  function open({ className, content, labelledBy, onClose }) {
    const overlay = document.createElement('div');
    overlay.className = `modal-overlay ${className || ''}`.trim();

    const dialog = document.createElement('section');
    dialog.className = 'modal-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    if (labelledBy) dialog.setAttribute('aria-labelledby', labelledBy);

    dialog.appendChild(content);
    overlay.appendChild(dialog);
    root.appendChild(overlay);

    const entry = {
      close() {
        const index = stack.indexOf(entry);
        if (index !== -1) stack.splice(index, 1);
        overlay.remove();
        updateBodyState();
        if (onClose) onClose();
      }
    };

    overlay.addEventListener('pointerdown', (event) => {
      if (event.target === overlay) entry.close();
    });

    stack.push(entry);
    updateBodyState();

    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      const focusTarget = dialog.querySelector('[data-autofocus]') || dialog.querySelector('button, input, textarea');
      if (focusTarget) focusTarget.focus();
    });

    return entry;
  }

  return { open, closeTop };
}
