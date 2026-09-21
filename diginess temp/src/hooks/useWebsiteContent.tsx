import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type WebsiteContent = Database['public']['Tables']['website_content']['Row'];
type ThemeSetting = Database['public']['Tables']['theme_settings']['Row'];

export const useWebsiteContent = () => {
  const [content, setContent] = useState<Record<string, any>>({});
  const [theme, setTheme] = useState<ThemeSetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
    
    // Subscribe to real-time updates
    const contentSubscription = supabase
      .channel('website_content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'website_content',
        },
        () => {
          fetchContent();
        },
      )
      .subscribe();

    const themeSubscription = supabase
      .channel('theme_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'theme_settings',
        },
        () => {
          fetchTheme();
        },
      )
      .subscribe();

    return () => {
      contentSubscription.unsubscribe();
      themeSubscription.unsubscribe();
    };
  }, []);

  const fetchContent = async () => {
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000),
      );

      const fetchPromise = supabase
        .from('website_content')
        .select('*');

      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ]) as { data: WebsiteContent[] | null; error: any };

      if (error) {
        // Set empty content map as fallback
        setContent({});
        return;
      }

      const contentMap: Record<string, any> = {};
      data?.forEach(item => {
        contentMap[item.section_name] = item.content;
      });
      setContent(contentMap);
    } catch (error) {
      // Use empty content map as graceful fallback
      setContent({});
    } finally {
      setLoading(false);
    }
  };

  const fetchTheme = async () => {
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000),
      );

      const fetchPromise = supabase
        .from('theme_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ]) as { data: ThemeSetting | null; error: any };

      if (error && error.code !== 'PGRST116') {
        setTheme(null);
        return;
      }
      
      setTheme(data);
    } catch (error) {
      setTheme(null);
    } finally {
      setLoading(false);
    }
  };

  const getContent = (section: string, fallback: any = {}) => {
    return content[section] || fallback;
  };

  return {
    content,
    theme,
    loading,
    getContent,
  };
};

export default useWebsiteContent;