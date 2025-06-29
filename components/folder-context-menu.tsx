"use client";

import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { TaskFolder } from "@/lib/types";
import { updateFolder, deleteFolder } from "@/lib/database/folders";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

interface FolderContextMenuProps {
  children: React.ReactNode;
  folder: TaskFolder;
  onFolderUpdated?: () => void;
  onFolderDeleted?: () => void;
}

export function FolderContextMenu({ 
  children, 
  folder, 
  onFolderUpdated,
  onFolderDeleted 
}: FolderContextMenuProps) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState(folder.name);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleRename = async () => {
    if (!user || !newFolderName.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await updateFolder(folder.id, user.id, { 
        name: newFolderName.trim() 
      });
      
      if (result) {
        toast.success("Mappe omdøbt");
        setIsRenameDialogOpen(false);
        onFolderUpdated?.();
      } else {
        toast.error("Kunne ikke omdøbe mappe");
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Kunne ikke omdøbe mappe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const result = await deleteFolder(folder.id, user.id);
      
      if (result) {
        toast.success("Mappe slettet");
        setIsDeleteDialogOpen(false);
        onFolderDeleted?.();
      } else {
        toast.error("Kunne ikke slette mappe");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Kunne ikke slette mappe");
    } finally {
      setIsLoading(false);
    }
  };

  const openRenameDialog = () => {
    setNewFolderName(folder.name);
    setIsRenameDialogOpen(true);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            onClick={openRenameDialog}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Omdøb mappe
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Slet mappe
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Omdøb mappe</DialogTitle>
            <DialogDescription>
              Indtast et nyt navn for mappen "{folder.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-name" className="text-right">
                Navn
              </Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
                placeholder="Indtast mappenavn"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
              disabled={isLoading}
            >
              Annuller
            </Button>
            <Button
              type="button"
              onClick={handleRename}
              disabled={isLoading || !newFolderName.trim()}
            >
              {isLoading ? "Omdøber..." : "Omdøb"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slet mappe</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på, at du vil slette mappen "{folder.name}"? 
              Alle opgaver i mappen vil blive flyttet tilbage til hovedlisten.
              Denne handling kan ikke fortrydes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Annuller
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Sletter..." : "Slet mappe"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
