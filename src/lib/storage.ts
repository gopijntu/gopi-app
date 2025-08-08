import { Preferences } from '@capacitor/preferences';

export type BankRecord = {
  id: string;
  recordName: string;
  bankName: string;
  ifscCode: string;
  username: string;
  privy: string;
  createdAt: string;
};

export type CardRecord = {
  id: string;
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
