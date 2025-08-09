import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { changePasswordWithAnswers, getSecurityQuestions, resetAllData } from '@/lib/storage';

export default function Recover() {
  const navigate = useNavigate();
  const [q1, setQ1] = useState<string>('');
  const [q2, setQ2] = useState<string>('');

  useEffect(() => {
    (async () => {
      const q = await getSecurityQuestions();
      if (!q) {
        navigate('/onboarding');
        return;
      }
      setQ1(q.q1);
      setQ2(q.q2);
    })();
    document.title = 'Recover Account • KeyGuard Glow';
  }, [navigate]);

  async function handleRecover(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const a1 = String(fd.get('a1') || '');
    const a2 = String(fd.get('a2') || '');
    const pw = String(fd.get('password') || '');
    const confirm = String(fd.get('confirm') || '');

    if (pw.length < 6) {
      toast({ title: 'Password too short', description: 'Use at least 6 characters.' });
      return;
    }
    if (pw !== confirm) {
      toast({ title: 'Passwords do not match' });
      return;
    }

    const ok = await changePasswordWithAnswers(pw, a1, a2);
    if (!ok) {
      toast({ title: 'Incorrect answers' });
      return;
    }
    toast({ title: 'Password reset successful' });
    navigate('/login');
  }

  async function handleResetAll() {
    await resetAllData();
    toast({ title: 'App reset', description: 'Please set up again.' });
    navigate('/onboarding');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md card-glass">
        <CardHeader>
          <CardTitle>Recover Account</CardTitle>
          <CardDescription>Answer your security questions to set a new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecover} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="a1">{q1 || 'Security Question 1'}</Label>
              <Input id="a1" name="a1" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a2">{q2 || 'Security Question 2'}</Label>
              <Input id="a2" name="a2" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input id="confirm" name="confirm" type="password" required />
            </div>
            <Button type="submit" className="w-full" variant="glossy" size="lg">Reset Password</Button>
          </form>
          <Button onClick={handleResetAll} variant="ghost" className="w-full mt-3">Reset app instead</Button>
        </CardContent>
      </Card>
    </div>
  );
}
