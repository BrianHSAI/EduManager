"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { PasswordResetDialog } from '@/components/password-reset-dialog';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'teacher' | 'student'
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted with:', signInData.email);
    setIsLoading(true);
    setError('');

    try {
      console.log('Calling signIn function...');
      const result = await signIn(signInData.email, signInData.password);
      console.log('SignIn function returned:', result);
      
      if (result && result.error) {
        console.error('Login error:', result.error);
        setError('Forkert email eller adgangskode.');
        return;
      }

      console.log('Login successful, waiting for redirect...');
      // The auth provider will handle redirecting based on user role
    } catch (err) {
      console.error('Login catch error:', err);
      setError('Der opstod en fejl ved login. Prøv igen.');
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Adgangskoderne matcher ikke.');
      setIsLoading(false);
      return;
    }

    if (signUpData.password.length < 6) {
      setError('Adgangskoden skal være mindst 6 tegn lang.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(signUpData.email, signUpData.password, {
        name: signUpData.name,
        role: signUpData.role
      });
      
      if (error) {
        console.error('Signup error:', error);
        
        // Provide more specific error messages
        if (error.message?.includes('account with this email already exists')) {
          setError('En bruger med denne email eksisterer allerede. Prøv at logge ind i stedet.');
        } else if (error.message?.includes('valid email address')) {
          setError('Indtast venligst en gyldig email adresse.');
        } else if (error.message?.includes('User already registered')) {
          setError('En bruger med denne email eksisterer allerede.');
        } else if (error.message?.includes('Invalid email')) {
          setError('Ugyldig email adresse.');
        } else if (error.message?.includes('Password should be at least')) {
          setError('Adgangskoden skal være mindst 6 tegn lang.');
        } else if (error.message?.includes('duplicate key value')) {
          setError('En bruger med denne email eksisterer allerede.');
        } else if (error.message?.includes('Failed to create user profile')) {
          setError('Kunne ikke oprette brugerprofil. Prøv igen.');
        } else {
          setError(`Der opstod en fejl ved oprettelse af konto: ${error.message || 'Prøv igen.'}`);
        }
        return;
      }

      // The auth provider will handle redirecting based on user role
    } catch (err) {
      console.error('Signup catch error:', err);
      setError('Der opstod en uventet fejl ved oprettelse af konto. Prøv igen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Velkommen</CardTitle>
          <CardDescription>
            Log ind eller opret en konto for at komme i gang
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-chart-2 text-chart-2">
              <TabsTrigger value="signin" className="bg-chart-2 text-card-foreground">Log ind</TabsTrigger>
              <TabsTrigger value="signup" className="bg-chart-2 text-card-foreground">Opret konto</TabsTrigger>
            </TabsList>

            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="din@email.dk"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Adgangskode</Label>
                    <PasswordResetDialog>
                      <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Glemt adgangskode?
                      </button>
                    </PasswordResetDialog>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Log ind
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Fulde navn</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Dit fulde navn"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="din@email.dk"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Adgangskode</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Bekræft adgangskode</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label>Jeg er:</Label>
                  <RadioGroup
                    value={signUpData.role}
                    onValueChange={(value: 'teacher' | 'student') => 
                      setSignUpData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student">Elev</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="teacher" id="teacher" />
                      <Label htmlFor="teacher">Lærer</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Opret konto
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {/* Footer links */}
          <div className="mt-6 pt-4 border-t text-center">
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <a 
                href="#" 
                className="hover:text-foreground transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                GDPR og persondata
              </a>
              <a 
                href="#" 
                className="hover:text-foreground transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/kontakt');
                }}
              >
                Kontakt
              </a>
              <a 
                href="#" 
                className="hover:text-foreground transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Om HomeworkDelight
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
