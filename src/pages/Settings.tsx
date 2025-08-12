import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import { toast } from '@/hooks/use-toast';
import { backupData, restoreDataFromZipBase64 } from '@/lib/backup';
import { FilePicker } from '@capawesome/capacitor-file-picker';

export default function Settings() {
  const [busy, setBusy] = useState<'backup' | 'restore' | null>(null);

  useEffect(() => {
    document.title = 'KeyGuard Glow • Settings';
  }, []);

  const onBackup = async () => {
    try {
      setBusy('backup');
      await backupData();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Backup failed', description: e?.message ?? 'Unexpected error' });
    } finally {
      setBusy(null);
    }
  };

  const onRestore = async () => {
    try {
      setBusy('restore');
      const res = await FilePicker.pickFiles({ types: ['application/zip', 'application/x-zip-compressed'], readData: true } as any);
      const file = (res as any).files?.[0];
      const dataB64 = file?.data as string | undefined; // base64
      if (!dataB64) {
        toast({ title: 'No file selected', description: 'Please select a backup .zip file' });
        return;
      }
      await restoreDataFromZipBase64(dataB64);
      toast({ title: 'Data restored successfully', description: 'Reloading…' });
      setTimeout(() => window.location.reload(), 500);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Restore failed', description: 'Invalid password or file' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <h1 className="text-2xl font-semibold">Settings</h1>
          <div />
        </div>

        <section className="space-y-4 card-glass rounded-xl p-6">
          <h2 className="text-lg font-medium">Backup & Restore</h2>
          <p className="text-sm text-muted-foreground">Works fully offline. Backup is AES‑256 password‑protected (ZIP).</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="glossy" size="lg" onClick={onBackup} disabled={busy!==null}>
              {busy==='backup' ? 'Backing up…' : 'Backup Data'}
            </Button>
            <Button variant="secondary" size="lg" onClick={onRestore} disabled={busy!==null}>
              {busy==='restore' ? 'Restoring…' : 'Restore Data'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Saves to Downloads/MyAppBackup on Android.</p>
        </section>
      </div>
    </main>
  );
}
