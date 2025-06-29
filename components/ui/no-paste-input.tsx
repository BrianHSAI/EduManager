import * as React from "react"

import { cn } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NoPasteInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const NoPasteInput = React.forwardRef<HTMLInputElement, NoPasteInputProps>(
  ({ className, type, onPaste, onDrop, onDragOver, ...props }, ref) => {
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      // Optionally call the original onPaste if provided
      if (onPaste) {
        onPaste(e);
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
      e.preventDefault();
      // Optionally call the original onDrop if provided
      if (onDrop) {
        onDrop(e);
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
      e.preventDefault();
      // Optionally call the original onDragOver if provided
      if (onDragOver) {
        onDragOver(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        {...props}
      />
    )
  }
)
NoPasteInput.displayName = "NoPasteInput"

export { NoPasteInput }
