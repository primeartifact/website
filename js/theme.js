/* ============================================
   Theme Toggle Logic
   ============================================ */
(function () {
  const THEME_KEY = 'primeartifact-theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return 'light'; /* Default to light */
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  /* Apply on load (before paint) */
  setTheme(getPreferredTheme());

  /* Toggle handler */
  document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    }

    /* Mobile menu logic has been centralized to navbar.js */
  });
})();
