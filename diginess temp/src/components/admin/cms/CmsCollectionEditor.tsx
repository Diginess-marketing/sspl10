import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { deleteRow, fetchAllRows, importItems, saveRow, updateRowFields, type CmsRow } from '@/lib/cms/api';
import { BUILT_IN_CONTENT } from '@/lib/cms/builtInContent';
import { CMS_COLLECTIONS, getPath, type CmsCollectionKey } from '@/lib/cms/schema';
import { cmsQueryKey } from '@/lib/cms/useCmsCollection';
import { ActionButton, ConfirmDialog, DataTableShell, StatusBadge } from '@/components/admin/ui';
import CmsItemDialog, { type CmsItemDraft } from './CmsItemDialog';
import { ArrowDown, ArrowUp, Download, Pencil, Plus, Trash2 } from 'lucide-react';

const errorMessage = (error: unknown) => {
    const message = (error as { message?: string })?.message || 'Something went wrong';
    return message.includes('duplicate key') ? 'Another item already uses this slug / ID. Change it and save again.' : message;
};

const SWITCH_CLS = 'data-[state=checked]:bg-[var(--brand-blue)] data-[state=unchecked]:bg-[var(--brand-sky-2)]';

const CmsCollectionEditor = ({ collection }: { collection: CmsCollectionKey }) => {
    const def = CMS_COLLECTIONS[collection];
    const queryClient = useQueryClient();
    const adminKey = ['cms-admin', collection];
    const [editing, setEditing] = useState<CmsItemDraft | null>(null);
    const [deleting, setDeleting] = useState<CmsRow | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const { data: rows = [], isLoading, error } = useQuery({
        queryKey: adminKey,
        queryFn: () => fetchAllRows(collection),
    });

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: adminKey });
        queryClient.invalidateQueries({ queryKey: cmsQueryKey(collection) });
    };
    const onError = (err: unknown) => toast.error('Something went wrong', { description: errorMessage(err) });

    const save = useMutation({
        mutationFn: (item: CmsItemDraft) => saveRow(collection, item),
        onSuccess: () => {
            toast.success('Saved', { description: 'The website now shows your changes.' });
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
            toast.success('Item deleted');
            setDeleting(null);
            refresh();
        },
        onError,
    });
    const seed = useMutation({
        mutationFn: () => importItems(collection, BUILT_IN_CONTENT[collection]()),
        onSuccess: ({ count, failed }) => {
            if (failed.length) {
                toast.warning(`Imported ${count} items, ${failed.length} image(s) not copied`, { description: `Still served from the site: ${failed.join(', ')}` });
            } else {
                toast.success('Imported', { description: `${count} built-in items are now editable, with their images stored in the media library. Existing items were kept.` });
            }
            refresh();
        },
        onError,
    });

    const publishedCount = rows.filter((r) => r.is_published).length;

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return rows
            .filter((row) => (filter === 'published' ? row.is_published : filter === 'draft' ? !row.is_published : true))
            .filter((row) => (q ? JSON.stringify(row.data).toLowerCase().includes(q) : true));
    }, [rows, search, filter]);

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
    const reorderLocked = Boolean(search) || filter !== 'all';

    return (
        <>
            <DataTableShell
                title={def.label}
                description={def.description}
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder={`Search ${rows.length} items…`}
                filters={[
                    { value: 'all', label: 'All', count: rows.length },
                    { value: 'published', label: 'Published', count: publishedCount },
                    { value: 'draft', label: 'Draft', count: rows.length - publishedCount },
                ]}
                activeFilter={filter}
                onFilterChange={setFilter}
                actions={
                    <>
                        <ActionButton variant="outline" icon={Download} loading={seed.isPending} onClick={() => seed.mutate()}>Import current content</ActionButton>
                        <ActionButton variant="primary" icon={Plus} onClick={() => setEditing({ data: {}, is_published: true, sort_order: nextOrder })}>Add item</ActionButton>
                    </>
                }
                loading={isLoading}
                isEmpty={!error && filtered.length === 0}
                emptyTitle={rows.length === 0 ? 'Nothing here yet' : 'No items match'}
                emptyDescription={rows.length === 0
                    ? `The website is showing its built-in ${def.label.toLowerCase()}. Import current content to copy it here and start editing, or add items one by one.`
                    : 'Try a different search or filter.'}
            >
                {error ? (
                    /cms_items/.test(errorMessage(error)) && /schema cache|does not exist/.test(errorMessage(error)) ? (
                    <div className="space-y-1 p-5">
                        <p className="font-semibold text-[var(--admin-ink)]">Website content is not set up on this database yet.</p>
                        <p className="admin-muted">Run <code>supabase/RUN_ONCE_IN_SQL_EDITOR.sql</code> once in the Supabase SQL Editor (live project), then refresh this page.</p>
                    </div>
                ) : (
                    <p className="admin-muted p-5 !text-[var(--admin-bad)]">Could not load items: {errorMessage(error)}</p>
                )
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="w-[1%]">Order</th>
                                <th>Item</th>
                                <th>Status</th>
                                <th>Published</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((row) => {
                                const index = rows.indexOf(row);
                                return (
                                    <tr key={row.id}>
                                        <td>
                                            <div className="flex gap-1">
                                                <ActionButton variant="ghost" size="sm" icon={ArrowUp} aria-label="Move up" disabled={index === 0 || patch.isPending || reorderLocked} onClick={() => move(index, -1)} />
                                                <ActionButton variant="ghost" size="sm" icon={ArrowDown} aria-label="Move down" disabled={index === rows.length - 1 || patch.isPending || reorderLocked} onClick={() => move(index, 1)} />
                                            </div>
                                        </td>
                                        <td className="min-w-[200px]">
                                            <p className="truncate font-semibold text-[var(--admin-ink)]">{label(row, def.titleField) || '(untitled)'}</p>
                                            {def.subtitleField && <p className="admin-muted truncate">{label(row, def.subtitleField)}</p>}
                                        </td>
                                        <td><StatusBadge status={row.is_published ? 'active' : 'pending'} label={row.is_published ? 'Live' : 'Draft'} /></td>
                                        <td>
                                            <Switch
                                                className={SWITCH_CLS}
                                                aria-label="Published"
                                                checked={row.is_published}
                                                disabled={patch.isPending}
                                                onCheckedChange={(checked) => patch.mutate([{ id: row.id, fields: { is_published: checked } }])}
                                            />
                                        </td>
                                        <td>
                                            <div className="flex justify-end gap-1">
                                                <ActionButton variant="soft" size="sm" icon={Pencil} aria-label="Edit" onClick={() => setEditing({ id: row.id, data: row.data, is_published: row.is_published, sort_order: row.sort_order })} />
                                                <ActionButton variant="danger" size="sm" icon={Trash2} aria-label="Delete" onClick={() => setDeleting(row)} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </DataTableShell>

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

            <ConfirmDialog
                open={Boolean(deleting)}
                onOpenChange={(open) => !open && setDeleting(null)}
                tone="danger"
                title="Delete this item?"
                description={`“${deleting ? label(deleting, def.titleField) || 'This item' : ''}” will be removed from the website. This cannot be undone.`}
                confirmLabel="Delete"
                loading={remove.isPending}
                onConfirm={() => { if (deleting) remove.mutate(deleting.id); }}
            />
        </>
    );
};

export default CmsCollectionEditor;
