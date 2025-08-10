// Crypto helpers for hashing, key derivation and AES-GCM encryption (offline-only)

// Basic SHA-256 hashing (kept for backwards compatibility)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
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
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
}

// --- Key derivation (PBKDF2 -> AES-GCM key) ---
export async function deriveKey(secret: string, saltB64?: string): Promise<{ key: CryptoKey; saltB64: string }> {
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

export async function generateAesKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return bytesToBase64(raw);
}

export async function importAesKeyFromBase64(b64: string): Promise<CryptoKey> {
  const raw = base64ToBytes(b64);
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function encryptStringWithKey(key: CryptoKey, plaintext: string): Promise<{ iv: string; cipher: string }>
{
  const iv = randomBytes(12);
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
  return { iv: bytesToBase64(iv), cipher: bytesToBase64(ct) };
}

export async function decryptStringWithKey(key: CryptoKey, ivB64: string, cipherB64: string): Promise<string> {
  const iv = base64ToBytes(ivB64);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, base64ToBytes(cipherB64));
  return new TextDecoder().decode(pt);
}
