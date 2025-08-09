import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { isLoggedIn, saveCard } from '@/lib/storage';

export default function CardsNew() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => { if (!(await isLoggedIn())) navigate('/login'); })();
    document.title = 'New Card • KeyGuard Glow';
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      bankName: String(fd.get('bankName') || ''),
      cardType: String(fd.get('cardType') || ''),
      cardNumber: String(fd.get('cardNumber') || ''),
      cvv: String(fd.get('cvv') || ''),
      validTill: String(fd.get('validTill') || ''),
      note: String(fd.get('note') || ''),
    };
    await saveCard(data);
    toast({ title: 'Card saved' });
    navigate('/cards');
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
            <CardTitle>Create New Card</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" name="bankName" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardType">Card Type</Label>
                <Select name="cardType">
                  <SelectTrigger id="cardType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="MasterCard">MasterCard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" name="cardNumber" required inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" name="cvv" required inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTill">Valid Till</Label>
                <Input id="validTill" name="validTill" placeholder="MM/YY" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="note">Note</Label>
                <Textarea id="note" name="note" rows={3} />
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
