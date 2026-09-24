import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CMS_COLLECTIONS, getPath, setPath, type CmsCollectionKey } from '@/lib/cms/schema';
import type { CmsData } from '@/lib/cms/api';
import CmsFieldInput from './CmsFieldInput';
import { Loader2 } from 'lucide-react';

export interface CmsItemDraft {
    id?: string;
    data: CmsData;
    is_published: boolean;
    sort_order: number;
}

interface CmsItemDialogProps {
    collection: CmsCollectionKey;
    item: CmsItemDraft;
    saving: boolean;
    onClose: () => void;
    onSave: (item: CmsItemDraft) => void;
}

const isBlank = (value: unknown) =>
    value === undefined || value === null || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && !value.length);

const CmsItemDialog = ({ collection, item, saving, onClose, onSave }: CmsItemDialogProps) => {
    const def = CMS_COLLECTIONS[collection];
    // Mounted fresh (keyed) per item by the parent, so props only seed the initial draft.
    const [draft, setDraft] = useState<CmsItemDraft>(item);
    const [missing, setMissing] = useState<string[]>([]);

    const handleSave = () => {
        const empty = def.fields.filter((f) => f.required && isBlank(getPath(draft.data, f.name))).map((f) => f.label);
        setMissing(empty);
        if (!empty.length) {
            onSave(draft);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto admin-scope bg-white">
                <DialogHeader>
                    <DialogTitle className="text-slate-900">{draft.id ? 'Edit' : 'Add'} {def.label.toLowerCase()} item</DialogTitle>
                    <DialogDescription>{def.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {def.fields.map((field) => (
                        <div key={field.name} className="space-y-1.5">
                            <Label htmlFor={field.name} className="text-slate-900">
                                {field.label}
                                {field.required && <span className="text-destructive"> *</span>}
                            </Label>
                            <CmsFieldInput
                                field={field}
                                value={getPath(draft.data, field.name)}
                                onChange={(value) => setDraft({ ...draft, data: setPath(draft.data, field.name, value) })}
                            />
                            {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
                        </div>
                    ))}

                    <div className="flex items-center gap-3 rounded-md border p-3">
                        <Switch
                            id="cms-published"
                            className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300"
                            checked={draft.is_published}
                            onCheckedChange={(checked) => setDraft({ ...draft, is_published: checked })}
                        />
                        <Label htmlFor="cms-published" className="text-slate-900">Published (visible on the website)</Label>
                    </div>

                    {missing.length > 0 && (
                        <p className="text-sm text-destructive">Please fill in: {missing.join(', ')}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CmsItemDialog;
