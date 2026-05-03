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
    
    // Root or index
    if (path === '/' || path.endsWith('/index.html') || path === '') return '';
    
    // Tools directory (usually 2 levels deep: /tools/category/tool.html)
    if (path.includes('/tools/')) {
      var segments = path.split('/').filter(Boolean);
      var toolIndex = segments.indexOf('tools');
      var depth = segments.length - toolIndex - 1;
      
      if (depth >= 2) return '../../';
      if (depth >= 1) return '../';
      return './';
    }
    
    // Pages directory (usually 1 level deep: /pages/about.html)
    if (path.includes('/pages/')) return '../';
    
    // Fallback for flat structures or clean URLs
    return '';
  }

  var base = getBasePath();

  // Tool definitions — single source of truth
  var categories = [
    {
      id: 'ai-tools',
      title: 'AI Artifacts',
      tools: [
        { name: 'PrimeArtifact AI', desc: 'Powerful Llama 4 AI assistant', href: base + 'tools/ai/chat.html' }
      ]
    },
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
      id: 'time-tools',
      title: 'Time Artifacts',
      tools: [
        // { name: 'Work Hours Calculator', desc: 'Calculate IST leave time', href: base + 'tools/utility/work-hours.html' },
        { name: 'Time Calculator', desc: 'Add/subtract time intervals', href: base + 'tools/utility/time-calculator.html' },
        { name: 'Age Calculator', desc: 'Exact age with birthday countdown', href: base + 'tools/utility/age-calculator.html' }
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
      title: 'Utility Artifacts',
      tools: [
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

    html += '<a href="' + base + 'index.html" class="navbar__brand">';
    html += '<img src="' + base + 'assets/logo.png" class="navbar__brand-icon" alt="PrimeArtifact Logo">';
    html += '<span>PrimeArtifact</span>';
    html += '</a>';

    html += '<ul class="navbar__nav" id="main-nav">';
    html += '<li><a href="' + base + 'index.html" class="navbar__link' + (active === 'home' ? ' navbar__link--active' : '') + '">Home</a></li>';
    
    // AI Chat as a primary link
    html += '<li><a href="' + base + 'tools/ai/chat.html" class="navbar__link' + (active === 'ai' ? ' navbar__link--active' : '') + '">AI Chat</a></li>';

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
    html += '<button class="nav-btn" id="nav-search-btn" aria-label="Search Artifacts" title="Search Tools (Cmd+K)">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
    html += '</button>';
    html += '<button class="nav-btn" id="nav-mega-btn" aria-label="App Hub" title="App Hub" style="margin-right:15px;">';
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
      var toolPath = rawMatch[0] + (currentPath.endsWith('.html') ? '.html' : '');
      // Ensure we store it with .html if that's what the homepage uses for matching
      if (!toolPath.endsWith('.html')) toolPath += '.html';
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

  document.addEventListener('DOMContentLoaded', function () {
    var footerElement = document.querySelector('footer');
    if (footerElement) {
      footerElement.className = "footer"; // Standardize CSS globally
      footerElement.innerHTML = buildFooter();
    }

    // --- INJECT DYNAMIC MODALS (Cmd+K & Mega Menu) ---
    var styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .nav-btn {
        background: transparent;
        border: 1px solid var(--border-light);
        color: var(--text-secondary);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
        margin-left: 8px;
      }
      .nav-btn:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
        border-color: var(--text-tertiary);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      .nav-btn svg { width: 18px; height: 18px; }
      
      .demo-modal-overlay {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(11, 13, 18, 0.7);
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        z-index: 99999; display: none; align-items: flex-start; justify-content: center;
        padding-top: 8vh; opacity: 0; transition: opacity 0.2s;
      }
      .demo-modal-overlay.active { display: flex; opacity: 1; }
      .demo-close { position: absolute; top: 20px; right: 30px; font-size: 2rem; color: #fff; cursor: pointer; background: none; border: none; z-index: 10; }
      
      .demo-cmd-k {
        background: var(--glass-bg); border: 1px solid var(--glass-border-edge);
        width: 650px; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); overflow: hidden;
      }
      .demo-cmd-k input { width: 100%; padding: 20px 24px; font-size: 1.3rem; background: transparent; border: none; border-bottom: 1px solid var(--border-light); color: var(--text-primary); }
      .demo-cmd-k input:focus { outline: none; }
      .demo-cmd-list { padding: 12px; max-height: 400px; overflow-y: auto; }
      .demo-cmd-item { padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; border-radius: 8px; cursor: pointer; color: var(--text-primary); font-weight: 600; text-decoration:none; }
      .demo-cmd-item:hover { background: var(--accent-soft); color: var(--accent); }
      .demo-cmd-item span.desc { color: var(--text-tertiary); font-size: 0.85rem; font-weight: 400; pointer-events: none; }

      .demo-mega {
        background: var(--glass-bg); border: 1px solid var(--glass-border-edge);
        width: 1000px; height: 600px; border-radius: 16px; display: flex; box-shadow: 0 30px 60px rgba(0,0,0,0.5); overflow: hidden;
      }
      .demo-mega-sidebar { width: 260px; border-right: 1px solid var(--border-light); padding: 24px; background: rgba(0,0,0,0.1); overflow-y:auto; }
      .demo-mega-sidebar-item { padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; font-weight: 600; color: var(--text-secondary); transition: all 0.2s; }
      .demo-mega-sidebar-item:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
      .demo-mega-sidebar-item.active { background: var(--accent); color: #fff; box-shadow: 0 4px 12px rgba(74, 111, 165, 0.4); }
      .demo-mega-content { flex-grow: 1; padding: 32px; display: block; align-content: start; overflow-y: auto; }
      .demo-mega-card { background: var(--bg-secondary); border: 1px solid var(--border-light); padding: 24px; border-radius: 12px; cursor: pointer; transition: transform 0.2s, border-color 0.2s; text-decoration:none; display:block; }
      .demo-mega-card:hover { transform: translateY(-4px); border-color: var(--accent); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
      .demo-mega-card h3 { margin: 0 0 8px 0; font-size: 1.15rem; color: var(--text-primary); }
      .demo-mega-card p { margin: 0; font-size: 0.9rem; color: var(--text-tertiary); line-height: 1.5; }
    `;
    document.head.appendChild(styleEl);

    // Build Cmd+K items
    var cmdkItemsHTML = '';
    categories.forEach(function(cat) {
      cat.tools.forEach(function(tool) {
        cmdkItemsHTML += '<a href="' + tool.href + '" class="demo-cmd-item" data-name="' + tool.name.toLowerCase() + '" data-desc="' + tool.desc.toLowerCase() + '">' + tool.name + ' <span class="desc">' + cat.title + ' • ' + tool.desc + '</span></a>';
      });
    });

    // Build Mega Menu Categories & Cards
    var megaSidebarHTML = '<div style="padding: 0 16px 15px; font-size: 0.75rem; text-transform: uppercase; color: var(--text-tertiary); font-weight: 700; letter-spacing: 0.05em;">Categories</div>';
    var megaCardsHTML = '';
    
    categories.forEach(function(cat, index) {
      var activeClass = index === 0 ? ' active' : '';
      megaSidebarHTML += '<div class="demo-mega-sidebar-item' + activeClass + '" data-cat="' + cat.id + '">' + cat.title + '</div>';
      
      var displayStyle = index === 0 ? 'grid' : 'none';
      megaCardsHTML += '<div class="mega-cat-group" id="mega-cat-' + cat.id + '" style="display:' + displayStyle + '; grid-template-columns: 1fr 1fr; gap: 24px; align-content: start; margin-bottom: 32px;">';
      megaCardsHTML += '<div class="mega-cat-separator" style="grid-column: 1 / -1; margin-top: 12px; margin-bottom: -8px; padding-bottom: 8px; border-bottom: 1px solid var(--border-light); color: var(--text-secondary); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: none;">' + cat.title + '</div>';
      cat.tools.forEach(function(tool) {
        megaCardsHTML += '<a href="' + tool.href + '" class="demo-mega-card"><h3>' + tool.name + '</h3><p>' + tool.desc + '</p></a>';
      });
      megaCardsHTML += '</div>';
    });

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
        <div class="demo-mega" style="flex-direction: column;">
          <div style="padding: 24px 32px; border-bottom: 1px solid var(--border-light); background: rgba(0,0,0,0.1); position: relative;">
            <input type="text" id="mega-search-input" placeholder="Type to search all artifacts instantly..." style="width: 100%; padding: 18px 48px 18px 24px; font-size: 1.2rem; border-radius: 12px; background: var(--bg-secondary); border: 1px solid var(--border-light); color: var(--text-primary); box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border-light)'">
            <button id="mega-search-clear" style="position: absolute; right: 48px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-tertiary); font-size: 1.5rem; cursor: pointer; display: none;">&times;</button>
          </div>
          <div style="display: flex; flex-grow: 1; overflow: hidden;">
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
      
      var btnSearch = document.getElementById('nav-search-btn');
      var btnMega = document.getElementById('nav-mega-btn');
      
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
      
      if(btnSearch) btnSearch.addEventListener('click', function(e) { e.preventDefault(); openModal(modalCmdK, cmdkInput); });
      if(btnMega) btnMega.addEventListener('click', function(e) { e.preventDefault(); openModal(modalMega, megaSearchInput); });

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

  // --- PWA Service Worker Registration ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(base + 'sw.js').catch(function (err) { });
    });
  }

})();
