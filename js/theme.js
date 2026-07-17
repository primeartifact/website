/* ============================================
   Theme Toggle Logic + Cache Busting
   ============================================ */
(function () {
  /* ── Prevent FOUC (Flash of Unstyled Content) ───────────────────
     Inject critical CSS for the loader immediately in the <head>
     so it is perfectly styled before the body or main CSS loads.
     ──────────────────────────────────────────────────────────── */
  (function preventFOUC() {
    // Read the user's saved theme to show the correct loader color
    var savedTheme = 'light';
    try { savedTheme = localStorage.getItem('primeartifact-theme') || 'light'; } catch(e) {}
    var isDark = savedTheme === 'dark';
    var bgColor = isDark ? '#0b0d12' : '#f8f9fb';
    var faceBg = isDark ? 'rgba(25, 28, 38, 0.4)' : 'rgba(220, 225, 235, 0.6)';
    var faceBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(74, 111, 165, 0.2)';
    var faceShadow = isDark
      ? 'inset 0 0 15px rgba(107, 143, 196, 0.2), 0 0 10px rgba(0,0,0,0.5)'
      : 'inset 0 0 15px rgba(74, 111, 165, 0.1), 0 0 10px rgba(0,0,0,0.08)';

    var style = document.createElement('style');
    style.id = 'fouc-guard';
    style.innerHTML =
      'html { background-color: ' + bgColor + ' !important; }' +
      'body { opacity: 0; visibility: hidden; }' +
      'body.show-loader { opacity: 1; visibility: visible; }' +
      'body.show-loader > *:not(#page-loader) { opacity: 0 !important; visibility: hidden !important; }' +
      '#page-loader { position: fixed; inset: 0; z-index: 999999; background: ' + bgColor + '; display: flex; align-items: center; justify-content: center; }' +
      '.crystal-cube { width: 60px; height: 60px; perspective: 1000px; }' +
      '.crystal-cube__inner { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; animation: cube-spin 4s infinite linear; }' +
      '.crystal-cube__face { position: absolute; width: 60px; height: 60px; background: ' + faceBg + '; border: 1px solid ' + faceBorder + '; backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; box-shadow: ' + faceShadow + '; }' +
      '.crystal-cube__face img { width: 30px; height: 30px; object-fit: contain; filter: drop-shadow(0 0 5px rgba(255,255,255,0.3)); }' +
      '.crystal-cube__face--front  { transform: translateZ(30px); }' +
      '.crystal-cube__face--back   { transform: rotateY(180deg) translateZ(30px); }' +
      '.crystal-cube__face--right  { transform: rotateY(90deg) translateZ(30px); }' +
      '.crystal-cube__face--left   { transform: rotateY(-90deg) translateZ(30px); }' +
      '.crystal-cube__face--top    { transform: rotateX(90deg) translateZ(30px); }' +
      '.crystal-cube__face--bottom { transform: rotateX(-90deg) translateZ(30px); }' +
      '@keyframes cube-spin { 0% { transform: rotateX(0deg) rotateY(0deg); } 100% { transform: rotateX(360deg) rotateY(360deg); } }' +
      '#page-loader.fade-out { opacity: 0; pointer-events: none; transition: opacity 0.6s ease; }';
    document.head.appendChild(style);
  })();
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
