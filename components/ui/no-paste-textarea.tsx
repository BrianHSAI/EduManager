import * as React from "react"

import { cn } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NoPasteTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const NoPasteTextarea = React.forwardRef<HTMLTextAreaElement, NoPasteTextareaProps>(
  ({ className, onPaste, onDrop, onDragOver, ...props }, ref) => {
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      // Optionally call the original onPaste if provided
      if (onPaste) {
        onPaste(e);
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      // Optionally call the original onDrop if provided
      if (onDrop) {
        onDrop(e);
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      // Optionally call the original onDragOver if provided
      if (onDragOver) {
        onDragOver(e);
      }
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
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
NoPasteTextarea.displayName = "NoPasteTextarea"

export { NoPasteTextarea }
