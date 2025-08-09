import { Preferences } from '@capacitor/preferences';

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
};

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

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const { value } = await Preferences.get({ key });
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON<T>(key: string, data: T) {
  await Preferences.set({ key, value: JSON.stringify(data) });
}

// Banks
export async function getBanks(): Promise<BankRecord[]> {
  return readJSON<BankRecord[]>(KEYS.BANKS, []);
}

export async function saveBank(rec: Omit<BankRecord, 'id' | 'createdAt'>) {
  const list = await getBanks();
  const next: BankRecord = {
    ...rec,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  list.unshift(next);
  await writeJSON(KEYS.BANKS, list);
  return next;
}

export async function deleteBank(id: string) {
  const list = await getBanks();
  const next = list.filter((r) => r.id !== id);
  await writeJSON(KEYS.BANKS, next);
}

// Cards
export async function getCards(): Promise<CardRecord[]> {
  return readJSON<CardRecord[]>(KEYS.CARDS, []);
}

export async function saveCard(rec: Omit<CardRecord, 'id' | 'createdAt'>) {
  const list = await getCards();
  const next: CardRecord = {
    ...rec,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  list.unshift(next);
  await writeJSON(KEYS.CARDS, list);
  return next;
}

export async function deleteCard(id: string) {
  const list = await getCards();
  const next = list.filter((r) => r.id !== id);
  await writeJSON(KEYS.CARDS, next);
}

// Policies
export type PolicyRecord = {
  id: string;
  name: string;
  renewalDate: string; // ISO or simple string
  amount: string;
  createdAt: string;
};

export async function getPolicies(): Promise<PolicyRecord[]> {
  return readJSON<PolicyRecord[]>(KEYS.POLICIES, []);
}

export async function savePolicy(rec: Omit<PolicyRecord, 'id' | 'createdAt'>) {
  const list = await getPolicies();
  const next: PolicyRecord = {
    ...rec,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  list.unshift(next);
  await writeJSON(KEYS.POLICIES, list);
  return next;
}

export async function deletePolicy(id: string) {
  const list = await getPolicies();
  const next = list.filter((r) => r.id !== id);
  await writeJSON(KEYS.POLICIES, next);
}

export async function resetAllData() {
  await Preferences.remove({ key: KEYS.MASTER_HASH });
  await Preferences.remove({ key: KEYS.LOGGED_IN });
  await Preferences.remove({ key: KEYS.BANKS });
  await Preferences.remove({ key: KEYS.CARDS });
  await Preferences.remove({ key: KEYS.POLICIES });
}
