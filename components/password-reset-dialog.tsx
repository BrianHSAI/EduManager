"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface PasswordResetDialogProps {
  children: React.ReactNode;
}

export function PasswordResetDialog({ children }: PasswordResetDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!isSupabaseConfigured()) {
      setError('Adgangskode nulstilling er ikke tilgængelig i demo mode.');
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Indtast venligst en gyldig email adresse.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        if (error.message.includes('Email not confirmed')) {
          setError('Din email adresse er ikke bekræftet. Tjek din indbakke for bekræftelsesmail.');
        } else if (error.message.includes('Invalid email')) {
          setError('Ugyldig email adresse.');
        } else {
          setError('Der opstod en fejl. Prøv igen senere.');
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Password reset catch error:', err);
      setError('Der opstod en uventet fejl. Prøv igen senere.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEmail('');
    setError('');
    setSuccess(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        handleClose();
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Nulstil adgangskode
          </DialogTitle>
          <DialogDescription>
            {success 
              ? "Vi har sendt dig en email med instruktioner til at nulstille din adgangskode."
              : "Indtast din email adresse, så sender vi dig en email med instruktioner til at nulstille din adgangskode."
            }
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Tjek din indbakke og følg instruktionerne i emailen for at nulstille din adgangskode.
              </p>
              <p className="text-xs text-muted-foreground">
                Kan du ikke finde emailen? Tjek din spam-mappe.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Luk
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email">Email adresse</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="din@email.dk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                Annuller
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send email
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
