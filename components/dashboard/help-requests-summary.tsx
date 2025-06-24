"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface HelpRequestsSummaryProps {
  helpRequestsCount: number;
  onNavigate: (tab: string) => void;
}

export function HelpRequestsSummary({ helpRequestsCount, onNavigate }: HelpRequestsSummaryProps) {
  if (helpRequestsCount === 0) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span>Elever der har brug for hjælp</span>
        </CardTitle>
        <CardDescription className="text-red-700">
          {helpRequestsCount} elever har anmodet om hjælp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">Se alle hjælp anmodninger</p>
          <Button
            onClick={() => onNavigate("help-requests")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Gå til Hjælp Anmodninger
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
