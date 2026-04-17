/* ============================================
   PRIMEARTIFACT — Shared Navbar Component
   Dynamically generates consistent navbar
   across ALL pages with dropdown artifacts menu.
   ============================================ */
(function () {
  'use strict';

  // Determine the base path from current page location
  function getBasePath() {
    var path = window.location.pathname;
    // tools/text/*.html or tools/generators/*.html → ../../
    if (path.includes('/tools/')) return '../../';
    // pages/*.html → ../
    if (path.includes('/pages/')) return '../';
    // index.html (root) → ./
    return '';
  }

  var base = getBasePath();

  // Build the homepage anchor href
  // If we're already on the homepage, use #id directly. Otherwise, use full path.
  function homeAnchor(sectionId) {
    var isHome = window.location.pathname.endsWith('index.html') ||
      window.location.pathname.endsWith('/') ||
      window.location.pathname === '';
    if (isHome) return '#' + sectionId;
    return base + 'index.html#' + sectionId;
  }

  // Tool definitions — single source of truth
  var categories = [
    {
      id: 'text-tools',
      title: 'Text Artifacts',
      tools: [
        { name: 'Word & Character Counter', desc: 'Count words, characters, and reading time', href: base + 'tools/text/word-counter.html' },
        { name: 'Text Case Converter', desc: 'UPPERCASE, lowercase, Title Case, and more', href: base + 'tools/text/case-converter.html' },
        { name: 'Fancy Text Generator', desc: 'Stylish Unicode text for social media', href: base + 'tools/text/fancy-text.html' },
        { name: 'Lorem Ipsum Generator', desc: 'Placeholder text for designs', href: base + 'tools/text/lorem-ipsum.html' }
      ]
    },
    {
      id: 'generators',
      title: 'Generators',
      tools: [
        { name: 'Password Generator', desc: 'Strong, secure passwords instantly', href: base + 'tools/generators/password.html' },
        { name: 'QR Code Generator', desc: 'Create QR codes for any text or URL', href: base + 'tools/generators/qr-code.html' }
      ]
    },
    {
      id: 'converters',
      title: 'Converters',
      tools: [
        { name: 'Color Picker & Converter', desc: 'HEX, RGB, HSL color conversion', href: base + 'tools/converters/color-picker.html' },
        { name: 'Number to Words', desc: 'Indian & International number systems', href: base + 'tools/converters/number-to-words.html' },
        { name: 'URL Encoder / Decoder', desc: 'Encode or decode URLs safely', href: base + 'tools/converters/url-encoder.html' }
      ]
    },
    {
      id: 'everyday-tools',
      title: 'Everyday Artifacts',
      tools: [
        { name: 'Age Calculator', desc: 'Exact age with birthday countdown', href: base + 'tools/utility/age-calculator.html' },
        { name: 'Online Notepad', desc: 'Auto-saves to your browser privately', href: base + 'tools/utility/notepad.html' },
        { name: 'Secure Clipboard', desc: 'E2E Encrypted device sync', href: base + 'tools/utility/clipboard.html' }
      ]
    }
  ];

  // Build dropdown menu HTML
  function buildDropdownMenu() {
    var html = '<div class="navbar__dropdown-backdrop"></div>';
    html += '<div class="navbar__dropdown-menu">';
    categories.forEach(function (cat) {
      html += '<div class="navbar__dropdown-category">';
      html += '<div class="navbar__dropdown-category-title">' + cat.title + '</div>';
      cat.tools.forEach(function (tool) {
        html += '<a href="' + tool.href + '" class="navbar__dropdown-tool">';
        html += '<span class="navbar__dropdown-tool-name">' + tool.name + '</span>';
        html += '<span class="navbar__dropdown-tool-desc">' + tool.desc + '</span>';
        html += '</a>';
      });
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  // Detect current page to highlight active link
  function getActivePage() {
    var path = window.location.pathname;
    if (path.includes('/pages/about')) return 'about';
    if (path.includes('/pages/contact')) return 'contact';
    if (path.includes('/tools/')) return 'tools';
    return 'home';
  }

  // Build full navbar HTML
  function buildNavbar() {
    var active = getActivePage();
    var html = '';

    html += '<a href="' + base + 'index.html" class="navbar__brand">';
    html += '<img src="' + base + 'assets/logo.png" class="navbar__brand-icon" alt="PrimeArtifact Logo">';
    html += '<span>PrimeArtifact</span>';
    html += '</a>';

    html += '<ul class="navbar__nav" id="main-nav">';
    html += '<li><a href="' + base + 'index.html" class="navbar__link' + (active === 'home' ? ' navbar__link--active' : '') + '">Home</a></li>';

    // Tools dropdown
    html += '<li class="navbar__dropdown" id="tools-dropdown">';
    html += '<a href="#" class="navbar__dropdown-toggle" aria-expanded="false" aria-haspopup="true">';
    html += '<span>Artifacts</span>';
    html += '<span class="navbar__dropdown-chevron">▼</span>';
    html += '</a>';
    html += buildDropdownMenu();
    html += '</li>';

    html += '<li><a href="' + base + 'pages/about.html" class="navbar__link' + (active === 'about' ? ' navbar__link--active' : '') + '">About</a></li>';
    html += '<li><a href="' + base + 'pages/contact.html" class="navbar__link' + (active === 'contact' ? ' navbar__link--active' : '') + '">Contact</a></li>';
    html += '</ul>';

    html += '<div class="navbar__actions">';
    html += '<button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">';
    html += '<span class="theme-toggle__icon theme-toggle__icon--sun">☀</span>';
    html += '<span class="theme-toggle__icon theme-toggle__icon--moon">☾</span>';
    html += '</button>';
    html += '<button class="navbar__menu-btn" id="menu-toggle" aria-label="Menu" aria-expanded="false">☰</button>';
    html += '</div>';

    return html;
  }

  // Inject navbar into the <nav class="navbar"> element
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.innerHTML = buildNavbar();
    navbar.setAttribute('role', 'navigation');
    navbar.setAttribute('aria-label', 'Main navigation');
  }

  // --- Event Listeners ---

  // Dropdown toggle
  var dropdown = document.getElementById('tools-dropdown');
  if (dropdown) {
    var toggle = dropdown.querySelector('.navbar__dropdown-toggle');
    var backdrop = dropdown.querySelector('.navbar__dropdown-backdrop');

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      var isOpen = dropdown.classList.contains('navbar__dropdown--open');
      dropdown.classList.toggle('navbar__dropdown--open');
      toggle.setAttribute('aria-expanded', !isOpen);
    });

    // Close on backdrop click
    if (backdrop) {
      backdrop.addEventListener('click', function () {
        dropdown.classList.remove('navbar__dropdown--open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dropdown.classList.contains('navbar__dropdown--open')) {
        dropdown.classList.remove('navbar__dropdown--open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on click outside
    document.addEventListener('click', function (e) {
      if (dropdown.classList.contains('navbar__dropdown--open') && !dropdown.contains(e.target)) {
        dropdown.classList.remove('navbar__dropdown--open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Mobile menu toggle
  var menuBtn = document.getElementById('menu-toggle');
  var nav = document.getElementById('main-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = nav.classList.contains('navbar__nav--open');
      nav.classList.toggle('navbar__nav--open');
      menuBtn.setAttribute('aria-expanded', !isOpen);
      menuBtn.innerHTML = !isOpen ? '✕' : '☰';
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });

    // Close menu when a standard link is clicked (useful for mobile anchors)
    nav.querySelectorAll('.navbar__link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('navbar__nav--open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = '☰';
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking completely outside the navbar
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('navbar__nav--open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
        nav.classList.remove('navbar__nav--open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = '☰';
        document.body.style.overflow = '';
      }
    });
  }

  // Highlight "Tools" toggle if we're on a artifact page
  if (getActivePage() === 'tools' && toggle) {
    toggle.style.color = 'var(--text-primary)';
    toggle.style.background = 'var(--accent-soft)';
  }

  // Inject global toast notification script
  var toastScript = document.createElement('script');
  toastScript.src = base + 'js/toast.js';
  document.body.appendChild(toastScript);

  // Inject global effects script (3D cards, particles)
  var effectsScript = document.createElement('script');
  effectsScript.src = base + 'js/effects.js';
  effectsScript.defer = true;
  document.body.appendChild(effectsScript);

  // Inject Font Awesome for icons across all tools
  var faLink = document.createElement('link');
  faLink.rel = 'stylesheet';
  faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(faLink);

  // --- Track Recent Artifacts ---
  var currentPath = window.location.pathname;
  if (currentPath.includes('/tools/')) {
    var rawMatch = currentPath.match(/tools\/[a-z-]+\/[a-z-]+\.html/);
    if (rawMatch) {
      var toolPath = currentPath.substring(currentPath.indexOf('/tools/') + 1);
      try {
        var recentObjStr = localStorage.getItem('prime_recent') || '[]';
        var recent = JSON.parse(recentObjStr);
        recent = recent.filter(function (i) { return i !== toolPath; });
        recent.unshift(toolPath);
        if (recent.length > 4) recent.pop();
        localStorage.setItem('prime_recent', JSON.stringify(recent));
      } catch (e) { }
    }
  }

  // --- Global Footer Injection ---
  function buildFooter() {
    return '<div class="container">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-md);">' +
        '<p>&copy; 2026 <a href="' + base + 'index.html">PrimeArtifact</a> — Free online artifacts. No login. No tracking. No nonsense.</p>' +
        '<div style="display:flex;gap:var(--space-md);font-size:0.82rem;">' +
          '<a href="' + base + 'pages/about.html" style="color:var(--text-tertiary);text-decoration:none;">About</a>' +
          '<a href="' + base + 'pages/privacy.html" style="color:var(--text-tertiary);text-decoration:none;">Privacy</a>' +
          '<a href="' + base + 'pages/contact.html" style="color:var(--text-tertiary);text-decoration:none;">Contact</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  document.addEventListener('DOMContentLoaded', function() {
    var footerElement = document.querySelector('footer');
    if (footerElement) {
      footerElement.className = "footer"; // Standardize CSS globally
      footerElement.innerHTML = buildFooter();
    }
  });

  // --- PWA Service Worker Registration ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(base + 'sw.js').catch(function (err) { });
    });
  }

})();
