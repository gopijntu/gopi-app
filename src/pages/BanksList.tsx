import { useEffect, useState } from 'react';
import BackButton from '@/components/BackButton';
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { BankRecord, deleteBank, getBanks, isLoggedIn } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

export default function BanksList() {
  const [rows, setRows] = useState<BankRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!(await isLoggedIn())) return navigate('/login');
      setRows(await getBanks());
    })();
    document.title = 'Banks • KeyGuard Glow';
  }, [navigate]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this bank record?')) return;
    await deleteBank(id);
    setRows(await getBanks());
    toast({ title: 'Deleted' });
  }

  async function copy(txt: string) {
    try {
      await navigator.clipboard.writeText(txt);
      toast({ title: 'Copied to clipboard' });
    } catch {}
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-2">
            <LogoutButton />
            <Button variant="glossy" onClick={() => navigate('/banks/new')}>Create New</Button>
          </div>
        </div>
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Banks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Account No</TableHead>
                  <TableHead>CIF No</TableHead>
                  <TableHead>IFSC</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Privy</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell onClick={() => copy(r.recordName)} className="cursor-pointer">{r.recordName}</TableCell>
                    <TableCell onClick={() => copy(r.bankName)} className="cursor-pointer">{r.bankName}</TableCell>
                    <TableCell onClick={() => copy(r.accountNumber ?? '')} className="cursor-pointer">{r.accountNumber ?? '-'}</TableCell>
                    <TableCell onClick={() => copy(r.cifNo ?? '')} className="cursor-pointer">{r.cifNo ?? '-'}</TableCell>
                    <TableCell onClick={() => copy(r.ifscCode)} className="cursor-pointer">{r.ifscCode}</TableCell>
                    <TableCell onClick={() => copy(r.username)} className="cursor-pointer">{r.username}</TableCell>
                    <TableCell onClick={() => copy(r.privy)} className="cursor-pointer truncate max-w-[200px]">{r.privy}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="glossy" size="sm" onClick={() => navigate(`/banks/${r.id}/edit`)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(r.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rows.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">No bank records yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
