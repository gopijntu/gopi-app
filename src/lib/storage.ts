import { Preferences } from '@capacitor/preferences';
import { deriveKey, generateAesKey, exportKeyToBase64, importAesKeyFromBase64, encryptStringWithKey, decryptStringWithKey, hashPassword } from '@/lib/security';

export type BankRecord = {
  id: string;
  recordName: string; // UI label "Name"
  bankName: string;
  accountNumber?: string;
  cifNo?: string;
  ifscCode: string;
  username: string;
  privy: string;
  createdAt: string;
};

export type CardRecord = {
  id: string;
  bankName?: string;
  cardType?: string; // e.g., Visa, MasterCard
  cardNumber: string;
  cvv: string;
  validTill: string;
  note: string;
  createdAt: string;
};

const KEYS = {
  MASTER_HASH: 'kg_master_hash',
  LOGGED_IN: 'kg_logged_in',
  BANKS: 'kg_banks',
  CARDS: 'kg_cards',
  POLICIES: 'kg_policies',
  QUESTIONS: 'kg_questions', // { q1, q2 }
  SALT_PW: 'kg_salt_pw',
  SALT_QA: 'kg_salt_qa',
  WRAPPED_KEY_PW: 'kg_wrapped_key_pw', // JSON {iv, cipher}
  WRAPPED_KEY_QA: 'kg_wrapped_key_qa', // JSON {iv, cipher}
};

// In-memory unlocked data key
let dataKey: CryptoKey | null = null;
const norm = (s: string) => s.trim().toLowerCase();

export async function setMasterHash(hash: string) {
  await Preferences.set({ key: KEYS.MASTER_HASH, value: hash });
}

export async function getMasterHash(): Promise<string | null> {
  const { value } = await Preferences.get({ key: KEYS.MASTER_HASH });
  return value ?? null;
}

export async function setLoggedIn(flag: boolean) {
  await Preferences.set({ key: KEYS.LOGGED_IN, value: flag ? '1' : '0' });
}

export async function isLoggedIn(): Promise<boolean> {
  const { value } = await Preferences.get({ key: KEYS.LOGGED_IN });
  return value === '1';
}

export function lockVault() {
  dataKey = null;
}

export function isVaultUnlocked(): boolean {
  return dataKey !== null;
}

export async function hasVaultSetup(): Promise<boolean> {
  const { value: salt } = await Preferences.get({ key: KEYS.SALT_PW });
  const { value: wrap } = await Preferences.get({ key: KEYS.WRAPPED_KEY_PW });
  return !!salt && !!wrap;
}

