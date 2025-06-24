"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  FileText,
  Settings,
  Bell,
  Menu,
  X,
  HelpCircle,
  Mail,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { LogoutButton } from "@/components/logout-button";
import { mockSubmissions } from "@/lib/mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
}: DashboardLayoutProps) {
  const { user: currentUser } = useAuth();

  // Calculate actual help requests count
  const helpRequestsCount = mockSubmissions.filter((s) => s.needsHelp).length;

  const navigation = [
    { id: "overview", name: "Oversigt", icon: BookOpen },
    { id: "groups", name: "Grupper", icon: Users },
    { id: "tasks", name: "Opgaver", icon: FileText },
    {
      id: "help-requests",
      name: "Hjælp Anmodninger",
      icon: HelpCircle,
      badge: helpRequestsCount > 0 ? helpRequestsCount : undefined,
    },
    { id: "kontakt", name: "Kontakt", icon: Mail },
  ];

  // Don't render if user is not loaded yet
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Indlæser...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-blue-600">
                    Homework Delight
                  </h1>
                  <p className="text-xs text-gray-500">Undervisningsplatform</p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`
                        flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative
                        ${
                          activeTab === item.id
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge className="ml-2 bg-red-500 text-white border-0 text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right side - Notifications, Settings, and Profile */}
            <div className="flex items-center space-x-4">
              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Indstillinger</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profil</DropdownMenuItem>
                  <DropdownMenuItem>Præferencer</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <LogoutButton
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto font-normal"
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile */}
              {currentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-3 pl-4 border-l border-gray-200 h-auto p-2 hover:bg-gray-50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser.avatar || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {currentUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {currentUser.name}
                        </p>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-xs text-green-600 font-medium">
                            Online
                          </span>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Min Konto</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profil</DropdownMenuItem>
                    <DropdownMenuItem>Indstillinger</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <LogoutButton
                        variant="ghost"
                        className="w-full justify-start p-0 h-auto font-normal"
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
