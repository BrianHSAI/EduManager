"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus } from "lucide-react";
import { createFolder } from "@/lib/database";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

interface FolderCreationDialogProps {
  onFolderCreated?: () => void;
}

const FOLDER_COLORS = [
  { name: "Blå", value: "bg-blue-100 text-blue-800 border-blue-200" },
  { name: "Grøn", value: "bg-green-100 text-green-800 border-green-200" },
  { name: "Gul", value: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { name: "Rød", value: "bg-red-100 text-red-800 border-red-200" },
  { name: "Lilla", value: "bg-purple-100 text-purple-800 border-purple-200" },
  { name: "Orange", value: "bg-orange-100 text-orange-800 border-orange-200" },
  { name: "Pink", value: "bg-pink-100 text-pink-800 border-pink-200" },
  { name: "Grå", value: "bg-gray-100 text-gray-800 border-gray-200" },
];

export function FolderCreationDialog({
  onFolderCreated,
}: FolderCreationDialogProps) {
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].value);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  const handleCreateFolder = async () => {
    if (!folderName.trim() || !user) return;

    setIsCreating(true);
    try {
      const folder = await createFolder(
        folderName.trim(),
        user.id,
        selectedColor
      );
      if (folder) {
        toast.success("Mappe oprettet!");
        setFolderName("");
        setSelectedColor(FOLDER_COLORS[0].value);
        setOpen(false);
        onFolderCreated?.();
      } else {
        toast.error("Kunne ikke oprette mappe");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Kunne ikke oprette mappe");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isCreating) {
      handleCreateFolder();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <FolderPlus className="h-4 w-4" />
          <span className="text-sm">Opret Mappe</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Opret Ny Mappe</DialogTitle>
          <DialogDescription>
            Opret en mappe til at organisere dine opgaver.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="folder-name" className="text-right">
              Navn
            </Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Mappenavn..."
              className="col-span-3"
              maxLength={50}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Farve</Label>
            <div className="col-span-3 grid grid-cols-4 gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`
                    w-8 h-8 rounded border-2 transition-all
                    ${color.value}
                    ${
                      selectedColor === color.value
                        ? "ring-2 ring-primary ring-offset-2"
                        : ""
                    }
                  `}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isCreating}
          >
            Annuller
          </Button>
          <Button
            type="button"
            onClick={handleCreateFolder}
            disabled={!folderName.trim() || isCreating}
          >
            {isCreating ? "Opretter..." : "Opret Mappe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
