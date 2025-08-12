import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { AadharRecord, getAadhars, isLoggedIn, updateAadhar } from '@/lib/storage';

export default function AadharsEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [rec, setRec] = React.useState<AadharRecord | null>(null);

  useEffect(() => {
    (async () => {
      if (!(await isLoggedIn())) return navigate('/login');
      const list = await getAadhars();
      const item = list.find((c) => c.id === id) || null;
      if (!item) return navigate('/aadhars');
      setRec(item);
    })();
    document.title = 'Edit Aadhar • KeyGuard Glow';
  }, [navigate, id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rec) return;
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get('name') || ''),
      aadharNumber: String(fd.get('aadharNumber') || ''),
      address: String(fd.get('address') || ''),
    };
    if (!data.aadharNumber.trim()) {
      toast({ title: 'Aadhar number is required', variant: 'destructive' });
      return;
    }
    await updateAadhar(rec.id, data);
    toast({ title: 'Aadhar updated' });
    navigate('/aadhars');
  }

  if (!rec) return null;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <BackButton />
          <LogoutButton />
        </div>
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Edit Aadhar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={rec.name} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="aadharNumber">Aadhar Number</Label>
                <Input id="aadharNumber" name="aadharNumber" defaultValue={rec.aadharNumber} required inputMode="numeric" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" rows={3} defaultValue={rec.address} />
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
