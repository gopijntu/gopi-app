// Crypto helpers for hashing, key derivation and AES encryption (offline-friendly)
import CryptoJS from 'crypto-js';

// Detect Web Crypto availability
const hasSubtle = () => typeof globalThis.crypto !== 'undefined' && !!globalThis.crypto.subtle;
const hasRand = () => typeof globalThis.crypto !== 'undefined' && !!globalThis.crypto.getRandomValues;

// --- Hashing ---
export async function hashPassword(password: string): Promise<string> {
  if (hasSubtle()) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

// --- Base64 helpers ---
function bytesToBase64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  let binary = '';
  for (let i = 0; i < arr.byteLength; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function randomBytes(len: number): Uint8Array {
  if (hasRand()) {
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    return arr;
  }
  const wa = CryptoJS.lib.WordArray.random(len);
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = wa.words[i >>> 2] >>> (24 - (i % 4) * 8);
  return arr;
}

// Wrapper type flag for CryptoJS keys
type CryptoJsKeyWrapper = { __cryptojs: true; wa: CryptoJS.lib.WordArray };
function isCryptoJsKey(obj: unknown): obj is CryptoJsKeyWrapper {
  return typeof obj === 'object' && obj !== null && (obj as any).__cryptojs === true;
}

// --- Key derivation (PBKDF2) -> AES key ---
export async function deriveKey(secret: string, saltB64?: string): Promise<{ key: CryptoKey; saltB64: string }> {
  if (hasSubtle()) {
    const salt = saltB64 ? base64ToBytes(saltB64) : randomBytes(16);
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 310_000, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    return { key, saltB64: bytesToBase64(salt) };
  }
  const saltWA = saltB64 ? CryptoJS.enc.Base64.parse(saltB64) : CryptoJS.lib.WordArray.random(16);
  const keyWA = CryptoJS.PBKDF2(secret, saltWA, {
    keySize: 256 / 32,
    iterations: 310_000,
    hasher: CryptoJS.algo.SHA256,
  });
  return { key: ({ __cryptojs: true, wa: keyWA } as unknown) as CryptoKey, saltB64: CryptoJS.enc.Base64.stringify(saltWA) };
}

export async function generateAesKey(): Promise<CryptoKey> {
  if (hasSubtle()) {
    return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  }
  const wa = CryptoJS.lib.WordArray.random(32);
  return ({ __cryptojs: true, wa } as unknown) as CryptoKey;
}

export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  if (!hasSubtle() && isCryptoJsKey(key)) {
    return CryptoJS.enc.Base64.stringify(key.wa);
  }
  const raw = await crypto.subtle.exportKey('raw', key);
  return bytesToBase64(raw);
}

export async function importAesKeyFromBase64(b64: string): Promise<CryptoKey> {
  if (!hasSubtle()) {
    const wa = CryptoJS.enc.Base64.parse(b64);
    return ({ __cryptojs: true, wa } as unknown) as CryptoKey;
  }
  const raw = base64ToBytes(b64);
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function encryptStringWithKey(key: CryptoKey, plaintext: string): Promise<{ iv: string; cipher: string }> {
  if (!hasSubtle() && isCryptoJsKey(key)) {
    const ivWA = CryptoJS.lib.WordArray.random(16); // 16 bytes IV for CBC
    const cipher = CryptoJS.AES.encrypt(plaintext, key.wa, {
      iv: ivWA,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return { iv: CryptoJS.enc.Base64.stringify(ivWA), cipher: cipher.toString() };
  }
  const iv = randomBytes(12);
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
  return { iv: bytesToBase64(iv), cipher: bytesToBase64(ct) };
}

export async function decryptStringWithKey(key: CryptoKey, ivB64: string, cipherB64: string): Promise<string> {
  if (!hasSubtle() && isCryptoJsKey(key)) {
    const ivWA = CryptoJS.enc.Base64.parse(ivB64);
    const bytes = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(cipherB64) } as any, key.wa, {
      iv: ivWA,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Utf8.stringify(bytes);
  }
  const iv = base64ToBytes(ivB64);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, base64ToBytes(cipherB64));
  return new TextDecoder().decode(pt);
}
