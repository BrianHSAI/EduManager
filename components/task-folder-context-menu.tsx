"use client";

import { useState, useEffect } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Folder, FolderX } from "lucide-react";
import { TaskFolder } from "@/lib/types";
import { 
  getFoldersByStudent, 
  assignTaskToFolder, 
  removeTaskFromFolder,
  getTaskFolder 
} from "@/lib/database";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

interface TaskFolderContextMenuProps {
  children: React.ReactNode;
  taskId: string;
  onFolderAssigned?: () => void;
}

export function TaskFolderContextMenu({ 
  children, 
  taskId, 
  onFolderAssigned 
}: TaskFolderContextMenuProps) {
  const [folders, setFolders] = useState<TaskFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<TaskFolder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFolders();
      loadCurrentFolder();
    }
  }, [user, taskId]);

  const loadFolders = async () => {
    if (!user) return;
    
    try {
      const userFolders = await getFoldersByStudent(user.id);
      setFolders(userFolders);
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  };

  const loadCurrentFolder = async () => {
    if (!user) return;
    
    try {
      const folder = await getTaskFolder(taskId, user.id);
      setCurrentFolder(folder);
    } catch (error) {
      console.error("Error loading current folder:", error);
    }
  };

  const handleAssignToFolder = async (folderId: string, folderName: string) => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const result = await assignTaskToFolder(taskId, folderId, user.id);
      if (result) {
        toast.success(`Opgave flyttet til "${folderName}"`);
        await loadCurrentFolder();
        onFolderAssigned?.();
      } else {
        toast.error("Kunne ikke flytte opgave til mappe");
      }
    } catch (error) {
      console.error("Error assigning task to folder:", error);
      toast.error("Kunne ikke flytte opgave til mappe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromFolder = async () => {
    if (!user || !currentFolder || isLoading) return;

    setIsLoading(true);
    try {
      const result = await removeTaskFromFolder(taskId, user.id);
      if (result) {
        toast.success("Opgave fjernet fra mappe");
        setCurrentFolder(null);
        onFolderAssigned?.();
      } else {
        toast.error("Kunne ikke fjerne opgave fra mappe");
      }
    } catch (error) {
      console.error("Error removing task from folder:", error);
      toast.error("Kunne ikke fjerne opgave fra mappe");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {folders.length > 0 ? (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Folder className="h-4 w-4 mr-2" />
                Flyt til mappe
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                {folders.map((folder) => (
                  <ContextMenuItem
                    key={folder.id}
                    onClick={() => handleAssignToFolder(folder.id, folder.name)}
                    disabled={isLoading || currentFolder?.id === folder.id}
                    className="flex items-center"
                  >
                    <div 
                      className={`w-3 h-3 rounded mr-2 border ${folder.color || 'bg-gray-100 border-gray-200'}`}
                    />
                    <span className="flex-1">{folder.name}</span>
                    {currentFolder?.id === folder.id && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Nuværende)
                      </span>
                    )}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
            {currentFolder && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={handleRemoveFromFolder}
                  disabled={isLoading}
                  className="flex items-center text-red-600"
                >
                  <FolderX className="h-4 w-4 mr-2" />
                  Fjern fra mappe
                </ContextMenuItem>
              </>
            )}
          </>
        ) : (
          <ContextMenuItem disabled>
            <Folder className="h-4 w-4 mr-2" />
            Ingen mapper tilgængelige
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
