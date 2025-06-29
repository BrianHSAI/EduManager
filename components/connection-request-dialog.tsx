"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Loader2, Search, CheckCircle, XCircle, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createConnectionRequest } from '@/lib/database/connection-requests';
import { useAuth } from '@/components/auth-provider';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

export function ConnectionRequestDialog() {
  const [open, setOpen] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [foundTeacher, setFoundTeacher] = useState<Teacher | null>(null);
  const [foundTeachers, setFoundTeachers] = useState<Teacher[]>([]);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not-found'>('idle');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open && user?.name) {
      setStudentName(user.name);
    }
  }, [open, user]);

  const searchTeacher = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchStatus('idle');
      setFoundTeacher(null);
      setFoundTeachers([]);
      return;
    }

    setSearchStatus('searching');
    try {
      const { supabase } = await import('@/lib/supabase');
      const term = searchTerm.trim().toLowerCase();
      
      // Search for teachers by email (partial match) or name (partial match)
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'teacher')
        .or(`email.ilike.%${term}%,name.ilike.%${term}%`)
        .order('name')
        .limit(10); // Limit to 10 results for performance

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setSearchStatus('found');
        setFoundTeachers(data);
        
        // If multiple results, prioritize exact email match, then exact name match, then first result
        const exactEmailMatch = data.find(teacher => teacher.email.toLowerCase() === term);
        const exactNameMatch = data.find(teacher => teacher.name.toLowerCase() === term);
        setFoundTeacher(exactEmailMatch || exactNameMatch || data[0]);
      } else {
        setSearchStatus('not-found');
        setFoundTeacher(null);
        setFoundTeachers([]);
      }
    } catch (error) {
      console.error('Error searching for teacher:', error);
      setSearchStatus('not-found');
      setFoundTeacher(null);
      setFoundTeachers([]);
    }
  };

  const handleEmailChange = (email: string) => {
    setTeacherEmail(email);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce the search
    timeoutRef.current = setTimeout(() => {
      searchTeacher(email);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !foundTeacher || !studentName.trim() || !studentClass.trim()) {
      toast({
        title: "Manglende oplysninger",
        description: "Udfyld venligst alle påkrævede felter og find en lærer.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createConnectionRequest(
        user.id,
        foundTeacher.id,
        studentName.trim(),
        studentClass.trim(),
        message.trim() || undefined
      );

      if (result) {
        toast({
          title: "Forbindelsesanmodning sendt",
          description: `Din anmodning er sendt til ${foundTeacher.name} og afventer godkendelse.`,
        });
        
        // Reset form
        setTeacherEmail('');
        setFoundTeacher(null);
        setSearchStatus('idle');
        setStudentName(user?.name || '');
        setStudentClass('');
        setMessage('');
        setOpen(false);
      } else {
        throw new Error('Failed to create connection request');
      }
    } catch (error) {
      console.error('Error creating connection request:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke sende forbindelsesanmodning. Prøv igen senere.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSearchStatusIcon = () => {
    switch (searchStatus) {
      case 'searching':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'found':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'not-found':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSearchStatusMessage = () => {
    switch (searchStatus) {
      case 'searching':
        return 'Søger efter lærer...';
      case 'found':
        return foundTeachers.length > 1 
          ? `${foundTeachers.length} lærere fundet - valgt: ${foundTeacher?.name}`
          : `Lærer fundet: ${foundTeacher?.name}`;
      case 'not-found':
        return 'Ingen lærer fundet med denne søgning';
      default:
        return '';
    }
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    setFoundTeacher(teacher);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <UserPlus className="h-4 w-4" />
          <span className="">Forbind med lærer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send forbindelsesanmodning</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teacherEmail">Søg efter lærer *</Label>
            <div className="relative">
              <Input
                id="teacherEmail"
                type="text"
                value={teacherEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Indtast lærerens navn eller email"
                className="pr-10"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {getSearchStatusIcon()}
              </div>
            </div>
            {searchStatus !== 'idle' && (
              <p className={`text-sm ${
                searchStatus === 'found' ? 'text-green-600' : 
                searchStatus === 'not-found' ? 'text-red-600' : 
                'text-blue-600'
              }`}>
                {getSearchStatusMessage()}
              </p>
            )}
            {foundTeacher && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{foundTeacher.name}</p>
                    <p className="text-sm text-green-600">{foundTeacher.email}</p>
                  </div>
                </div>
              </div>
            )}
            {foundTeachers.length > 1 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Andre resultater:</Label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {foundTeachers
                    .filter(teacher => teacher.id !== foundTeacher?.id)
                    .map((teacher) => (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => handleTeacherSelect(teacher)}
                        className="w-full p-2 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{teacher.name}</p>
                            <p className="text-xs text-gray-600">{teacher.email}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentName">Dit navn *</Label>
            <Input
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Indtast dit fulde navn"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentClass">Din klasse *</Label>
            <Input
              id="studentClass"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              placeholder="f.eks. 7A, 9B, 2.g"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Besked (valgfri)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Skriv en kort besked til læreren..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuller
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !foundTeacher}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sender...
                </>
              ) : (
                'Send anmodning'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
