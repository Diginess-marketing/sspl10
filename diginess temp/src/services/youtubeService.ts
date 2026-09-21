
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID || 'UCKgYUJNLCJrpxdMEWFBUvJA';
const MAX_RESULTS = 50;
const CACHE_KEY = 'sspl_youtube_cache_v2';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export interface YouTubeVideo {
    id: string;
    title: string;
    description?: string;
    thumbnail: string;
    publishedAt: string;
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
    isShort?: boolean;
}

export interface PlaylistCategory {
    id: string;
    title: string;
    videos: YouTubeVideo[];
}

interface CacheData {
    timestamp: number;
    videos?: YouTubeVideo[];
    categories?: PlaylistCategory[];
}

const getCachedData = (ignoreExpiry = false): CacheData | null => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const data: CacheData = JSON.parse(cached);
        if (!ignoreExpiry && (Date.now() - data.timestamp > CACHE_TTL)) {
            return null;
        }
        return data;
    } catch (e) {
        return null;
    }
};

const setCachedData = (data: Partial<CacheData>) => {
    try {
        const existing = getCachedData(true) || { timestamp: Date.now() };
        const newData: CacheData = {
            ...existing,
            ...data,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
    } catch (e) {
        console.error('Failed to cache YouTube data:', e);
    }
};

const fetchVideoStats = async (videoIds: string[]): Promise<Record<string, any>> => {
    if (!YOUTUBE_API_KEY || videoIds.length === 0) return {};

    const chunks = [];
    for (let i = 0; i < videoIds.length; i += 50) {
        chunks.push(videoIds.slice(i, i + 50));
    }

    const stats: Record<string, any> = {};

    try {
        await Promise.all(chunks.map(async (chunk) => {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${chunk.join(',')}&key=${YOUTUBE_API_KEY}`
            );
            if (response.ok) {
                const data = await response.json();
                data.items?.forEach((item: any) => {
                    stats[item.id] = item.statistics;
                });
            }
        }));
        return stats;
    } catch (e) {
        return stats;
    }
};

export const fetchAllYouTubeContent = async (): Promise<YouTubeVideo[]> => {
    const cached = getCachedData();
    if (cached?.videos) return cached.videos;

    if (!YOUTUBE_API_KEY || !CHANNEL_ID || CHANNEL_ID.includes('PLACEHOLDER')) {
        return [];
    }

    try {
        const searchRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=${MAX_RESULTS}&order=date&type=video&key=${YOUTUBE_API_KEY}`
        );

        if (!searchRes.ok) {
            const staleData = getCachedData(true);
            return staleData?.videos || [];
        }

        const searchData = await searchRes.json();
        const items = searchData.items || [];

        const combinedItems = items.map((item: any) => {
            const title = item.snippet.title.toLowerCase();
            const description = item.snippet.description.toLowerCase();
            const isShort = title.includes('#shorts') || description.includes('#shorts');
            return { ...item, isShort };
        });

        if (combinedItems.length === 0) return [];

        const videoIds = combinedItems.map((item: any) => item.id.videoId);
        const statsMap = await fetchVideoStats(videoIds);

        const result: YouTubeVideo[] = combinedItems.map((item: any) => {
            const stats = statsMap[item.id.videoId] || {};
            return {
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high.url,
                publishedAt: item.snippet.publishedAt,
                viewCount: stats.viewCount,
                likeCount: stats.likeCount,
                commentCount: stats.commentCount,
                isShort: item.isShort
            };
        });

        result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        setCachedData({ videos: result });
        return result;
    } catch (error) {
        console.error('Failed to fetch YouTube content:', error);
        return [];
    }
};

export const fetchCategorizedContent = async (): Promise<PlaylistCategory[]> => {
    const cached = getCachedData();
    if (cached?.categories) return cached.categories;

    if (!YOUTUBE_API_KEY || !CHANNEL_ID || CHANNEL_ID.includes('PLACEHOLDER')) {
        return [];
    }

    try {
        // 1. Fetch Playlists
        const playlistsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${CHANNEL_ID}&maxResults=20&key=${YOUTUBE_API_KEY}`
        );
        if (!playlistsRes.ok) throw new Error('Failed to fetch playlists');
        const playlistsData = await playlistsRes.json();
        const playlists = playlistsData.items || [];

        // 2. Fetch Items for each Playlist
        const categories: PlaylistCategory[] = await Promise.all(playlists.map(async (playlist: any) => {
            const itemsRes = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlist.id}&maxResults=10&key=${YOUTUBE_API_KEY}`
            );
            if (!itemsRes.ok) return { id: playlist.id, title: playlist.snippet.title, videos: [] };

            const itemsData = await itemsRes.json();
            const items = itemsData.items || [];

            const videoIds = items.map((item: any) => item.snippet.resourceId.videoId);
            const statsMap = await fetchVideoStats(videoIds);

            const videos: YouTubeVideo[] = items.map((item: any) => {
                const vidId = item.snippet.resourceId.videoId;
                const stats = statsMap[vidId] || {};
                return {
                    id: vidId,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                    publishedAt: item.snippet.publishedAt,
                    viewCount: stats.viewCount,
                    likeCount: stats.likeCount,
                    commentCount: stats.commentCount,
                    isShort: item.snippet.title.toLowerCase().includes('#shorts') || item.snippet.description?.toLowerCase().includes('#shorts')
                };
            });

            return {
                id: playlist.id,
                title: playlist.snippet.title,
                videos
            };
        }));

        // 3. Fetch Standalone Shorts (recent videos not in any playlist)
        const recentVideos = await fetchAllYouTubeContent();
        const playlistVideoIds = new Set(categories.flatMap(c => c.videos.map(v => v.id)));

        const standaloneShorts = recentVideos.filter(v => v.isShort && !playlistVideoIds.has(v.id));

        if (standaloneShorts.length > 0) {
            categories.push({
                id: 'standalone-shorts',
                title: 'Latest Shorts',
                videos: standaloneShorts
            });
        }

        const filteredCategories = categories.filter(c => c.videos.length > 0);
        setCachedData({ categories: filteredCategories });
        return filteredCategories;
    } catch (error) {
        console.error('Failed to fetch categorized YouTube content:', error);
        const staleData = getCachedData(true);
        return staleData?.categories || [];
    }
};

export const fetchYouTubeShorts = async (): Promise<YouTubeVideo[]> => {
    const all = await fetchAllYouTubeContent();
    return all.filter(v => v.isShort);
};
