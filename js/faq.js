/* ============================================
   PRIMEARTIFACT — Global FAQ Modal Handler
   Auto-wires open/close for any faq-modal-overlay on the page.
   Supports:
     - Overlay ID: faq-modal OR faq-overlay
     - Open button: any element with id containing "open-faq" or class "faq-open"
     - Close button: any element with id containing "close-faq" or class "faq-modal-close"
     - Click outside the modal box to close
     - Press Escape to close
   ============================================ */
(function () {
  'use strict';

  function init() {
    // Find the overlay — pages use either id="faq-modal" or id="faq-overlay"
    var overlay = document.getElementById('faq-modal') || document.getElementById('faq-overlay');
    if (!overlay) return;

    var modalBox = overlay.querySelector('.faq-modal');

    // ── Open ────────────────────────────────────────────────────────────
    var openBtns = document.querySelectorAll('[id*="open-faq"], .faq-open');
    openBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent page scroll behind modal
      });
    });

    // ── Close (X button) ────────────────────────────────────────────────
    var closeBtns = overlay.querySelectorAll('[id*="close-faq"], .faq-modal-close');
    closeBtns.forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    // ── Click outside the modal box ─────────────────────────────────────
    overlay.addEventListener('click', function (e) {
      if (modalBox && !modalBox.contains(e.target)) {
        closeModal();
      }
    });

    // ── Escape key ──────────────────────────────────────────────────────
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeModal();
      }
    });

    function closeModal() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Run immediately if DOM is already parsed (dynamic injection case),
  // otherwise wait for DOMContentLoaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
