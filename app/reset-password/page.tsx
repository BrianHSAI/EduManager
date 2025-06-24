"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      if (!isSupabaseConfigured()) {
        setError('Adgangskode nulstilling er ikke tilgængelig i demo mode.');
        setIsValidSession(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError('Ugyldig eller udløbet nulstillingslink.');
          setIsValidSession(false);
          return;
        }

        if (!session) {
          setError('Ugyldig eller udløbet nulstillingslink. Anmod om et nyt link.');
          setIsValidSession(false);
          return;
        }

        setIsValidSession(true);
      } catch (err) {
        console.error('Session check error:', err);
        setError('Der opstod en fejl. Prøv igen senere.');
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (password.length < 6) {
      setError('Adgangskoden skal være mindst 6 tegn lang.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Adgangskoderne matcher ikke.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        if (error.message.includes('session_not_found')) {
          setError('Din session er udløbet. Anmod om et nyt nulstillingslink.');
        } else if (error.message.includes('Password should be at least')) {
          setError('Adgangskoden skal være mindst 6 tegn lang.');
        } else {
          setError('Der opstod en fejl ved opdatering af adgangskoden. Prøv igen.');
        }
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Password reset catch error:', err);
      setError('Der opstod en uventet fejl. Prøv igen senere.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            {success ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                Adgangskode opdateret
              </>
            ) : isValidSession ? (
              <>
                <Lock className="h-6 w-6" />
                Ny adgangskode
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-red-500" />
                Ugyldig link
              </>
            )}
          </CardTitle>
          <CardDescription>
            {success 
              ? "Din adgangskode er blevet opdateret. Du bliver omdirigeret til login siden."
              : isValidSession
                ? "Indtast din nye adgangskode nedenfor."
                : "Dette nulstillingslink er ugyldigt eller udløbet."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Du kan nu logge ind med din nye adgangskode.
                </p>
              </div>
              <Button onClick={handleBackToLogin} className="w-full">
                Gå til login
              </Button>
            </div>
          ) : isValidSession ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password">Ny adgangskode</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Bekræft ny adgangskode</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Opdater adgangskode
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Anmod om et nyt nulstillingslink fra login siden.
                </p>
              </div>
              
              <Button onClick={handleBackToLogin} className="w-full">
                Tilbage til login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
