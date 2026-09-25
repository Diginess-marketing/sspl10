import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteRow, fetchAllRows, importItems, saveRow, updateRowFields, type CmsRow } from '@/lib/cms/api';
import { BUILT_IN_CONTENT } from '@/lib/cms/builtInContent';
import { CMS_COLLECTIONS, getPath, type CmsCollectionKey } from '@/lib/cms/schema';
import { cmsQueryKey } from '@/lib/cms/useCmsCollection';
import CmsItemDialog, { type CmsItemDraft } from './CmsItemDialog';
import { ArrowDown, ArrowUp, Download, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';

const errorMessage = (error: unknown) => {
    const message = (error as { message?: string })?.message || 'Something went wrong';
    return message.includes('duplicate key') ? 'Another item already uses this slug / ID. Change it and save again.' : message;
};

const CmsCollectionEditor = ({ collection }: { collection: CmsCollectionKey }) => {
    const def = CMS_COLLECTIONS[collection];
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const adminKey = ['cms-admin', collection];
    const [editing, setEditing] = useState<CmsItemDraft | null>(null);
    const [deleting, setDeleting] = useState<CmsRow | null>(null);
    const [search, setSearch] = useState('');

    const { data: rows = [], isLoading, error } = useQuery({
        queryKey: adminKey,
        queryFn: () => fetchAllRows(collection),
    });

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: adminKey });
        queryClient.invalidateQueries({ queryKey: cmsQueryKey(collection) });
    };
    const onError = (err: unknown) => toast({ title: 'Error', description: errorMessage(err), variant: 'destructive' });

    const save = useMutation({
        mutationFn: (item: CmsItemDraft) => saveRow(collection, item),
        onSuccess: () => {
            toast({ title: 'Saved', description: 'The website now shows your changes.' });
            setEditing(null);
            refresh();
        },
        onError,
    });
    const patch = useMutation({
        mutationFn: (changes: { id: string; fields: Partial<Pick<CmsRow, 'sort_order' | 'is_published'>> }[]) =>
            Promise.all(changes.map((c) => updateRowFields(c.id, c.fields))),
        onSuccess: refresh,
        onError,
    });
    const remove = useMutation({
        mutationFn: (id: string) => deleteRow(id),
        onSuccess: () => {
            toast({ title: 'Deleted' });
            setDeleting(null);
            refresh();
        },
        onError,
    });
    const seed = useMutation({
        mutationFn: () => importItems(collection, BUILT_IN_CONTENT[collection]()),
        onSuccess: ({ count, failed }) => {
            toast(failed.length
                ? { title: `Imported ${count} items, ${failed.length} image(s) not copied`, description: `Still served from the site: ${failed.join(', ')}`, variant: 'destructive' }
                : { title: 'Imported', description: `${count} built-in items are now editable, with their images stored in the media library. Existing items were kept.` });
            refresh();
        },
        onError,
    });

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? rows.filter((row) => JSON.stringify(row.data).toLowerCase().includes(q)) : rows;
    }, [rows, search]);

    const move = (index: number, direction: -1 | 1) => {
        const target = rows[index + direction];
        if (!target) {
            return;
        }
        // Renumber the whole list so ties in sort_order can never block a move.
        const ordered = [...rows];
        [ordered[index], ordered[index + direction]] = [ordered[index + direction], ordered[index]];
        patch.mutate(
            ordered
                .map((row, i) => ({ id: row.id, fields: { sort_order: (i + 1) * 10 }, current: row.sort_order }))
                .filter((c) => c.current !== c.fields.sort_order)
                .map(({ id, fields }) => ({ id, fields })),
        );
    };

    const nextOrder = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 10 : 10;
    const label = (row: CmsRow, field?: string) => {
        const value = field ? getPath(row.data, field) : undefined;
        return value === undefined || value === null ? '' : String(value);
    };

    return (
        <Card className="text-slate-900">
            <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-start md:justify-between">
                <div>
                    <CardTitle className="text-slate-900">{def.label}</CardTitle>
                    <CardDescription>{def.description}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50" onClick={() => seed.mutate()} disabled={seed.isPending}>
                        {seed.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Import current content
                    </Button>
                    <Button onClick={() => setEditing({ data: {}, is_published: true, sort_order: nextOrder })}>
                        <Plus className="mr-2 h-4 w-4" /> Add item
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {error ? (
                    <p className="text-sm text-destructive">Could not load items: {errorMessage(error)}</p>
                ) : isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : rows.length === 0 ? (
                    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                        Nothing here yet, so the website is showing its built-in {def.label.toLowerCase()}.
                        <br />
                        Click <strong>Import current content</strong> to copy it here and start editing, or add items one by one.
                    </div>
                ) : (
                    <>
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input className="pl-9" placeholder={`Search ${rows.length} items…`} value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>

                        <ul className="divide-y rounded-md border">
                            {filtered.map((row) => {
                                const index = rows.indexOf(row);
                                return (
                                    <li key={row.id} className="flex flex-wrap items-center gap-3 p-3">
                                        <div className="flex flex-col">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 min-h-0 text-slate-600 hover:bg-slate-100" aria-label="Move up" disabled={index === 0 || patch.isPending || Boolean(search)} onClick={() => move(index, -1)}>
                                                <ArrowUp className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 min-h-0 text-slate-600 hover:bg-slate-100" aria-label="Move down" disabled={index === rows.length - 1 || patch.isPending || Boolean(search)} onClick={() => move(index, 1)}>
                                                <ArrowDown className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium text-slate-900">{label(row, def.titleField) || '(untitled)'}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {def.subtitleField && label(row, def.subtitleField)}
                                                {!row.is_published && <Badge variant="secondary" className="ml-2">Draft</Badge>}
                                            </p>
                                        </div>
                                        <Switch
                                            className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300"
                                            aria-label="Published"
                                            checked={row.is_published}
                                            disabled={patch.isPending}
                                            onCheckedChange={(checked) => patch.mutate([{ id: row.id, fields: { is_published: checked } }])}
                                        />
                                        <Button variant="ghost" size="icon" className="text-slate-700 hover:bg-slate-100" aria-label="Edit" onClick={() => setEditing({ id: row.id, data: row.data, is_published: row.is_published, sort_order: row.sort_order })}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:bg-red-50" aria-label="Delete" onClick={() => setDeleting(row)}>
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </CardContent>

            {editing && (
                <CmsItemDialog
                    key={editing.id ?? 'new'}
                    collection={collection}
                    item={editing}
                    saving={save.isPending}
                    onClose={() => setEditing(null)}
                    onSave={(item) => save.mutate(item)}
                />
            )}

            <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent className="admin-scope">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900">Delete this item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            “{deleting && (label(deleting, def.titleField) || 'This item')}” will be removed from the website. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleting && remove.mutate(deleting.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default CmsCollectionEditor;
