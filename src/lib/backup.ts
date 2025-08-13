import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from '@/hooks/use-toast';
import { ZipWriter, BlobWriter, TextReader, ZipReader, BlobReader } from '@zip.js/zip.js';

const BACKUP_PASSWORD = 'MyAppSecureKey'; // TODO: make configurable
const BACKUP_DIR = 'Download/MyAppBackup';

// Keys to persist (must match storage.ts)
const PREF_KEYS = [
  'kg_master_hash',
  'kg_logged_in',
  'kg_banks',
  'kg_cards',
  'kg_aadhars',
  'kg_policies',
  'kg_questions',
  'kg_salt_pw',
  'kg_salt_qa',
  'kg_wrapped_key_pw',
  'kg_wrapped_key_qa',
  'kg_session_dk',
];

async function ensurePermissions() {
  try {
    await Filesystem.requestPermissions();
  } catch {}
}

async function ensureBackupFolder() {
  try {
    await Filesystem.mkdir({ path: BACKUP_DIR, directory: Directory.ExternalStorage, recursive: true });
  } catch (e) {
    // ignore if exists
  }
}

function toBase64(buf: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBlob(b64: string, type = 'application/octet-stream'): Blob {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

export async function backupData(): Promise<void> {
  await ensurePermissions();
  await ensureBackupFolder();

  // Collect preferences
  const payload: Record<string, string | null> = {};
  for (const key of PREF_KEYS) {
    const { value } = await Preferences.get({ key });
    payload[key] = value ?? null;
  }

  const json = JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    data: payload,
  });

  // Build encrypted zip
  const zipWriter = new ZipWriter(new BlobWriter('application/zip'));
  await zipWriter.add('backup.json', new TextReader(json), {
    password: BACKUP_PASSWORD,
    encryptionStrength: 3, // AES-256
    level: 0,
  });
  const blob = await zipWriter.close();

  // Save to Downloads/MyAppBackup/
  const arrayBuffer = await blob.arrayBuffer();
  const dataB64 = toBase64(arrayBuffer);
  const ts = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const name = `backup-${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.zip`;

  await Filesystem.writeFile({
    path: `${BACKUP_DIR}/${name}`,
    directory: Directory.ExternalStorage,
    data: dataB64,
    recursive: true,
  });

  toast({ title: 'Backup complete', description: 'Backup saved to Downloads/MyAppBackup/' });
}

export async function restoreDataFromZipBase64(zipB64: string): Promise<void> {
  // Read zip and extract backup.json
  const blob = base64ToBlob(zipB64, 'application/zip');
  const zipReader = new ZipReader(new BlobReader(blob));
  const entries = await zipReader.getEntries();
  const entry = entries.find((e) => e.filename === 'backup.json');
  if (!entry) throw new Error('Invalid backup (backup.json not found)');
  const { TextWriter } = await import('@zip.js/zip.js');
  const text = await entry.getData!(new TextWriter(), { password: BACKUP_PASSWORD });

  const parsed = JSON.parse(text) as { data: Record<string, string | null> };
  const data = parsed.data;
  // Write back preferences
  for (const key of PREF_KEYS) {
    const value = data[key] ?? null;
    if (value === null) await Preferences.remove({ key });
    else await Preferences.set({ key, value });
  }
}
