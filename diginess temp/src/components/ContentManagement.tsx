import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Edit, Save, X, Plus } from 'lucide-react';

type ContentSection = Tables<'website_content'>;

const ContentManagement = () => {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContentSections();
  }, []);

  const fetchContentSections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .order('section_name');

      if (error) throw error;
      setSections(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch content sections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (section: ContentSection) => {
    setEditingSection(section.section_name);
    setEditContent(JSON.parse(JSON.stringify(section.content))); // Deep copy
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditContent({});
  };

  const saveContent = async (sectionName: string) => {
    try {
      const { error } = await supabase
        .from('website_content')
        .update({
          content: editContent,
          updated_at: new Date().toISOString(),
        })
        .eq('section_name', sectionName);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Content updated successfully',
      });

      setEditingSection(null);
      setEditContent({});
      fetchContentSections(); // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update content',
        variant: 'destructive',
      });
    }
  };

  const addNewSection = async () => {
    const sectionName = prompt('Enter section name:');
    if (!sectionName) return;

    try {
      const { error } = await supabase
        .from('website_content')
        .insert({
          section_name: sectionName,
          content: { title: '', description: '' },
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'New section created',
      });

      fetchContentSections();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create section',
        variant: 'destructive',
      });
    }
  };

  const deleteSection = async (sectionName: string) => {
    if (!confirm(`Are you sure you want to delete the "${sectionName}" section?`)) return;

    try {
      const { error } = await supabase
        .from('website_content')
        .delete()
        .eq('section_name', sectionName);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Section deleted successfully',
      });

      fetchContentSections();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete section',
        variant: 'destructive',
      });
    }
  };

  const renderContentEditor = (section: ContentSection) => {
    if (editingSection !== section.section_name) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{section.section_name}</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => startEditing(section)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteSection(section.section_name)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
          <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(section.content, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Editing: {section.section_name}</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveContent(section.section_name)}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cancelEditing}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        <Tabs defaultValue="form" className="w-full">
          <TabsList>
            <TabsTrigger value="form">Form Editor</TabsTrigger>
            <TabsTrigger value="json">JSON Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4">
            {renderFormFields(section.section_name)}
          </TabsContent>

          <TabsContent value="json">
            <Textarea
              value={JSON.stringify(editContent, null, 2)}
              onChange={(e) => {
                try {
                  setEditContent(JSON.parse(e.target.value));
                } catch (error) {
                  // Invalid JSON, keep current value
                }
              }}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Enter JSON content..."
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderFormFields = (sectionName: string) => {
    const content = editContent;

    switch (sectionName) {
      case 'hero':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hero-title">Title</Label>
              <Input
                id="hero-title"
                value={content.title || ''}
                onChange={(e) => setEditContent({ ...content, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="hero-tagline">Tagline</Label>
              <Input
                id="hero-tagline"
                value={content.tagline || ''}
                onChange={(e) => setEditContent({ ...content, tagline: e.target.value })}
              />
            </div>
            {content.stats && (
              <>
                <div>
                  <Label htmlFor="prize-money">Prize Money</Label>
                  <Input
                    id="prize-money"
                    value={content.stats.prizeMoney || ''}
                    onChange={(e) => setEditContent({
                      ...content,
                      stats: { ...content.stats, prizeMoney: e.target.value },
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="player-prize">Player Prize</Label>
                  <Input
                    id="player-prize"
                    value={content.stats.playerPrize || ''}
                    onChange={(e) => setEditContent({
                      ...content,
                      stats: { ...content.stats, playerPrize: e.target.value },
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="finals-at">Finals At</Label>
                  <Input
                    id="finals-at"
                    value={content.stats.finalsAt || ''}
                    onChange={(e) => setEditContent({
                      ...content,
                      stats: { ...content.stats, finalsAt: e.target.value },
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="franchisees">Franchisees</Label>
                  <Input
                    id="franchisees"
                    value={content.stats.franchisees || ''}
                    onChange={(e) => setEditContent({
                      ...content,
                      stats: { ...content.stats, franchisees: e.target.value },
                    })}
                  />
                </div>
              </>
            )}
          </div>
        );

      case 'teams':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="teams-title">Title</Label>
              <Input
                id="teams-title"
                value={content.title || ''}
                onChange={(e) => setEditContent({ ...content, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="teams-subtitle">Subtitle</Label>
              <Input
                id="teams-subtitle"
                value={content.subtitle || ''}
                onChange={(e) => setEditContent({ ...content, subtitle: e.target.value })}
              />
            </div>
            <div>
              <Label>Regions</Label>
              <Textarea
                value={content.regions?.join('\n') || ''}
                onChange={(e) => setEditContent({
                  ...content,
                  regions: e.target.value.split('\n').filter(r => r.trim()),
                })}
                placeholder="Enter regions (one per line)"
                className="min-h-[100px]"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="default-title">Title</Label>
              <Input
                id="default-title"
                value={content.title || ''}
                onChange={(e) => setEditContent({ ...content, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="default-description">Description</Label>
              <Textarea
                id="default-description"
                value={content.description || ''}
                onChange={(e) => setEditContent({ ...content, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Management</h2>
        <Button onClick={addNewSection}>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardContent className="p-6">
              {renderContentEditor(section)}
            </CardContent>
          </Card>
        ))}

        {sections.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No content sections found.</p>
              <Button onClick={addNewSection} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create First Section
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContentManagement;