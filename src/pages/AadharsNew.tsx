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
import { isLoggedIn, saveAadhar } from '@/lib/storage';

export default function AadharsNew() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => { if (!(await isLoggedIn())) navigate('/login'); })();
    document.title = 'New Aadhar • KeyGuard Glow';
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
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
      await saveAadhar(data);
      toast({ title: 'Aadhar record saved' });
      navigate('/aadhars');
    } catch (err: any) {
      console.error('Save aadhar failed', err);
      toast({ title: 'Save failed', description: err?.message || 'Please unlock the vault and ensure the app runs in a secure WebView.', variant: 'destructive' });
    }
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
            <CardTitle>Create New Aadhar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="aadharNumber">Aadhar Number</Label>
                <Input id="aadharNumber" name="aadharNumber" required inputMode="numeric" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" rows={3} />
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