export async function getSecurityQuestions(): Promise<{ q1: string; q2: string } | null> {
  const { value } = await Preferences.get({ key: KEYS.QUESTIONS });
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

export async function setFirstRunSetup(params: { password: string; q1: string; a1: string; q2: string; a2: string }) {
  const { password, q1, a1, q2, a2 } = params;
  // Generate random data key for vault
  const dk = await generateAesKey();
  const dkB64 = await exportKeyToBase64(dk);

  // Derive keys
  const { key: pwKey, saltB64: saltPw } = await deriveKey(password);
  const { key: qaKey, saltB64: saltQa } = await deriveKey(`${norm(a1)}||${norm(a2)}`);

  // Wrap data key with both
  const wrappedByPw = await encryptStringWithKey(pwKey, dkB64);
  const wrappedByQa = await encryptStringWithKey(qaKey, dkB64);

  // Persist
  await Preferences.set({ key: KEYS.SALT_PW, value: saltPw });
  await Preferences.set({ key: KEYS.SALT_QA, value: saltQa });
  await Preferences.set({ key: KEYS.WRAPPED_KEY_PW, value: JSON.stringify(wrappedByPw) });
  await Preferences.set({ key: KEYS.WRAPPED_KEY_QA, value: JSON.stringify(wrappedByQa) });
  await Preferences.set({ key: KEYS.QUESTIONS, value: JSON.stringify({ q1, q2 }) });
}

export async function unlockVaultWithPassword(password: string): Promise<boolean> {
  try {
    const { value: saltPw } = await Preferences.get({ key: KEYS.SALT_PW });
    const { value: wrapPwStr } = await Preferences.get({ key: KEYS.WRAPPED_KEY_PW });
    if (!saltPw || !wrapPwStr) return false;
    const { key: pwKey } = await deriveKey(password, saltPw);
    const wrap = JSON.parse(wrapPwStr);
    const dkB64 = await decryptStringWithKey(pwKey, wrap.iv, wrap.cipher);
    dataKey = await importAesKeyFromBase64(dkB64);
    return true;
  } catch {
    dataKey = null;
    return false;
  }
}

export async function unlockVaultWithAnswers(a1: string, a2: string): Promise<boolean> {
  try {
    const { value: saltQa } = await Preferences.get({ key: KEYS.SALT_QA });
    const { value: wrapQaStr } = await Preferences.get({ key: KEYS.WRAPPED_KEY_QA });
    if (!saltQa || !wrapQaStr) return false;
    const { key: qaKey } = await deriveKey(`${norm(a1)}||${norm(a2)}`, saltQa);
    const wrap = JSON.parse(wrapQaStr);
    const dkB64 = await decryptStringWithKey(qaKey, wrap.iv, wrap.cipher);
    dataKey = await importAesKeyFromBase64(dkB64);
    return true;
  } catch {
    dataKey = null;
    return false;
  }
}

export async function changePasswordWithAnswers(newPassword: string, a1: string, a2: string): Promise<boolean> {
  const ok = await unlockVaultWithAnswers(a1, a2);
  if (!ok || !dataKey) return false;
  // Re-wrap with new password
  const { key: pwKey, saltB64: saltPw } = await deriveKey(newPassword);
  const dkB64 = await exportKeyToBase64(dataKey);
  const wrappedByPw = await encryptStringWithKey(pwKey, dkB64);
  await Preferences.set({ key: KEYS.SALT_PW, value: saltPw });
  await Preferences.set({ key: KEYS.WRAPPED_KEY_PW, value: JSON.stringify(wrappedByPw) });
  // Also update the quick-check hash
  const hashed = await hashPassword(newPassword);
  await setMasterHash(hashed);
  return true;
}

async function readEncryptedJSON<T>(key: string, fallback: T): Promise<T> {
  if (!dataKey) return fallback;
  const { value } = await Preferences.get({ key });
  if (!value) return fallback;
  try {
    const obj = JSON.parse(value) as { iv: string; cipher: string };
    const plaintext = await decryptStringWithKey(dataKey, obj.iv, obj.cipher);
    return JSON.parse(plaintext) as T;
  } catch {
    return fallback;
  }
}

async function writeEncryptedJSON<T>(key: string, data: T) {
  if (!dataKey) throw new Error('Vault locked');
  const plaintext = JSON.stringify(data);
  const obj = await encryptStringWithKey(dataKey, plaintext);
  await Preferences.set({ key, value: JSON.stringify(obj) });
}

// Banks
export async function getBanks(): Promise<BankRecord[]> {
  return readEncryptedJSON<BankRecord[]>(KEYS.BANKS, []);
}

export async function saveBank(rec: Omit<BankRecord, 'id' | 'createdAt'>) {
  const list = await getBanks();
  const next: BankRecord = {
    ...rec,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  list.unshift(next);
  await writeEncryptedJSON(KEYS.BANKS, list);
  return next;
}

export async function updateBank(id: string, rec: Omit<BankRecord, 'id' | 'createdAt'>) {
  const list = await getBanks();
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) return;
  const updated: BankRecord = { ...list[idx], ...rec };
  list[idx] = updated;
  await writeEncryptedJSON(KEYS.BANKS, list);
}

export async function deleteBank(id: string) {
  const list = await getBanks();
  const next = list.filter((r) => r.id !== id);
  await writeEncryptedJSON(KEYS.BANKS, next);
}

// Cards
export async function getCards(): Promise<CardRecord[]> {
  return readEncryptedJSON<CardRecord[]>(KEYS.CARDS, []);
}

export async function saveCard(rec: Omit<CardRecord, 'id' | 'createdAt'>) {
  const list = await getCards();
  const next: CardRecord = {
    ...rec,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  list.unshift(next);
  await writeEncryptedJSON(KEYS.CARDS, list);
  return next;
}

export async function updateCard(id: string, rec: Omit<CardRecord, 'id' | 'createdAt'>) {
  const list = await getCards();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return;
  const updated: CardRecord = { ...list[idx], ...rec };
  list[idx] = updated;
  await writeEncryptedJSON(KEYS.CARDS, list);
}

export async function deleteCard(id: string) {
  const list = await getCards();
  const next = list.filter((r) => r.id !== id);
  await writeEncryptedJSON(KEYS.CARDS, next);
}

// Policies
export type PolicyRecord = {
  id: string;
  name: string;
  renewalDate: string; // ISO or simple string
  amount: string;
  insuranceAmount?: string;
  insuranceCompany?: string;
  createdAt: string;
};

export async function getPolicies(): Promise<PolicyRecord[]> {
  return readEncryptedJSON<PolicyRecord[]>(KEYS.POLICIES, []);
}

export async function savePolicy(rec: Omit<PolicyRecord, 'id' | 'createdAt'>) {
  const list = await getPolicies();
  const next: PolicyRecord = {
    ...rec,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  list.unshift(next);
  await writeEncryptedJSON(KEYS.POLICIES, list);
  return next;
}

export async function updatePolicy(id: string, rec: Omit<PolicyRecord, 'id' | 'createdAt'>) {
  const list = await getPolicies();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return;
  const updated: PolicyRecord = { ...list[idx], ...rec };
  list[idx] = updated;
  await writeEncryptedJSON(KEYS.POLICIES, list);
}

export async function deletePolicy(id: string) {
  const list = await getPolicies();
  const next = list.filter((r) => r.id !== id);
  await writeEncryptedJSON(KEYS.POLICIES, next);
}

export async function resetAllData() {
  await Preferences.remove({ key: KEYS.MASTER_HASH });
  await Preferences.remove({ key: KEYS.LOGGED_IN });
  await Preferences.remove({ key: KEYS.BANKS });
  await Preferences.remove({ key: KEYS.CARDS });
  await Preferences.remove({ key: KEYS.POLICIES });
  await Preferences.remove({ key: KEYS.QUESTIONS });
  await Preferences.remove({ key: KEYS.SALT_PW });
  await Preferences.remove({ key: KEYS.SALT_QA });
  await Preferences.remove({ key: KEYS.WRAPPED_KEY_PW });
  await Preferences.remove({ key: KEYS.WRAPPED_KEY_QA });
  dataKey = null;
}
