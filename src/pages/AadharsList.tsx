import { useEffect, useMemo, useState } from 'react';
import BackButton from '@/components/BackButton';
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { AadharRecord, deleteAadhar, getAadhars, isLoggedIn } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

export default function AadharsList() {
  const [rows, setRows] = useState<AadharRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!(await isLoggedIn())) return navigate('/login');
      setRows(await getAadhars());
    })();
    document.title = 'Aadhar Cards • KeyGuard Glow';
  }, [navigate]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this Aadhar record?')) return;
    await deleteAadhar(id);
    setRows(await getAadhars());
    toast({ title: 'Deleted' });
  }

  async function copy(txt: string) {
    try {
      await navigator.clipboard.writeText(txt);
      toast({ title: 'Copied' });
    } catch {}
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-2">
            <LogoutButton />
            <Button variant="glossy" onClick={() => navigate('/aadhars/new')}>Create New</Button>
          </div>
        </div>
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Aadhar Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Aadhar Number</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell onClick={() => copy(r.name || '')} className="cursor-pointer">{r.name || '-'}</TableCell>
                    <TableCell onClick={() => copy(r.aadharNumber)} className="cursor-pointer">{r.aadharNumber}</TableCell>
                    <TableCell onClick={() => copy(r.address || '')} className="cursor-pointer truncate max-w-[240px]">{r.address || '-'}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="glossy" size="sm" onClick={() => navigate(`/aadhars/${r.id}/edit`)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(r.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rows.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">No Aadhar cards yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
