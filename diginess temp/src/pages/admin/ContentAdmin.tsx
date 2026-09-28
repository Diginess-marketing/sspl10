import { useState } from 'react';
import ContentManagement from '@/components/ContentManagement';
import CmsCollectionEditor from '@/components/admin/cms/CmsCollectionEditor';
import { CMS_COLLECTIONS, CMS_COLLECTION_KEYS } from '@/lib/cms/schema';
import { PageHeader } from '@/components/admin/ui';

const PAGE_TEXT_TAB = 'page-text';

/** /admin/content: edit the website's content without a code change or redeploy. */
const ContentAdmin = () => {
    const [tab, setTab] = useState<string>(CMS_COLLECTION_KEYS[0]);

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Content management"
                title={<>Website <em>content</em></>}
                description="Changes go live on the website as soon as you save. Draft items stay hidden until published."
            />

            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Content collections">
                {CMS_COLLECTION_KEYS.map((key) => (
                    <button key={key} type="button" role="tab" aria-selected={tab === key} className="admin-chip" data-active={tab === key} onClick={() => setTab(key)}>
                        {CMS_COLLECTIONS[key].label}
                    </button>
                ))}
                <button type="button" role="tab" aria-selected={tab === PAGE_TEXT_TAB} className="admin-chip" data-active={tab === PAGE_TEXT_TAB} onClick={() => setTab(PAGE_TEXT_TAB)}>
                    Page text
                </button>
            </div>

            <div className="min-w-0">
                {CMS_COLLECTION_KEYS.map((key) => tab === key && <CmsCollectionEditor key={key} collection={key} />)}
                {tab === PAGE_TEXT_TAB && <div className="admin-card p-5"><ContentManagement /></div>}
            </div>
        </div>
    );
};

export default ContentAdmin;
