import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { PolicyRecord, getPolicies, isLoggedIn, updatePolicy } from '@/lib/storage';

export default function PoliciesEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [policy, setPolicy] = React.useState<PolicyRecord | null>(null);

  useEffect(() => {
    (async () => {
      if (!(await isLoggedIn())) return navigate('/login');
      const list = await getPolicies();
      const item = list.find((p) => p.id === id) || null;
      if (!item) return navigate('/policies');
      setPolicy(item);
    })();
    document.title = 'Edit Policy • KeyGuard Glow';
  }, [navigate, id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!policy) return;
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get('name') || ''),
      renewalDate: String(fd.get('renewalDate') || ''),
      amount: String(fd.get('amount') || ''),
    };
    await updatePolicy(policy.id, data);
    toast({ title: 'Policy updated' });
    navigate('/policies');
  }

  if (!policy) return null;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <BackButton />
          <LogoutButton />
        </div>
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Edit Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={policy.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="renewalDate">Renewal Date</Label>
                <Input id="renewalDate" name="renewalDate" type="date" defaultValue={policy.renewalDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" inputMode="decimal" defaultValue={policy.amount} />
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
