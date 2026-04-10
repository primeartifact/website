/* ============================================
   PRIMEARTIFACT — Toast Notification System
   Themed inline toast that respects light/dark mode.
   Usage: window.paToast('Your message here');
   ============================================ */
(function () {
  'use strict';

  // ── Inject styles once ─────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    /* Container — bottom-center stack */
    '.pa-toast-container {',
    '  position: fixed;',
    '  top: 80px;',
    '  left: 50%;',
    '  transform: translateX(-50%);',
    '  z-index: 9999;',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  gap: 10px;',
    '  pointer-events: none;',
    '}',

    /* Individual toast */
    '.pa-toast {',
    '  pointer-events: auto;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 10px;',
    '  padding: 12px 20px;',
    '  border-radius: var(--radius-md, 12px);',
    '  background: var(--glass-bg, rgba(255,255,255,0.55));',
    '  backdrop-filter: blur(20px);',
    '  -webkit-backdrop-filter: blur(20px);',
    '  border: 1px solid var(--glass-border, rgba(255,255,255,0.6));',
    '  box-shadow: var(--glass-shadow-lg, 0 16px 48px rgba(0,0,0,0.08));',
    '  font-family: var(--font-family, Inter, sans-serif);',
    '  font-size: 0.85rem;',
    '  font-weight: 500;',
    '  color: var(--text-primary, #1a1d23);',
    '  max-width: min(420px, 90vw);',
    '  line-height: 1.45;',
    '  opacity: 0;',
    '  transform: translateY(-18px) scale(0.96);',
    '  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1),',
    '              transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);',
    '}',

    '.pa-toast.pa-toast--visible {',
    '  opacity: 1;',
    '  transform: translateY(0) scale(1);',
    '}',

    '.pa-toast.pa-toast--exit {',
    '  opacity: 0;',
    '  transform: translateY(-14px) scale(0.96);',
    '}',

    /* Icon pill */
    '.pa-toast__icon {',
    '  flex-shrink: 0;',
    '  width: 28px;',
    '  height: 28px;',
    '  border-radius: 8px;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-size: 14px;',
    '  background: var(--accent-soft, rgba(74,111,165,0.08));',
    '  color: var(--accent, #4a6fa5);',
    '}',

    /* Accent ring pulse on the icon */
    '@keyframes pa-toast-pulse {',
    '  0%   { box-shadow: 0 0 0 0 var(--accent-soft, rgba(74,111,165,0.25)); }',
    '  70%  { box-shadow: 0 0 0 8px transparent; }',
    '  100% { box-shadow: 0 0 0 0 transparent; }',
    '}',
    '.pa-toast--visible .pa-toast__icon {',
    '  animation: pa-toast-pulse 1s ease-out;',
    '}',

    /* Progress bar track at bottom of toast */
    '.pa-toast__progress {',
    '  position: absolute;',
    '  bottom: 0;',
    '  left: 10px;',
    '  right: 10px;',
    '  height: 2px;',
    '  border-radius: 0 0 var(--radius-md, 12px) var(--radius-md, 12px);',
    '  overflow: hidden;',
    '}',

    '.pa-toast__progress-bar {',
    '  height: 100%;',
    '  background: var(--accent, #4a6fa5);',
    '  opacity: 0.45;',
    '  border-radius: 2px;',
    '  width: 100%;',
    '  transform-origin: left;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // ── Ensure container exists ────────────────────────────────────────
  function getContainer() {
    var c = document.querySelector('.pa-toast-container');
    if (!c) {
      c = document.createElement('div');
      c.className = 'pa-toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  // ── Public API ─────────────────────────────────────────────────────
  /**
   * Show a themed toast notification.
   * @param {string} message - Text to display.
   * @param {object} [opts]  - Optional overrides.
   * @param {number} [opts.duration=3500] - Auto-dismiss in ms (0 = stay until clicked).
   * @param {string} [opts.icon='!']      - Single character or emoji for the icon pill.
   */
  window.paToast = function (message, opts) {
    opts = opts || {};
    var duration = opts.duration !== undefined ? opts.duration : 3500;
    var icon = opts.icon || '!';

    var container = getContainer();

    // Build toast element
    var toast = document.createElement('div');
    toast.className = 'pa-toast';
    toast.style.position = 'relative';
    toast.setAttribute('role', 'alert');
    toast.innerHTML =
      '<span class="pa-toast__icon">' + icon + '</span>' +
      '<span>' + message + '</span>' +
      (duration > 0
        ? '<div class="pa-toast__progress"><div class="pa-toast__progress-bar"></div></div>'
        : '');

    container.appendChild(toast);

    // Trigger entrance animation on next frame
    requestAnimationFrame(function () {
      toast.classList.add('pa-toast--visible');
    });

    // Animate progress bar
    if (duration > 0) {
      var bar = toast.querySelector('.pa-toast__progress-bar');
      if (bar) {
        bar.style.transition = 'transform ' + duration + 'ms linear';
        requestAnimationFrame(function () {
          bar.style.transform = 'scaleX(0)';
        });
      }
    }

    // Dismiss function
    function dismiss() {
      toast.classList.remove('pa-toast--visible');
      toast.classList.add('pa-toast--exit');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }

    // Click to dismiss early
    toast.addEventListener('click', dismiss);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  };
})();
