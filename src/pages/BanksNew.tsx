import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { isLoggedIn, saveBank } from '@/lib/storage';

export default function BanksNew() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => { if (!(await isLoggedIn())) navigate('/login'); })();
    document.title = 'New Bank Record • KeyGuard Glow';
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    await saveBank(data);
    toast({ title: 'Bank record saved' });
    navigate('/banks');
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <BackButton />
          <LogoutButton />
        </div>
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Create New Bank Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="recordName">Name</Label>
                <Input id="recordName" name="recordName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" name="bankName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" name="accountNumber" inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cifNo">CIF No</Label>
                <Input id="cifNo" name="cifNo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input id="ifscCode" name="ifscCode" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="privy">Privy</Label>
                <Textarea id="privy" name="privy" rows={3} />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" variant="glossy">Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
