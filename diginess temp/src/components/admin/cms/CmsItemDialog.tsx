import { useState } from 'react';
import { DetailDrawer, ActionButton } from '@/components/admin/ui';
import { Switch } from '@/components/ui/switch';
import { CMS_COLLECTIONS, getPath, setPath, type CmsCollectionKey } from '@/lib/cms/schema';
import type { CmsData } from '@/lib/cms/api';
import CmsFieldInput from './CmsFieldInput';
import { Save } from 'lucide-react';

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
        <DetailDrawer
            open
            onOpenChange={(open) => !open && onClose()}
            eyebrow={def.label}
            title={`${draft.id ? 'Edit' : 'Add'} item`}
            description={def.description}
            footer={
                <>
                    <ActionButton variant="ghost" onClick={onClose} disabled={saving}>Cancel</ActionButton>
                    <ActionButton variant="primary" icon={Save} loading={saving} onClick={handleSave}>Save</ActionButton>
                </>
            }
        >
            <div className="space-y-5">
                {def.fields.map((field) => (
                    <div key={field.name}>
                        <label htmlFor={field.name} className="admin-label">
                            {field.label}
                            {field.required && <span className="text-[var(--admin-bad)]">*</span>}
                        </label>
                        <CmsFieldInput
                            field={field}
                            value={getPath(draft.data, field.name)}
                            onChange={(value) => setDraft({ ...draft, data: setPath(draft.data, field.name, value) })}
                        />
                        {field.help && <p className="admin-muted mt-1.5">{field.help}</p>}
                    </div>
                ))}

                <div className="admin-summary items-center justify-between">
                    <label htmlFor="cms-published" className="admin-label !mb-0">Published (visible on the website)</label>
                    <Switch
                        id="cms-published"
                        className="data-[state=checked]:bg-[var(--brand-blue)] data-[state=unchecked]:bg-[var(--brand-sky-2)]"
                        checked={draft.is_published}
                        onCheckedChange={(checked) => setDraft({ ...draft, is_published: checked })}
                    />
                </div>

                {missing.length > 0 && (
                    <p className="admin-muted !text-[var(--admin-bad)]">Please fill in: {missing.join(', ')}</p>
                )}
            </div>
        </DetailDrawer>
    );
};

export default CmsItemDialog;
