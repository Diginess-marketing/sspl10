import React, { useState } from 'react';
import { Download, FileText, Table, FileSpreadsheet, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { playerExportService } from '@/utils/playerExportService';
import type { PlayerResult } from '@/types/playerData';

interface ExportModalProps {
  results: PlayerResult[];
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'json' | 'pdf', fields: (keyof PlayerResult)[]) => Promise<void>;
  isExporting?: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({
  results,
  isOpen,
  onClose,
  onExport,
  isExporting = false,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [selectedFields, setSelectedFields] = useState<Set<keyof PlayerResult>>(
    new Set(['name', 'mobile', 'state', 'proficiency', 'status']),
  );
  const [exportComplete, setExportComplete] = useState(false);

  const availableFields = [
    { key: 'name' as keyof PlayerResult, label: 'Player Name', description: 'Full name of the player' },
    { key: 'mobile' as keyof PlayerResult, label: 'Mobile Number', description: 'Contact mobile number' },
    { key: 'state' as keyof PlayerResult, label: 'State', description: 'Player\'s state' },
    { key: 'proficiency' as keyof PlayerResult, label: 'Proficiency', description: 'Cricket skill level/role' },
    { key: 'status' as keyof PlayerResult, label: 'Selection Status', description: 'Selected or Not Selected' },
  ];

  const formatOptions = playerExportService.getSupportedFormats();

  const handleFieldToggle = (fieldKey: keyof PlayerResult, checked: boolean) => {
    const newSelected = new Set(selectedFields);
    if (checked) {
      newSelected.add(fieldKey);
    } else {
      newSelected.delete(fieldKey);
    }
    setSelectedFields(newSelected);
  };

  const handleExport = async () => {
    if (selectedFields.size === 0) {
      return;
    }

    await onExport(selectedFormat, Array.from(selectedFields));
    setExportComplete(true);
    
    // Reset after a delay
    setTimeout(() => {
      setExportComplete(false);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    if (!isExporting) {
      setExportComplete(false);
      setSelectedFormat('csv');
      setSelectedFields(new Set(['name', 'mobile', 'state', 'proficiency', 'status']));
      onClose();
    }
  };

  const formatIcons = {
    csv: FileSpreadsheet,
    json: FileText,
    pdf: Table,
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-labelledby="export-dialog-title" aria-describedby="export-dialog-description">
        <DialogHeader>
          <DialogTitle id="export-dialog-title" className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Player Results
          </DialogTitle>
        </DialogHeader>

        <div id="export-dialog-description" className="space-y-6">
          {/* Results Summary */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Export Summary</h3>
            <p className="text-sm text-blue-800">
              Exporting <strong>{results.length}</strong> player result{results.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup
              value={selectedFormat}
              onValueChange={(value) => setSelectedFormat(value as 'csv' | 'json' | 'pdf')}
            >
              {formatOptions.map((option) => {
                const Icon = formatIcons[option.format];
                return (
                  <div key={option.format} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={option.format} id={option.format} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <Label htmlFor={option.format} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <Separator />

          {/* Field Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Fields to Include</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableFields.map((field) => (
                <div key={field.key} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.has(field.key)}
                    onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={field.key} className="font-medium cursor-pointer text-sm">
                      {field.label}
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">{field.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedFields.size === 0}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : exportComplete ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Export Complete
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
            
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isExporting}
            >
              Cancel
            </Button>
          </div>

          {/* Field Count */}
          <div className="text-sm text-gray-500 text-center">
            {selectedFields.size} field{selectedFields.size !== 1 ? 's' : ''} selected
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;