import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { verifyPassword } from '@/lib/security';
import { getMasterHash, isLoggedIn, setLoggedIn, resetAllData, unlockVaultWithPassword } from '@/lib/storage';
import { Capacitor } from '@capacitor/core';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
      // Check biometric availability only on native
      try {
        if (!Capacitor.isNativePlatform()) {
          setBiometricAvailable(false);
          return;
        }
        const modPath = '@capawesome/capacitor-biometric';
        // @vite-ignore
        const mod: any = await import(/* @vite-ignore */ modPath);
        const { Biometric } = mod;
        const res = await Biometric.isAvailable();
        setBiometricAvailable(!!res.isAvailable);
      } catch {
        setBiometricAvailable(false);
      }
    })();
  }, [navigate]);

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget as HTMLFormElement;
    const data = new FormData(formEl);
    const pw = String(data.get('password') || '');

    const master = await getMasterHash();
    if (!master) {
      navigate('/onboarding');
      return;
    }

    const ok = await verifyPassword(pw, master);
    if (!ok) {
      toast({ title: 'Invalid password' });
      return;
    }

    // Unlock vault with password (offline)
    const unlocked = await unlockVaultWithPassword(pw);
    if (!unlocked) {
      toast({ title: 'Unable to unlock vault', description: 'Please try again.' });
      return;
    }

    await setLoggedIn(true);
    navigate('/home');
  }

  async function handleBiometric() {
    try {
      if (!Capacitor.isNativePlatform()) {
        toast({ title: 'Biometric not available here', description: 'Use password instead.' });
        return;
      }
      const modPath = '@capawesome/capacitor-biometric';
      const mod: any = await import(/* @vite-ignore */ modPath);
      const { Biometric } = mod;
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

  async function handleReset() {
    await resetAllData();
    toast({ title: 'App reset', description: 'Please set a new master password.' });
    navigate('/onboarding');
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
          <Button onClick={() => navigate('/recover')} variant="ghost" className="w-full mt-3">Forgot password? Answer security questions</Button>
          {biometricAvailable && (
            <Button onClick={handleBiometric} variant="secondary" className="w-full mt-3">Use Fingerprint</Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full mt-3">Reset app (erase all data)</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset app?</AlertDialogTitle>
                <AlertDialogDescription>
                  This erases your master password and all saved data (banks, cards, policies). This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
