import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { uploadMedia } from '@/lib/cms/api';
import type { CmsField } from '@/lib/cms/schema';
import { Loader2, Upload } from 'lucide-react';

interface CmsFieldInputProps {
    field: CmsField;
    value: unknown;
    onChange: (value: unknown) => void;
}

/** ISO timestamp <-> the local "YYYY-MM-DDTHH:mm" string a datetime-local input expects. */
const toLocalInput = (iso: unknown) => {
    const date = new Date(String(iso ?? ''));
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const ImageInput = ({ field, value, onChange }: CmsFieldInputProps) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();
    const url = typeof value === 'string' ? value : '';

    const handleFile = async (file: File | undefined) => {
        if (!file) {
            return;
        }
        try {
            setUploading(true);
            onChange(await uploadMedia(file));
        } catch (error) {
            toast({ title: 'Upload failed', description: (error as Error).message, variant: 'destructive' });
        } finally {
            setUploading(false);
            if (fileRef.current) {
                fileRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex items-start gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                {url && <img src={url} alt="" className="h-full w-full object-contain" />}
            </div>
            <div className="flex-1 space-y-2">
                <Input id={field.name} value={url} placeholder="/path/in/public.avif or https://…" onChange={(e) => onChange(e.target.value)} />
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                <Button type="button" variant="outline" size="sm" className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50" disabled={uploading} onClick={() => fileRef.current?.click()}>
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload image
                </Button>
            </div>
        </div>
    );
};

/** Edits free text; splits into a tag list only on blur, so commas can be typed. */
const TagsInput = ({ field, value, onChange }: CmsFieldInputProps) => {
    const [draft, setDraft] = useState(Array.isArray(value) ? value.join(', ') : String(value ?? ''));
    return (
        <Input
            id={field.name}
            placeholder="comma, separated, tags"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onChange(draft.split(',').map((tag) => tag.trim()).filter(Boolean))}
        />
    );
};

const CmsFieldInput = ({ field, value, onChange }: CmsFieldInputProps) => {
    const text = value === undefined || value === null ? '' : String(value);

    switch (field.type) {
    case 'textarea':
        return <Textarea id={field.name} rows={3} value={text} onChange={(e) => onChange(e.target.value)} />;
    case 'markdown':
        return <Textarea id={field.name} rows={14} className="font-mono text-sm" value={text} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
        return (
            <Input
                id={field.name}
                type="number"
                step="any"
                value={text}
                onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            />
        );
    case 'date':
        return <Input id={field.name} type="date" value={text.slice(0, 10)} onChange={(e) => onChange(e.target.value)} />;
    case 'datetime':
        return (
            <Input
                id={field.name}
                type="datetime-local"
                value={toLocalInput(value)}
                onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
            />
        );
    case 'boolean':
        return <Switch id={field.name} className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300" checked={Boolean(value)} onCheckedChange={onChange} />;
    case 'select':
        return (
            <Select value={text} onValueChange={onChange}>
                <SelectTrigger id={field.name}>
                    <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                    {(field.options ?? []).map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    case 'tags':
        return <TagsInput field={field} value={value} onChange={onChange} />;
    case 'image':
        return <ImageInput field={field} value={value} onChange={onChange} />;
    default:
        return <Input id={field.name} type={field.type === 'url' ? 'url' : 'text'} value={text} onChange={(e) => onChange(e.target.value)} />;
    }
};

export default CmsFieldInput;
