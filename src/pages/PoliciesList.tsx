import { useEffect, useState } from 'react';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { PolicyRecord, deletePolicy, getPolicies, isLoggedIn } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

export default function PoliciesList() {
  const [rows, setRows] = useState<PolicyRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!(await isLoggedIn())) return navigate('/login');
      setRows(await getPolicies());
    })();
    document.title = 'Policies • KeyGuard Glow';
  }, [navigate]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this policy?')) return;
    await deletePolicy(id);
    setRows(await getPolicies());
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
          <Button variant="glossy" onClick={() => navigate('/policies/new')}>Create New</Button>
        </div>
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Renewal Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell onClick={() => copy(r.name)} className="cursor-pointer">{r.name}</TableCell>
                    <TableCell onClick={() => copy(r.renewalDate)} className="cursor-pointer">{r.renewalDate}</TableCell>
                    <TableCell onClick={() => copy(r.amount)} className="cursor-pointer">{r.amount}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(r.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rows.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">No policies yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
