(function () {
  'use strict';

  var TTL_OPTIONS = {
    '1h': { label: '1 hour', seconds: 3600 },
    '24h': { label: '24 hours', seconds: 86400 },
    '7d': { label: '7 days', seconds: 604800 }
  };
  var MAX_PLAINTEXT_BYTES = 65536;

  document.addEventListener('DOMContentLoaded', function () {
    var els = {
      composeText: document.getElementById('clip-compose-text'),
      textCounter: document.getElementById('clip-text-counter'),
      ttl: document.getElementById('clip-ttl'),
      burnAfterRead: document.getElementById('clip-burn-after-read'),
      createBtn: document.getElementById('clip-create-btn'),
      createStatus: document.getElementById('clip-create-status'),
      shareResults: document.getElementById('clip-share-results'),
      shortCode: document.getElementById('clip-short-code'),
      secretKey: document.getElementById('clip-secret-key'),
      shareLink: document.getElementById('clip-share-link'),
      expiresAt: document.getElementById('clip-expires-at'),
      qrCanvas: document.getElementById('clip-qr'),
      qrEmpty: document.getElementById('clip-qr-empty'),
      pasteLink: document.getElementById('clip-link-input'),
      receiveCode: document.getElementById('clip-receive-code'),
      receiveSecret: document.getElementById('clip-receive-secret'),
      resolveBtn: document.getElementById('clip-resolve-btn'),
      fetchBtn: document.getElementById('clip-fetch-btn'),
      fetchStatus: document.getElementById('clip-fetch-status'),
      metadataCard: document.getElementById('clip-metadata'),
      metadataCode: document.getElementById('clip-meta-code'),
      metadataExpiry: document.getElementById('clip-meta-expiry'),
      metadataReads: document.getElementById('clip-meta-reads'),
      metadataMode: document.getElementById('clip-meta-mode'),
      outputPanel: document.getElementById('clip-output-panel'),
      outputText: document.getElementById('clip-output-text')
    };

    var state = {
      currentClipId: '',
      currentSecret: '',
      metadata: null
    };

    function notify(message, icon) {
      if (window.paToast) {
        window.paToast(message, { icon: icon || '!' });
      }
    }

    function setStatus(el, type, message) {
      if (!el) return;
      if (!message) {
        el.textContent = '';
        el.dataset.state = '';
        return;
      }
      el.textContent = message;
      el.dataset.state = type || 'info';
    }

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function formatDateTime(isoString) {
      try {
        return new Date(isoString).toLocaleString();
      } catch (err) {
        return isoString;
      }
    }

    function updateCounter() {
      var bytes = CryptoUtils.getPlaintextByteLength(els.composeText.value);
      els.textCounter.textContent = formatBytes(bytes) + ' / 64 KB';
      els.textCounter.dataset.state = bytes > MAX_PLAINTEXT_BYTES ? 'danger' : '';
    }

    function initCustomSelect(wrapperId, btnId, menuId, inputId) {
      var wrapper = document.getElementById(wrapperId);
      var button = document.getElementById(btnId);
      var menu = document.getElementById(menuId);
      var input = document.getElementById(inputId);
      if (!wrapper || !button || !menu || !input) return;

      function closeMenu() {
        menu.classList.remove('open');
        button.classList.remove('open');
      }

      button.addEventListener('click', function (e) {
        e.stopPropagation();
        menu.classList.toggle('open');
        button.classList.toggle('open');
      });

      menu.querySelectorAll('.custom-select-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
          e.stopPropagation();
          menu.querySelectorAll('.custom-select-item').forEach(function (entry) {
            entry.classList.remove('active');
          });
          item.classList.add('active');
          input.value = item.getAttribute('data-value');
          button.textContent = item.textContent;
          closeMenu();
        });
      });

      document.addEventListener('click', function (e) {
        if (!wrapper.contains(e.target)) {
          closeMenu();
        }
      });
    }

    function setShareResults(result, secret) {
      state.currentClipId = result.clip.id;
      state.currentSecret = secret;
      state.metadata = result.clip;
      var hash = CryptoUtils.buildClipboardHash(result.clip.id, secret);
      var shareLink = window.location.origin + window.location.pathname + hash;
      els.shortCode.value = result.clip.shortCode;
      els.secretKey.value = secret;
      els.shareLink.value = shareLink;
      els.expiresAt.value = formatDateTime(result.clip.expiresAt);
      els.shareResults.style.display = 'block';
      renderQr(shareLink);
      renderMetadata(result.clip);
    }

    function renderQr(link) {
      if (!window.qrcode) return;
      els.qrEmpty.style.display = 'none';
      els.qrCanvas.innerHTML = '';
      try {
        var qr = qrcode(0, 'M');
        qr.addData(link);
        qr.make();
        els.qrCanvas.innerHTML = qr.createImgTag(5, 0);
      } catch (err) {
        els.qrEmpty.style.display = 'block';
        els.qrEmpty.textContent = 'QR preview unavailable for this share link.';
      }
    }

    function normalizeCode(value) {
      var compact = (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      if (compact.length > 3) {
        return compact.slice(0, 3) + '-' + compact.slice(3);
      }
      return compact;
    }

    function buildFetchContext() {
      var linkValue = (els.pasteLink.value || '').trim();
      if (linkValue) {
        return parseShareLink(linkValue);
      }

      var code = normalizeCode(els.receiveCode.value);
      var secret = (els.receiveSecret.value || '').trim();
      if (!code || code.length !== 7) {
        throw new Error('Enter a valid short code or paste a share link.');
      }
      if (!secret) {
        throw new Error('Enter the secret key that was shared with the code.');
      }
      return {
        code: code,
        secret: secret
      };
    }

    function parseShareLink(raw) {
      var value = (raw || '').trim();
      try {
        var parsed = new URL(value, window.location.origin + window.location.pathname);
        var fragment = CryptoUtils.parseClipboardHash(parsed.hash);
        if (!fragment.clip || !fragment.key) {
          throw new Error('Link is missing clip details.');
        }
        return {
          clipId: fragment.clip,
          secret: fragment.key,
          link: parsed.toString()
        };
      } catch (err) {
        throw new Error('Paste a complete PrimeArtifact share link.');
      }
    }

    async function apiFetch(url, options) {
      var response = await fetch(url, options);
      var payload;
      try {
        payload = await response.json();
      } catch (err) {
        throw new Error('Unexpected server response.');
      }

      if (!response.ok || !payload.ok) {
        var message = payload && payload.error && payload.error.message ? payload.error.message : 'Request failed.';
        var code = payload && payload.error && payload.error.code ? payload.error.code : 'REQUEST_FAILED';
        var error = new Error(message);
        error.code = code;
        throw error;
      }

      return payload;
    }

    async function createClip() {
      var text = els.composeText.value;
      var bytes = CryptoUtils.getPlaintextByteLength(text);
      if (!text.trim()) {
        setStatus(els.createStatus, 'error', 'Enter some text before creating a secure clip.');
        return;
      }
      if (bytes > MAX_PLAINTEXT_BYTES) {
        setStatus(els.createStatus, 'error', 'Text exceeds the 64 KB secure clipboard limit.');
        return;
      }

      var ttl = els.ttl.value;
      if (!TTL_OPTIONS[ttl]) {
        setStatus(els.createStatus, 'error', 'Choose a valid expiry window.');
        return;
      }

      els.createBtn.disabled = true;
      setStatus(els.createStatus, 'info', 'Encrypting in your browser and creating a secure share...');
      els.shareResults.style.display = 'none';

      try {
        var secret = CryptoUtils.createRandomSecret();
        var envelope = await CryptoUtils.encryptClip(text, secret);
        var payload = {
          envelope: envelope,
          ttl: ttl,
          burnAfterRead: !!els.burnAfterRead.checked
        };

        var result = await apiFetch('/api/clip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        setShareResults(result, secret);
        setStatus(els.createStatus, 'success', 'Secure clip created. Share the link, or send the code and secret separately.');
        notify('Secure share link created.', '🔐');
      } catch (err) {
        setStatus(els.createStatus, 'error', err.message || 'Unable to create the secure clip right now.');
      } finally {
        els.createBtn.disabled = false;
      }
    }

    function renderMetadata(meta) {
      if (!meta) {
        els.metadataCard.style.display = 'none';
        return;
      }

      els.metadataCode.textContent = meta.shortCode || 'Pending';
      els.metadataExpiry.textContent = formatDateTime(meta.expiresAt);
      els.metadataReads.textContent = meta.maxReads === 1
        ? (meta.readCount || 0) + ' / 1'
        : String(meta.readCount || 0);
      els.metadataMode.textContent = meta.maxReads === 1 ? 'Burn after first read' : 'Readable until expiry';
      els.metadataCard.style.display = 'grid';
    }

    async function lookupClip(context) {
      if (context.clipId) {
        var metaResult = await apiFetch('/api/clip/' + encodeURIComponent(context.clipId), {
          method: 'GET'
        });
        return {
          clipId: context.clipId,
          secret: context.secret,
          metadata: metaResult.clip
        };
      }

      var resolved = await apiFetch('/api/clip/resolve-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortCode: context.code })
      });

      return {
        clipId: resolved.clip.id,
        secret: context.secret,
        metadata: resolved.clip
      };
    }

    async function fetchClip() {
      els.fetchBtn.disabled = true;
      setStatus(els.fetchStatus, 'info', 'Checking clip availability...');

      try {
        var context = buildFetchContext();
        var resolved = await lookupClip(context);
        state.currentClipId = resolved.clipId;
        state.currentSecret = resolved.secret;
        state.metadata = resolved.metadata;
        renderMetadata(resolved.metadata);
        setStatus(els.fetchStatus, 'info', 'Clip found. Decrypting securely in your browser...');

        var readResult = await apiFetch('/api/clip/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: resolved.clipId })
        });

        var plaintext = await CryptoUtils.decryptClip(readResult.clip.envelope, resolved.secret);
        els.outputText.value = plaintext;
        els.outputPanel.style.display = 'block';
        state.metadata = readResult.clip;
        renderMetadata(readResult.clip);
        setStatus(els.fetchStatus, 'success', 'Clip decrypted successfully.');
        notify('Clip decrypted successfully.', '📥');
      } catch (err) {
        els.outputPanel.style.display = 'none';
        setStatus(els.fetchStatus, 'error', err.message || 'Unable to fetch this secure clip.');
      } finally {
        els.fetchBtn.disabled = false;
      }
    }

    async function resolveOnly() {
      els.resolveBtn.disabled = true;
      setStatus(els.fetchStatus, 'info', 'Resolving short code...');
      try {
        var code = normalizeCode(els.receiveCode.value);
        if (!code || code.length !== 7) {
          throw new Error('Enter a valid short code first.');
        }
        var resolved = await apiFetch('/api/clip/resolve-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shortCode: code })
        });
        state.currentClipId = resolved.clip.id;
        state.metadata = resolved.clip;
        renderMetadata(resolved.clip);
        setStatus(els.fetchStatus, 'success', 'Short code resolved. Add the secret key to decrypt.');
      } catch (err) {
        setStatus(els.fetchStatus, 'error', err.message || 'Unable to resolve that short code.');
      } finally {
        els.resolveBtn.disabled = false;
      }
    }

    function copyField(id, label) {
      var field = document.getElementById(id);
      if (!field || !field.value) {
        notify('Nothing to copy yet.', '!');
        return;
      }
      navigator.clipboard.writeText(field.value).then(function () {
        notify(label + ' copied.', '✓');
      }).catch(function () {
        notify('Clipboard copy was blocked by your browser.', '!');
      });
    }

    function initAutoLoad() {
      var fragment = CryptoUtils.parseClipboardHash(window.location.hash);
      if (!fragment.clip || !fragment.key) return;
      els.pasteLink.value = window.location.href;
      els.receiveSecret.value = fragment.key;
      state.currentClipId = fragment.clip;
      state.currentSecret = fragment.key;
      setStatus(els.fetchStatus, 'info', 'Share link detected. Loading clip metadata...');
      lookupClip({ clipId: fragment.clip, secret: fragment.key }).then(function (resolved) {
        state.metadata = resolved.metadata;
        renderMetadata(resolved.metadata);
        return fetchClip();
      }).catch(function (err) {
        setStatus(els.fetchStatus, 'error', err.message || 'Unable to load the secure clip from this link.');
      });
    }

    els.composeText.addEventListener('input', updateCounter);
    els.receiveCode.addEventListener('input', function () {
      this.value = normalizeCode(this.value);
    });
    initCustomSelect('clip-ttl-wrapper', 'clip-ttl-btn', 'clip-ttl-menu', 'clip-ttl');
    els.createBtn.addEventListener('click', createClip);
    els.resolveBtn.addEventListener('click', resolveOnly);
    els.fetchBtn.addEventListener('click', fetchClip);
    document.getElementById('clip-copy-code').addEventListener('click', function () {
      copyField('clip-short-code', 'Short code');
    });
    document.getElementById('clip-copy-secret').addEventListener('click', function () {
      copyField('clip-secret-key', 'Secret key');
    });
    document.getElementById('clip-copy-link').addEventListener('click', function () {
      copyField('clip-share-link', 'Share link');
    });
    document.getElementById('clip-copy-output').addEventListener('click', function () {
      copyField('clip-output-text', 'Decrypted text');
    });

    updateCounter();
    initAutoLoad();
  });
})();
