/* ============================================
   Theme Toggle Logic + Cache Busting
   ============================================ */
(function () {
  /* ── Site Version (Cache Buster) ──────────────────────────────
     Bump this number after every deploy to force all browsers
     to fetch fresh CSS/JS files. Only this one line needs to change.
     ──────────────────────────────────────────────────────────── */
  const SITE_VERSION = '1.0';

  // Append ?v= to all stylesheets and scripts that don't already have it
  (function bustCache() {
    var suffix = '?v=' + SITE_VERSION;
    // Process <link rel="stylesheet"> tags
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href && !href.includes('?v=') && !href.startsWith('http')) {
        links[i].setAttribute('href', href + suffix);
      }
    }
    // Process <script src=""> tags (skip inline scripts and external CDNs)
    var scripts = document.querySelectorAll('script[src]');
    for (var j = 0; j < scripts.length; j++) {
      var src = scripts[j].getAttribute('src');
      if (src && !src.includes('?v=') && !src.startsWith('http')) {
        scripts[j].setAttribute('src', src + suffix);
      }
    }
  })();

  // Force a one-time hard reload when the site version changes.
  // This catches the edge case where theme.js itself was cached with an old version.
  (function versionGate() {
    var VERSION_KEY = 'primeartifact-version';
    var lastSeen = localStorage.getItem(VERSION_KEY);
    if (lastSeen && lastSeen !== SITE_VERSION) {
      // Version mismatch → save new version, then hard reload to bypass all caches
      localStorage.setItem(VERSION_KEY, SITE_VERSION);
      window.location.reload(true);
      return;
    }
    localStorage.setItem(VERSION_KEY, SITE_VERSION);
  })();

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
