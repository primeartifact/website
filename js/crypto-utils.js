/**
 * PrimeArtifact — Lightweight End-to-End Encryption Utilities
 * Uses native Web Crypto API (window.crypto) zero dependencies.
 */
var CryptoUtils = (function () {
  
  function encode(str) {
    return new TextEncoder().encode(str);
  }

  function decode(buf) {
    return new TextDecoder().decode(buf);
  }

  function bufToBase64(buf) {
    var binary = '';
    var bytes = new Uint8Array(buf);
    for (var i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function base64ToBuf(base64) {
    var binary = window.atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Hashes the Sync Code via SHA-256 to serve as the Database ID.
  async function generateDatabaseId(syncCode) {
    var hashBuffer = await window.crypto.subtle.digest('SHA-256', encode(syncCode));
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    var hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.slice(0, 16); 
  }

  // Derive AES-GCM Key from the Sync Code using PBKDF2
  async function deriveKey(syncCode) {
    var keyMaterial = await window.crypto.subtle.importKey(
      "raw", encode(syncCode.toUpperCase().replace(/\s/g, '')), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
    );
    
    var salt = encode("PRIMEARTIFACT_E2E_SALT");
    
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptData(text, syncCode) {
    var key = await deriveKey(syncCode);
    var iv = window.crypto.getRandomValues(new Uint8Array(12));
    var encodedText = encode(text);

    var encryptedBuf = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv }, key, encodedText
    );

    var combinedData = new Uint8Array(12 + encryptedBuf.byteLength);
    combinedData.set(iv, 0);
    combinedData.set(new Uint8Array(encryptedBuf), 12);

    return bufToBase64(combinedData.buffer);
  }

  async function decryptData(encryptedBase64, syncCode) {
    try {
      var key = await deriveKey(syncCode);
      var encryptedData = new Uint8Array(base64ToBuf(encryptedBase64));
      
      var iv = encryptedData.slice(0, 12);
      var ciphertext = encryptedData.slice(12);

      var decryptedBuf = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv }, key, ciphertext
      );

      return decode(decryptedBuf);
    } catch(err) {
      console.error("Decryption Failed:", err);
      return null;
    }
  }

  // Generate a random 6-character Code
  function generateSyncCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
    var code = '';
    var randomValues = new Uint32Array(6);
    window.crypto.getRandomValues(randomValues);
    for (var i = 0; i < 6; i++) {
        code += chars[randomValues[i] % chars.length];
        if (i === 2) code += '-';
    }
    return code;
  }

  return {
    generateSyncCode,
    generateDatabaseId,
    encryptData,
    decryptData
  };
})();
