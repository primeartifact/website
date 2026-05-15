/* ============================================
   PRIMEARTIFACT — Shared Navbar Component
   Dynamically generates consistent navbar
   across ALL pages with dropdown artifacts menu.
   ============================================ */
(function () {
  'use strict';

  // Determine the base path from current page location
  // Determine the base path (using absolute root for stability)
  function getBasePath() {
    // For local file testing, relative paths are needed, 
    // but for production/server (Netlify), absolute paths are best.
    if (window.location.protocol === 'file:') {
        var path = window.location.pathname;
        if (path.includes('/tools/')) {
            var segments = path.split('/').filter(Boolean);
            var toolIndex = segments.indexOf('tools');
            var depth = segments.length - toolIndex - 1;
            if (depth >= 2) return '../../';
            if (depth >= 1) return '../';
            return './';
        }
        if (path.includes('/pages/')) return '../';
        return '';
    }
    // Default to absolute root for web server
    return '/';
  }

  var base = getBasePath();
  
  // Environment detection for clean URLs vs .html extensions
  var isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname === '[::1]' ||
                window.location.protocol === 'file:';
  var ext = isLocal ? '.html' : '';


  // Tool definitions — single source of truth
  var categories = [
    {
      id: 'ai-tools',
      title: 'AI Artifacts',
      tools: [
        { name: 'PrimeArtifact AI Assistant', desc: 'Powerful, private AI assistant powered by high-performance infrastructure. No login required.', href: base + 'tools/ai/chat' }
      ]
    },
    {
      id: 'text-tools',
      title: 'Text Artifacts',
      tools: [
        { name: 'Word & Character Counter', desc: 'Count words, characters, sentences, and paragraphs in real-time. Estimate reading time.', href: base + 'tools/text/word-counter' },
        { name: 'Text Case Converter', desc: 'Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case, and more.', href: base + 'tools/text/case-converter' },
        { name: 'Fancy Text Generator', desc: 'Generate stylish Unicode text for Instagram bios, WhatsApp status, and more.', href: base + 'tools/text/fancy-text' },
        { name: 'Lorem Ipsum Generator', desc: 'Generate custom placeholder text for your designs and layouts.', href: base + 'tools/text/lorem-ipsum' },
        { name: 'Markdown Viewer', desc: 'Render and preview .md files instantly in your browser. Export to HTML, Markdown, or plain text.', href: base + 'tools/text/md-viewer' },
        { name: 'Diff Checker', desc: 'Compare two blocks of text and highlight the differences instantly.', href: base + 'tools/text/diff-checker' }
      ]
    },
    {
      id: 'time-tools',
      title: 'Time Artifacts',
      tools: [
        { name: 'Time Calculator', desc: 'Add or subtract time intervals, calculate duration between dates, and more.', href: base + 'tools/time/time-calculator' },
        { name: 'Age Calculator', desc: 'Calculate your exact age in years, months, and days with a birthday countdown.', href: base + 'tools/time/age-calculator' }
      ]
    },
    {
      id: 'generators',
      title: 'Generators',
      tools: [
        { name: 'Password Generator', desc: 'Generate strong, secure, and customizable passwords instantly.', href: base + 'tools/generators/password' },
        { name: 'QR Code Generator', desc: 'Create QR codes for any text, URL, or data. Download as PNG.', href: base + 'tools/generators/qr-code' }
      ]
    },
    {
      id: 'converters',
      title: 'Converters',
      tools: [
        { name: 'Color Picker & Converter', desc: 'Pick colors and convert between HEX, RGB, HSL, and RGBA formats.', href: base + 'tools/converters/color-picker' },
        { name: 'Number to Words', desc: 'Convert numbers to words in Indian (Lakhs, Crores) and International systems.', href: base + 'tools/converters/number-to-words' },
        { name: 'URL Encoder / Decoder', desc: 'Encode or decode URLs for safe use in web addresses.', href: base + 'tools/converters/url-encoder' }
      ]
    },
    {
      id: 'everyday-tools',
      title: 'Utility Artifacts',
      tools: [
        { name: 'Online Notepad', desc: 'Quick scratchpad that auto-saves to your browser. Private, no cloud.', href: base + 'tools/utility/notepad' },
        { name: 'Secure Clipboard', desc: 'End-to-End encrypted text sync across devices. Secure and 100% private.', href: base + 'tools/utility/clipboard' }
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
        html += '<a href="' + tool.href + ext + '" class="navbar__dropdown-tool">';
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
    if (path.includes('/about')) return 'about';
    if (path.includes('/contact')) return 'contact';
    if (path.includes('/ai/')) return 'ai';
    if (path.includes('/tools/')) return 'tools';
    return 'home';
  }

  // Build full navbar HTML
  function buildNavbar() {
    var active = getActivePage();
    var html = '';

    html += '<a href="' + base + '" class="navbar__brand">';
    html += '<img src="' + base + 'assets/logo.png" class="navbar__brand-icon" alt="PrimeArtifact Logo">';
    html += '<span>PrimeArtifact</span>';
    html += '</a>';

    html += '<ul class="navbar__nav" id="main-nav">';
    
    // Mobile actions row
    html += '<li class="mobile-nav-actions" style="display:flex; justify-content:center; gap:15px; margin: 10px 0 15px 0; padding-bottom:15px; border-bottom:1px solid var(--border-light);">';
    html += '<button class="nav-btn nav-search-btn" aria-label="Search Artifacts" title="Search Tools (Cmd+K)">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
    html += '</button>';
    html += '<button class="nav-btn nav-mega-btn" aria-label="App Hub" title="App Hub">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>';
    html += '</button>';
    html += '</li>';

    html += '<li><a href="' + base + (isLocal ? 'index.html' : '') + '" class="navbar__link' + (active === 'home' ? ' navbar__link--active' : '') + '">Home</a></li>';
    
    // AI Chat as a primary link
    html += '<li><a href="' + base + 'tools/ai/chat' + ext + '" class="navbar__link' + (active === 'ai' ? ' navbar__link--active' : '') + '">AI Chat</a></li>';

    // Tools dropdown
    html += '<li class="navbar__dropdown" id="tools-dropdown">';
    html += '<a href="#" class="navbar__dropdown-toggle" aria-expanded="false" aria-haspopup="true">';
    html += '<span>Artifacts</span>';
    html += '<span class="navbar__dropdown-chevron">▼</span>';
    html += '</a>';
    html += buildDropdownMenu();
    html += '</li>';

    html += '<li><a href="' + base + 'pages/about' + ext + '" class="navbar__link' + (active === 'about' ? ' navbar__link--active' : '') + '">About</a></li>';
    html += '<li><a href="' + base + 'pages/contact' + ext + '" class="navbar__link' + (active === 'contact' ? ' navbar__link--active' : '') + '">Contact</a></li>';
    html += '</ul>';

    html += '<div class="navbar__actions">';
    html += '<button class="nav-btn nav-search-btn desktop-nav-action" id="nav-search-btn" aria-label="Search Artifacts" title="Search Tools (Cmd+K)">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
    html += '</button>';
    html += '<button class="nav-btn nav-mega-btn desktop-nav-action" id="nav-mega-btn" aria-label="App Hub" title="App Hub" style="margin-right:15px;">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>';
    html += '</button>';
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
    var rawMatch = currentPath.match(/tools\/[a-z-]+\/[a-z-]+/);
    if (rawMatch) {
      var toolPath = rawMatch[0];
      // Store it without extension to match the new URL structure
      try {
        var recentObjStr = localStorage.getItem('prime_recent') || '[]';
        var recent = JSON.parse(recentObjStr);
        recent = recent.filter(function (i) { return i !== toolPath && i !== (toolPath + '.html'); });
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
      '<p>&copy; 2026 <a href="' + base + '">PrimeArtifact</a> — Free online artifacts. No login. No tracking. No nonsense.</p>' +
      '<div style="display:flex;gap:var(--space-md);font-size:0.82rem;">' +
      '<a href="' + base + 'pages/about' + ext + '" style="color:var(--text-tertiary);text-decoration:none;">About</a>' +
      '<a href="' + base + 'pages/privacy' + ext + '" style="color:var(--text-tertiary);text-decoration:none;">Privacy</a>' +
      '<a href="' + base + 'pages/contact' + ext + '" style="color:var(--text-tertiary);text-decoration:none;">Contact</a>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var footerElement = document.querySelector('footer');
    if (footerElement) {
      footerElement.className = "footer"; // Standardize CSS globally
      footerElement.innerHTML = buildFooter();
    }

    // --- INJECT DYNAMIC MODALS (Cmd+K & Mega Menu) ---

    // Build Cmd+K items
    var cmdkItemsHTML = '';
    categories.forEach(function(cat) {
      cat.tools.forEach(function(tool) {
        cmdkItemsHTML += '<a href="' + tool.href + ext + '" class="demo-cmd-item" data-name="' + tool.name.toLowerCase() + '" data-desc="' + tool.desc.toLowerCase() + '">' + tool.name + ' <span class="desc">' + cat.title + ' • ' + tool.desc + '</span></a>';
      });
    });

    // Build Mega Menu Categories & Cards
    var megaSidebarHTML = '<div class="demo-mega-sidebar-title">Categories</div>';
    megaSidebarHTML += '<div class="demo-mega-sidebar-items-scroll">';
    var megaCardsHTML = '';
    
    categories.forEach(function(cat, index) {
      var activeClass = index === 0 ? ' active' : '';
      megaSidebarHTML += '<div class="demo-mega-sidebar-item' + activeClass + '" data-cat="' + cat.id + '">' + cat.title + '</div>';
      
      var displayStyle = index === 0 ? 'grid' : 'none';
      megaCardsHTML += '<div class="mega-cat-group" id="mega-cat-' + cat.id + '" style="display:' + displayStyle + '; grid-template-columns: 1fr 1fr; gap: 24px; align-content: start; margin-bottom: 32px;">';
      megaCardsHTML += '<div class="mega-cat-separator" style="grid-column: 1 / -1; margin-top: 12px; margin-bottom: -8px; padding-bottom: 8px; border-bottom: 1px solid var(--border-light); color: var(--text-secondary); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: none;">' + cat.title + '</div>';
      cat.tools.forEach(function(tool) {
        megaCardsHTML += '<a href="' + tool.href + ext + '" class="demo-mega-card"><h3>' + tool.name + '</h3><p>' + tool.desc + '</p></a>';
      });
      megaCardsHTML += '</div>';
    });
    megaSidebarHTML += '</div>';

    var wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <!-- CMD+K MODAL -->
      <div class="demo-modal-overlay" id="modal-cmdk"><button class="demo-close">&times;</button>
        <div class="demo-cmd-k">
          <input type="text" id="cmdk-input" placeholder="Search for tools, artifacts, or commands... (e.g. 'Time')">
          <div class="demo-cmd-list" id="cmdk-list">
            ${cmdkItemsHTML}
          </div>
        </div>
      </div>
      
      <!-- MEGA MENU MODAL -->
      <div class="demo-modal-overlay" id="modal-mega"><button class="demo-close">&times;</button>
        <div class="demo-mega">
          <div class="mega-search-bar">
            <input type="text" id="mega-search-input" placeholder="Type to search all artifacts instantly...">
            <button id="mega-search-clear">&times;</button>
          </div>
          <div class="mega-container">
            <div class="demo-mega-sidebar" id="mega-sidebar">
              ${megaSidebarHTML}
            </div>
            <div class="demo-mega-content" id="mega-content">
              ${megaCardsHTML}
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    // Bind Modals JS
    setTimeout(function() {
      var modalCmdK = document.getElementById('modal-cmdk');
      var modalMega = document.getElementById('modal-mega');
      var cmdkInput = document.getElementById('cmdk-input');
      var megaSearchInput = document.getElementById('mega-search-input');
      var megaSearchClear = document.getElementById('mega-search-clear');
      
      var btnsSearch = document.querySelectorAll('.nav-search-btn');
      var btnsMega = document.querySelectorAll('.nav-mega-btn');
      
      function openModal(m, inputToFocus) {
        m.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (inputToFocus) setTimeout(function(){ inputToFocus.focus(); }, 50);
      }
      
      function closeModal(m) {
        m.classList.remove('active');
        document.body.style.overflow = '';
        if (m.id === 'modal-mega' && megaSearchInput) {
          megaSearchInput.value = '';
          megaSearchInput.dispatchEvent(new Event('input'));
        }
        if (m.id === 'modal-cmdk' && cmdkInput) {
          cmdkInput.value = '';
          cmdkInput.dispatchEvent(new Event('input'));
        }
      }
      
      btnsSearch.forEach(function(btn) { btn.addEventListener('click', function(e) { e.preventDefault(); openModal(modalCmdK, cmdkInput); }); });
      btnsMega.forEach(function(btn) { btn.addEventListener('click', function(e) { e.preventDefault(); openModal(modalMega, megaSearchInput); }); });

      // Keyboard Shortcut Cmd+K
      document.addEventListener('keydown', function(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          openModal(modalCmdK, cmdkInput);
        }
        if (e.key === 'Escape') {
          if (modalCmdK.classList.contains('active')) closeModal(modalCmdK);
          if (modalMega.classList.contains('active')) closeModal(modalMega);
        }
      });

      // Close on backdrop/X
      document.querySelectorAll('.demo-modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function(e) {
          if (e.target === overlay || e.target.classList.contains('demo-close')) closeModal(overlay);
        });
      });
      
      if (megaSearchClear) {
        megaSearchClear.addEventListener('click', function(e) {
          e.preventDefault();
          megaSearchInput.value = '';
          megaSearchInput.dispatchEvent(new Event('input'));
          megaSearchInput.focus();
        });
      }

      // Cmd+K Filtering
      var cmdkItems = document.querySelectorAll('.demo-cmd-item');
      cmdkInput.addEventListener('input', function(e) {
        var query = e.target.value.toLowerCase();
        cmdkItems.forEach(function(item) {
          if (item.dataset.name.includes(query) || item.dataset.desc.includes(query)) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });

      // Mega Menu Search Filtering
      var megaCards = document.querySelectorAll('.demo-mega-card');
      var megaSidebarItems = document.querySelectorAll('.demo-mega-sidebar-item');
      var megaCatGroups = document.querySelectorAll('.mega-cat-group');
      var lastActiveMegaCategory = megaSidebarItems[0]; // Track the active category

      if (megaSearchInput) {
        megaSearchInput.addEventListener('input', function(e) {
          var query = e.target.value.toLowerCase();
          
          if (megaSearchClear) megaSearchClear.style.display = query.length > 0 ? 'block' : 'none';
          
          if (query.trim() !== '') {
            // Deselect categories while searching globally
            var currentActive = document.querySelector('.demo-mega-sidebar-item.active');
            if (currentActive) lastActiveMegaCategory = currentActive;
            megaSidebarItems.forEach(function(i) { i.classList.remove('active'); });

            megaCatGroups.forEach(function(group) {
              var hasVisibleCards = false;
              var cards = group.querySelectorAll('.demo-mega-card');
              
              cards.forEach(function(card) {
                var title = card.querySelector('h3').textContent.toLowerCase();
                var desc = card.querySelector('p').textContent.toLowerCase();
                if (title.includes(query) || desc.includes(query)) {
                  card.style.display = 'block';
                  hasVisibleCards = true;
                } else {
                  card.style.display = 'none';
                }
              });
              
              var separator = group.querySelector('.mega-cat-separator');
              if (separator) separator.style.display = hasVisibleCards ? 'block' : 'none';
              group.style.display = hasVisibleCards ? 'grid' : 'none';
            });
          } else {
            // Restore last active category when search is cleared
            if (lastActiveMegaCategory) lastActiveMegaCategory.click();
            
            megaCatGroups.forEach(function(group) {
              var separator = group.querySelector('.mega-cat-separator');
              if (separator) separator.style.display = 'none';
            });
            megaCards.forEach(function(card) { card.style.display = 'block'; });
          }
        });
      }

      // Mega Menu Category Switching
      
      megaSidebarItems.forEach(function(item) {
        item.addEventListener('click', function() {
          
          if (megaSearchInput && megaSearchInput.value.trim() !== '') {
            megaSearchInput.value = '';
            if (megaSearchClear) megaSearchClear.style.display = 'none';
            megaCards.forEach(function(card) { card.style.display = 'block'; });
            megaCatGroups.forEach(function(group) {
              var separator = group.querySelector('.mega-cat-separator');
              if (separator) separator.style.display = 'none';
            });
          }

          megaSidebarItems.forEach(function(i) { i.classList.remove('active'); });
          this.classList.add('active');
          lastActiveMegaCategory = this;
          
          var targetId = 'mega-cat-' + this.dataset.cat;
          megaCatGroups.forEach(function(group) {
            if (group.id === targetId) {
              group.style.display = 'grid';
            } else {
              group.style.display = 'none';
            }
          });
        });
      });
    }, 100);
  });

  // --- Cache Busting & Service Worker Cleanup ---
  // Unregister any active service workers to clear stale legacy caches
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (var i = 0; i < registrations.length; i++) {
        registrations[i].unregister().then(function(success) {
          if (success) {
            console.log('Legacy cache cleared: Service Worker unregistered.');
          }
        });
      }
    });
  }

  // ── Inject global FAQ handler ────────────────────────────────────────
  // Dynamically loads faq.js so every page with a .faq-modal-overlay
  // gets click-outside and Escape-to-close without any per-page changes.
  (function injectFaq() {
    var s = document.createElement('script');
    s.src = getBasePath() + 'js/faq.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

})();
