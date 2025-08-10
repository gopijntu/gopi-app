import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { BankRecord, getBanks, isLoggedIn, updateBank } from '@/lib/storage';

export default function BanksEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [bank, setBank] = React.useState<BankRecord | null>(null);

  useEffect(() => {
    (async () => {
      if (!(await isLoggedIn())) return navigate('/login');
      const list = await getBanks();
      const item = list.find((b) => b.id === id) || null;
      if (!item) {
        navigate('/banks');
        return;
      }
      setBank(item);
    })();
    document.title = 'Edit Bank • KeyGuard Glow';
  }, [navigate, id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!bank) return;
    const fd = new FormData(e.currentTarget);
    const data = {
      recordName: String(fd.get('recordName') || ''),
      bankName: String(fd.get('bankName') || ''),
      accountNumber: String(fd.get('accountNumber') || ''),
      cifNo: String(fd.get('cifNo') || ''),
      ifscCode: String(fd.get('ifscCode') || ''),
      username: String(fd.get('username') || ''),
      privy: String(fd.get('privy') || ''),
    };
    await updateBank(bank.id, data);
    toast({ title: 'Bank updated' });
    navigate('/banks');
  }

  if (!bank) return null;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <BackButton />
          <LogoutButton />
        </div>
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Edit Bank Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="recordName">Name</Label>
                <Input id="recordName" name="recordName" defaultValue={bank.recordName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" name="bankName" defaultValue={bank.bankName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" name="accountNumber" defaultValue={bank.accountNumber} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cifNo">CIF No</Label>
                <Input id="cifNo" name="cifNo" defaultValue={bank.cifNo} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input id="ifscCode" name="ifscCode" defaultValue={bank.ifscCode} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" defaultValue={bank.username} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="privy">Privy</Label>
                <Textarea id="privy" name="privy" rows={3} defaultValue={bank.privy} />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" variant="glossy">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
