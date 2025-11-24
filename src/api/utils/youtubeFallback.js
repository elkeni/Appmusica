/**
 * PHASE 2: Smart Fallback System for YouTube
 * Alternative methods to get video IDs when API quota is exceeded
 */

/**
 * Method 1: Use Invidious public instances for search
 * Invidious is a privacy-focused YouTube frontend with free API
 */
const INVIDIOUS_INSTANCES = [
    'https://inv.riverside.rocks',
    'https://invidious.snopyta.org',
    'https://yewtu.be',
    'https://invidious.zapashcanon.fr',
    'https://vid.puffyan.us',
];

let currentInstanceIndex = 0;

const getNextInvidiousInstance = () => {
    const instance = INVIDIOUS_INSTANCES[currentInstanceIndex];
    currentInstanceIndex = (currentInstanceIndex + 1) % INVIDIOUS_INSTANCES.length;
    return instance;
};

/**
 * Search for video using Invidious API (no API key required)
 */
export const searchViaInvidious = async (query, maxResults = 1) => {
    const instance = getNextInvidiousInstance();
    
    try {
        console.log(`🔄 [Fallback] Trying Invidious: ${instance}`);
        
        const response = await fetch(
            `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
            { 
                timeout: 8000,
                signal: AbortSignal.timeout(8000)
            }
        );

        if (!response.ok) {
            throw new Error(`Invidious returned ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
            const videos = data
                .filter(item => item.type === 'video')
                .slice(0, maxResults)
                .map(video => ({
                    videoId: video.videoId,
                    title: video.title,
                    author: video.author,
                    duration: video.lengthSeconds,
                    thumbnail: `https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`,
                }));

            if (videos.length > 0) {
                console.log(`✅ [Fallback] Invidious found: ${videos[0].videoId}`);
                return videos[0];
            }
        }

        throw new Error('No videos found');
    } catch (error) {
        console.warn(`⚠️ [Fallback] Invidious failed (${instance}):`, error.message);
        return null;
    }
};

/**
 * Method 2: Use Piped API (another YouTube frontend)
 */
const PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.projectsegfau.lt',
    'https://pipedapi.adminforge.de',
];

let currentPipedIndex = 0;

const getNextPipedInstance = () => {
    const instance = PIPED_INSTANCES[currentPipedIndex];
    currentPipedIndex = (currentPipedIndex + 1) % PIPED_INSTANCES.length;
    return instance;
};

export const searchViaPiped = async (query, maxResults = 1) => {
    const instance = getNextPipedInstance();
    
    try {
        console.log(`🔄 [Fallback] Trying Piped: ${instance}`);
        
        const response = await fetch(
            `${instance}/search?q=${encodeURIComponent(query)}&filter=music_songs`,
            { 
                timeout: 8000,
                signal: AbortSignal.timeout(8000)
            }
        );

        if (!response.ok) {
            throw new Error(`Piped returned ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.items && data.items.length > 0) {
            const video = data.items[0];
            const videoId = video.url?.replace('/watch?v=', '') || video.id;

            if (videoId) {
                console.log(`✅ [Fallback] Piped found: ${videoId}`);
                return {
                    videoId,
                    title: video.title,
                    author: video.uploaderName,
                    duration: video.duration,
                    thumbnail: video.thumbnail,
                };
            }
        }

        throw new Error('No videos found');
    } catch (error) {
        console.warn(`⚠️ [Fallback] Piped failed (${instance}):`, error.message);
        return null;
    }
};

/**
 * Method 3: Direct YouTube search page scraping (last resort)
 * This extracts the first video ID from YouTube's search results HTML
 */
export const searchViaYouTubeDirectly = async (query) => {
    try {
        console.log(`🔄 [Fallback] Trying direct YouTube search...`);
        
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        
        // This would require a CORS proxy or backend service
        // For now, we'll skip this method as it requires server-side implementation
        console.warn('⚠️ [Fallback] Direct YouTube scraping requires CORS proxy (skipped)');
        return null;
    } catch (error) {
        console.warn(`⚠️ [Fallback] Direct search failed:`, error.message);
        return null;
    }
};

/**
 * Smart Fallback Chain
 * Tries multiple methods in order until one succeeds
 */
export const findVideoIdWithFallback = async (query) => {
    console.log(`🔍 [Fallback] Starting fallback search for: "${query}"`);
    
    // Try Invidious first (most reliable)
    let result = await searchViaInvidious(query);
    if (result?.videoId) {
        return result;
    }

    // Try Piped as second option
    result = await searchViaPiped(query);
    if (result?.videoId) {
        return result;
    }

    // Try another Invidious instance
    result = await searchViaInvidious(query);
    if (result?.videoId) {
        return result;
    }

    console.error('❌ [Fallback] All fallback methods failed');
    return null;
};

/**
 * Check if quota is exceeded
 */
export const isQuotaExceeded = () => {
    try {
        const exceeded = localStorage.getItem('youtube_quota_exceeded');
        if (exceeded) {
            const timestamp = parseInt(exceeded);
            const hoursSince = (Date.now() - timestamp) / (1000 * 60 * 60);
            
            // Reset after 24 hours (YouTube quota resets at midnight PST)
            if (hoursSince > 24) {
                localStorage.removeItem('youtube_quota_exceeded');
                return false;
            }
            
            return true;
        }
    } catch (error) {}
    return false;
};

/**
 * Check if we should use fallback (quota exceeded or API key missing)
 */
export const shouldUseFallback = (apiKey) => {
    if (!apiKey) {
        console.log('🔄 [Fallback] No API key configured, using fallback');
        return true;
    }
    
    if (isQuotaExceeded()) {
        console.log('🔄 [Fallback] Quota exceeded, using fallback');
        return true;
    }
    
    return false;
};

export default {
    searchViaInvidious,
    searchViaPiped,
    findVideoIdWithFallback,
    shouldUseFallback,
    isQuotaExceeded,
};
