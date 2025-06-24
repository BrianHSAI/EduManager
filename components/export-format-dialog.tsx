"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, FileDown, Package } from 'lucide-react';
import { ExportFormat } from '@/lib/export';

interface ExportFormatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, asZip?: boolean) => void;
  title: string;
  description: string;
  showZipOption?: boolean;
}

export function ExportFormatDialog({
  isOpen,
  onClose,
  onExport,
  title,
  description,
  showZipOption = false
}: ExportFormatDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('word');
  const [asZip, setAsZip] = useState(false);

  const handleExport = () => {
    onExport(selectedFormat, showZipOption ? asZip : false);
    onClose();
  };

  const handleClose = () => {
    setSelectedFormat('word');
    setAsZip(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <Label className="text-base font-medium">Vælg filformat</Label>
            <RadioGroup
              value={selectedFormat}
              onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
              className="mt-3"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="word" id="word" />
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <Label htmlFor="word" className="font-medium cursor-pointer">
                    Word Document
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Eksporter som .docx fil (Microsoft Word)
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="pdf" id="pdf" />
                <FileDown className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <Label htmlFor="pdf" className="font-medium cursor-pointer">
                    PDF Document
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Eksporter som .pdf fil (Portable Document Format)
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Zip Option */}
          {showZipOption && (
            <div>
              <Label className="text-base font-medium">Eksport muligheder</Label>
              <RadioGroup
                value={asZip ? 'zip' : 'single'}
                onValueChange={(value) => setAsZip(value === 'zip')}
                className="mt-3"
              >
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="single" id="single" />
                  <FileText className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <Label htmlFor="single" className="font-medium cursor-pointer">
                      Enkelt fil
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Alle besvarelser i én samlet fil
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="zip" id="zip" />
                  <Package className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <Label htmlFor="zip" className="font-medium cursor-pointer">
                      ZIP arkiv
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Separate filer for hver elev i en ZIP-fil
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Annuller
            </Button>
            <Button onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-2" />
              Eksporter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
