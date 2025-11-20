import axios from 'axios';

const LRCLIB_API_URL = 'https://lrclib.net/api';

/**
 * Fetches lyrics for a given track.
 * @param {string} trackName 
 * @param {string} artistName 
 * @param {string} albumName 
 * @param {number} duration Duration in seconds
 * @returns {Promise<{syncedLyrics: string, plainLyrics: string, instrumental: boolean}>}
 */
export async function fetchLyrics(trackName, artistName, albumName, duration) {
    try {
        if ((!trackName || !String(trackName).trim()) && (!artistName || !String(artistName).trim())) {
            return null;
        }
        // clean up names for better search results (remove "feat.", brackets, etc if needed)
        // For now, use raw values as LRCLIB is quite good.

        const params = {
            track_name: trackName,
            artist_name: artistName,
            album_name: albumName,
            duration: duration
        };

        // First try specific 'get' if we have precise data
        try {
            const response = await axios.get(`${LRCLIB_API_URL}/get`, { params });
            if (response.data) return response.data;
        } catch (e) {
            // If 404 or error, fall back to search
            console.log("Direct lyrics fetch failed, trying search...");
        }

        // Fallback to search
        const q = `${trackName || ''} ${artistName || ''}`.trim();
        if (!q) return null;
        const searchResponse = await axios.get(`${LRCLIB_API_URL}/search`, {
            params: { q }
        });

        if (searchResponse.data && searchResponse.data.length > 0) {
            // Find best match based on duration
            const bestMatch = searchResponse.data.find(item => Math.abs(item.duration - duration) < 5); // 5 sec tolerance
            return bestMatch || searchResponse.data[0];
        }

        return null;
    } catch (error) {
        console.error("Error fetching lyrics:", error);
        return null;
    }
}
