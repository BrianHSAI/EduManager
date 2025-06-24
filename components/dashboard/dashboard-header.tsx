"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface DashboardHeaderProps {
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
}

export function DashboardHeader({ onNavigate, onRefresh }: DashboardHeaderProps) {
  const { user: currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Velkommen til EduManager
        </h1>
        <p className="text-gray-600 mb-8">
          Kom i gang ved at oprette din første gruppe og opgave
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => onNavigate("groups")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            + Opret Gruppe
          </Button>
          <Button
            onClick={() => onNavigate("tasks")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            + Opret Opgave
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Velkommen tilbage, {currentUser.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Her er et overblik over dine klasser og opgaver
        </p>
      </div>
      <div className="flex space-x-3">
        <Button
          onClick={() => onNavigate("groups")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Opret Gruppe
        </Button>
        <Button
          onClick={() => onNavigate("tasks")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Opret Opgave
        </Button>
        <Button
          variant="outline"
          onClick={onRefresh}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Opdater</span>
        </Button>
      </div>
    </div>
  );
}
