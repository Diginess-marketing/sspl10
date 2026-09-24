import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContentManagement from '@/components/ContentManagement';
import CmsCollectionEditor from '@/components/admin/cms/CmsCollectionEditor';
import { CMS_COLLECTIONS, CMS_COLLECTION_KEYS } from '@/lib/cms/schema';
import { FileText } from 'lucide-react';

const PAGE_TEXT_TAB = 'page-text';

/** /admin/content: edit the website's content without a code change or redeploy. */
const ContentAdmin = () => {
    const [tab, setTab] = useState<string>(CMS_COLLECTION_KEYS[0]);

    return (
        <div className="space-y-6 text-slate-900">
            <div>
                <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
                    <FileText className="h-6 w-6" /> Website content
                </h1>
                <p className="text-muted-foreground mt-1">
                    Changes go live on the website as soon as you save. Draft items stay hidden until published.
                </p>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="flex h-auto flex-wrap justify-start gap-1">
                    {CMS_COLLECTION_KEYS.map((key) => (
                        <TabsTrigger key={key} value={key}>
                            {CMS_COLLECTIONS[key].label}
                        </TabsTrigger>
                    ))}
                    <TabsTrigger value={PAGE_TEXT_TAB}>Page text</TabsTrigger>
                </TabsList>

                {CMS_COLLECTION_KEYS.map((key) => (
                    <TabsContent key={key} value={key} className="mt-4">
                        {tab === key && <CmsCollectionEditor collection={key} />}
                    </TabsContent>
                ))}
                <TabsContent value={PAGE_TEXT_TAB} className="mt-4">
                    {tab === PAGE_TEXT_TAB && <ContentManagement />}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ContentAdmin;
