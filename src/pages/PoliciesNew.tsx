import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { isLoggedIn, savePolicy } from '@/lib/storage';

export default function PoliciesNew() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => { if (!(await isLoggedIn())) navigate('/login'); })();
    document.title = 'New Policy • KeyGuard Glow';
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get('name') || ''),
      renewalDate: String(fd.get('renewalDate') || ''),
      amount: String(fd.get('amount') || ''),
    };
    await savePolicy(data);
    toast({ title: 'Policy saved' });
    navigate('/policies');
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <BackButton />
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Create New Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="renewalDate">Renewal Date</Label>
                <Input id="renewalDate" name="renewalDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" inputMode="decimal" />
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
