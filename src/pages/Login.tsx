import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { verifyPassword } from '@/lib/security';
import { getMasterHash, isLoggedIn, setLoggedIn } from '@/lib/storage';

export default function Login() {
  const navigate = useNavigate();
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const master = await getMasterHash();
      const logged = await isLoggedIn();
      if (!master) {
        navigate('/onboarding');
        return;
      }
      if (logged) {
        navigate('/home');
        return;
      }
      // Check biometric availability (Capacitor plugin on device)
      try {
        // We use dynamic import to avoid build issues if plugin isn't installed
        // @ts-ignore
        const { Biometric } = await import('@capawesome/capacitor-biometric');
        const res = await Biometric.isAvailable();
        setBiometricAvailable(!!res.isAvailable);
      } catch {
        setBiometricAvailable(false);
      }
    })();
  }, [navigate]);

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const master = await getMasterHash();
    if (!master) return navigate('/onboarding');
    const form = new FormData(e.currentTarget);
    const pw = String(form.get('password') || '');
    const ok = await verifyPassword(pw, master);
    if (!ok) {
      toast({ title: 'Invalid password' });
      return;
    }
    await setLoggedIn(true);
    navigate('/home');
  }

  async function handleBiometric() {
    try {
      // @ts-ignore
      const { Biometric } = await import('@capawesome/capacitor-biometric');
      const res = await Biometric.isAvailable();
      if (!res.isAvailable) return;
      const auth = await Biometric.authenticate({ reason: 'Authenticate to unlock KeyGuard Glow' });
      if (auth.success) {
        await setLoggedIn(true);
        navigate('/home');
      }
    } catch (e) {
      toast({ title: 'Biometric not available here', description: 'Use password instead.' });
    }
  }

  useEffect(() => { document.title = 'Login • KeyGuard Glow'; }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md card-glass">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Unlock with your master password or fingerprint</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" variant="glossy" size="lg">Login</Button>
          </form>
          {biometricAvailable && (
            <Button onClick={handleBiometric} variant="secondary" className="w-full mt-3">Use Fingerprint</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
