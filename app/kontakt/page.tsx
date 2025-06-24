"use client";

import { Mail, Linkedin, Youtube, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function KontaktPage() {
  const router = useRouter();

  const handleEmailClick = () => {
    window.location.href = "mailto:kontakt@brianhs.dk";
  };

  const handleLinkedInClick = () => {
    window.open("https://www.linkedin.com/in/brianholmsørensen", "_blank");
  };

  const handleYouTubeClick = () => {
    window.open("https://www.youtube.com/@aiiundervisningen", "_blank");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back to Home Button */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={handleBackToHome}
            className="flex items-center space-x-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Tilbage til forsiden</span>
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kontakt</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hvis du ønsker at komme i kontakt med HomeworkDelight, kan du bruge følgende metoder
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Email Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold">Email</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Send os en email for spørgsmål eller support
              </p>
              <Button 
                onClick={handleEmailClick}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                kontakt@brianhs.dk
              </Button>
            </CardContent>
          </Card>

          {/* LinkedIn Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Linkedin className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold">LinkedIn</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Følg os på LinkedIn for professionelle opdateringer
              </p>
              <Button 
                onClick={handleLinkedInClick}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                Brian Holm Sørensen
              </Button>
            </CardContent>
          </Card>

          {/* YouTube Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Youtube className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold">YouTube</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Se vores undervisningsvideoer og tutorials
              </p>
              <Button 
                onClick={handleYouTubeClick}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Youtube className="h-4 w-4 mr-2" />
                AI Undervisningen
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Contact Information */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">HomeworkDelight</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Vi er her for at hjælpe dig med at få mest muligt ud af vores undervisningsplatform. 
                Tøv ikke med at kontakte os, hvis du har spørgsmål, forslag eller har brug for teknisk support.
              </p>
              <div className="mt-6 flex justify-center space-x-4">
                <Button variant="outline" onClick={handleEmailClick}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" onClick={handleLinkedInClick}>
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button variant="outline" onClick={handleYouTubeClick}>
                  <Youtube className="h-4 w-4 mr-2" />
                  YouTube
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
