"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  MessageSquare, 
  Minimize2, 
  Maximize2, 
  HelpCircle,
  Send,
  User,
  GraduationCap
} from 'lucide-react';
import { HelpMessage } from '@/lib/types';

interface StudentHelpOverlayProps {
  helpMessages: HelpMessage[];
  isVisible: boolean;
  onClose: () => void;
  onRequestMoreHelp: (message: string) => void;
  taskTitle: string;
}

export function StudentHelpOverlay({ 
  helpMessages, 
  isVisible, 
  onClose, 
  onRequestMoreHelp,
  taskTitle 
}: StudentHelpOverlayProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 400, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [newHelpMessage, setNewHelpMessage] = useState('');
  const [isRequestingHelp, setIsRequestingHelp] = useState(false);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart]);

  const handleRequestMoreHelp = async () => {
    if (!newHelpMessage.trim()) return;
    
    setIsRequestingHelp(true);
    try {
      await onRequestMoreHelp(newHelpMessage.trim());
      setNewHelpMessage('');
    } catch (error) {
      console.error('Error requesting more help:', error);
    } finally {
      setIsRequestingHelp(false);
    }
  };

  if (!isVisible) return null;

  const teacherMessages = helpMessages.filter(msg => !msg.isFromStudent);
  const hasTeacherResponse = teacherMessages.length > 0;

  return (
    <div 
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-2xl"
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 300 : size.width,
        height: isMinimized ? 60 : size.height,
        minWidth: 300,
        minHeight: 200,
        maxWidth: '90vw',
        maxHeight: '90vh'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-blue-50 border-b cursor-move drag-handle rounded-t-lg"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-sm text-blue-900">
            {hasTeacherResponse ? 'Hjælp Givet' : 'Hjælp Anmodet'}
          </span>
          {hasTeacherResponse && (
            <Badge variant="secondary" className="text-xs">
              Ny besked
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Content */}
          <div className="flex flex-col h-full">
            <div className="p-3 border-b bg-gray-50">
              <p className="text-xs text-gray-600">Opgave: {taskTitle}</p>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {helpMessages
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.isFromStudent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isFromStudent 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.isFromStudent ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <GraduationCap className="h-3 w-3" />
                        )}
                        <span className="text-xs font-medium">
                          {message.isFromStudent ? 'Du' : 'Lærer'}
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(message.createdAt).toLocaleTimeString('da-DK', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                      {message.isFromStudent && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${message.isFromStudent ? 'border-blue-200 text-blue-100' : ''}`}
                          >
                            {message.urgency === 'high' ? 'Hurtigt' : 
                             message.urgency === 'medium' ? 'Moderat' : 'Ikke travlt'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Request more help section */}
            <div className="p-3 border-t bg-gray-50">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Har du brug for mere hjælp?</Label>
                <Textarea
                  value={newHelpMessage}
                  onChange={(e) => setNewHelpMessage(e.target.value)}
                  placeholder="Beskriv hvad du stadig har brug for hjælp til..."
                  rows={2}
                  className="text-sm resize-none"
                />
                <Button
                  size="sm"
                  onClick={handleRequestMoreHelp}
                  disabled={!newHelpMessage.trim() || isRequestingHelp}
                  className="w-full"
                >
                  {isRequestingHelp ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                      Sender...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3 mr-2" />
                      Anmod om Mere Hjælp
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Resize handle */}
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => {
              setIsResizing(true);
              setDragStart({
                x: e.clientX - size.width,
                y: e.clientY - size.height
              });
            }}
          >
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400"></div>
          </div>
        </>
      )}
    </div>
  );
}
