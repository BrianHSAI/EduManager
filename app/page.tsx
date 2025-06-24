"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, MessageCircle, Shield, Mail, FileText } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      // Redirect based on user role
      if (user.role === 'teacher') {
        router.push('/teacher');
        return;
      } else {
        router.push('/student');
        return;
      }
    }
    setIsLoading(false);
  }, [router]);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleContact = () => {
    router.push('/kontakt');
  };

  const handleGDPR = () => {
    router.push('/gdpr');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Omdirigerer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">HomeworkDelight</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={handleContact}>
                Kontakt
              </Button>
              <Button onClick={handleLogin}>
                Log ind
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Støt dine elever i deres akademiske rejse
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            HomeworkDelight hjælper lærere med at støtte elever i at skrive afleveringer og giver elever den hjælp og støtte, de har brug for i deres akademiske arbejde.
          </p>
          <Button size="lg" onClick={handleLogin} className="text-lg px-8 py-3">
            Kom i gang
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Hvorfor vælge HomeworkDelight?
            </h3>
            <p className="text-lg text-gray-600">
              Vores platform gør det nemt for lærere og elever at samarbejde om akademiske opgaver
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Lærer-elev samarbejde</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Skab forbindelse mellem lærere og elever for bedre akademisk støtte og vejledning.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Hjælp og støtte</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Elever kan få den hjælp og støtte, de har brug for til deres afleveringer og opgaver.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Opgavestyring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Organiser og administrer opgaver effektivt med vores intuitive platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-400 mr-2" />
                <span className="text-lg font-semibold">HomeworkDelight</span>
              </div>
              <p className="text-gray-400">
                Støt dine elever i deres akademiske rejse med vores platform for lærer-elev samarbejde.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Links</h4>
              <ul className="space-y-2">
                <li>
                  <Button 
                    variant="link" 
                    className="text-gray-400 hover:text-white p-0 h-auto"
                    onClick={handleLogin}
                  >
                    Log ind
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="link" 
                    className="text-gray-400 hover:text-white p-0 h-auto"
                    onClick={handleContact}
                  >
                    Kontakt
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="link" 
                    className="text-gray-400 hover:text-white p-0 h-auto"
                    onClick={handleGDPR}
                  >
                    GDPR og persondata
                  </Button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Kontakt</h4>
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span>kontakt@brianhs.dk</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HomeworkDelight. Alle rettigheder forbeholdes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
