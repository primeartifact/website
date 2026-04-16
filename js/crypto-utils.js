/**
 * PrimeArtifact Clipboard Crypto
 * Versioned zero-knowledge envelope helpers for the Secure Online Clipboard.
 */
var CryptoUtils = (function () {
  'use strict';

  var VERSION = 1;
  var ALGORITHM = 'AES-GCM-256/HKDF-SHA-256';
  var INFO_LABEL = 'primeartifact.clip.v1';
  var textEncoder = new TextEncoder();
  var textDecoder = new TextDecoder();

  function encode(str) {
    return textEncoder.encode(str);
  }

  function decode(buf) {
    return textDecoder.decode(buf);
  }

  function randomBytes(length) {
    var bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    return bytes;
  }

  function bufToBase64url(buf) {
    var bytes = new Uint8Array(buf);
    var binary = '';
    for (var i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function base64urlToBuf(base64url) {
    var normalized = (base64url || '').replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4) normalized += '=';
    var binary = window.atob(normalized);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function normalizeSecret(secret) {
    if (typeof secret !== 'string' || !secret.trim()) {
      throw new Error('Missing clip secret.');
    }
    return secret.trim();
  }

  function createRandomSecret() {
    return bufToBase64url(randomBytes(32).buffer);
  }

  async function deriveKey(secret, saltBytes) {
    var secretBytes = new Uint8Array(base64urlToBuf(normalizeSecret(secret)));
    var keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      secretBytes,
      'HKDF',
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: saltBytes,
        info: encode(INFO_LABEL)
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encryptClip(plaintext, secret) {
    if (typeof plaintext !== 'string' || plaintext.length === 0) {
      throw new Error('Nothing to encrypt.');
    }

    var salt = randomBytes(16);
    var iv = randomBytes(12);
    var key = await deriveKey(secret, salt);
    var encoded = encode(plaintext);
    var ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoded
    );

    return {
      v: VERSION,
      alg: ALGORITHM,
      salt: bufToBase64url(salt.buffer),
      iv: bufToBase64url(iv.buffer),
      ciphertext: bufToBase64url(ciphertext),
      plainTextBytes: encoded.byteLength
    };
  }

  async function decryptClip(envelope, secret) {
    validateEnvelope(envelope);
    var salt = new Uint8Array(base64urlToBuf(envelope.salt));
    var iv = new Uint8Array(base64urlToBuf(envelope.iv));
    var ciphertext = new Uint8Array(base64urlToBuf(envelope.ciphertext));
    var key = await deriveKey(secret, salt);
    var plainBuf = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );
    return decode(plainBuf);
  }

  function validateEnvelope(envelope) {
    if (!envelope || typeof envelope !== 'object') {
      throw new Error('Invalid encryption envelope.');
    }
    if (envelope.v !== VERSION) {
      throw new Error('Unsupported clip version.');
    }
    if (envelope.alg !== ALGORITHM) {
      throw new Error('Unsupported encryption algorithm.');
    }
    if (!envelope.salt || !envelope.iv || !envelope.ciphertext) {
      throw new Error('Clip payload is incomplete.');
    }
  }

  function getPlaintextByteLength(text) {
    return encode(text || '').byteLength;
  }

  function parseClipboardHash(hash) {
    var params = new URLSearchParams((hash || '').replace(/^#/, ''));
    return {
      clip: params.get('clip') || '',
      key: params.get('key') || ''
    };
  }

  function buildClipboardHash(clipId, secret) {
    var params = new URLSearchParams();
    params.set('clip', clipId);
    params.set('key', normalizeSecret(secret));
    return '#' + params.toString();
  }

  return {
    algorithm: ALGORITHM,
    version: VERSION,
    createRandomSecret: createRandomSecret,
    encryptClip: encryptClip,
    decryptClip: decryptClip,
    getPlaintextByteLength: getPlaintextByteLength,
    parseClipboardHash: parseClipboardHash,
    buildClipboardHash: buildClipboardHash,
    validateEnvelope: validateEnvelope
  };
})();
