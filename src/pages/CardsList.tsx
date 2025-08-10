import { useEffect, useMemo, useState } from 'react';
import BackButton from '@/components/BackButton';
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { CardRecord, deleteCard, getCards, isLoggedIn } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

function maskCard(num: string) {
  const clean = num.replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  return clean.replace(/.(?=.{4})/g, '•').replace(/(.{4})/g, '$1 ').trim();
}

export default function CardsList() {
  const [rows, setRows] = useState<CardRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!(await isLoggedIn())) return navigate('/login');
      setRows(await getCards());
    })();
    document.title = 'Cards • KeyGuard Glow';
  }, [navigate]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this card?')) return;
    await deleteCard(id);
    setRows(await getCards());
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
            <Button variant="glossy" onClick={() => navigate('/cards/new')}>Create New</Button>
          </div>
        </div>
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Card Number</TableHead>
                  <TableHead>CVV</TableHead>
                  <TableHead>Valid Till</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="cursor-pointer" onClick={() => copy(r.bankName ?? '')}>{r.bankName ?? '-'}</TableCell>
                    <TableCell className="cursor-pointer" onClick={() => copy(r.cardType ?? '')}>{r.cardType ?? '-'}</TableCell>
                    <TableCell className="cursor-pointer" onClick={() => copy(r.cardNumber)}>{r.cardNumber}</TableCell>
                    <TableCell className="cursor-pointer" onClick={() => copy(r.cvv)}>{r.cvv}</TableCell>
                    <TableCell>{r.validTill}</TableCell>
                    <TableCell className="truncate max-w-[200px]">{r.note}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="glossy" size="sm" onClick={() => navigate(`/cards/${r.id}/edit`)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(r.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rows.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">No cards yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
