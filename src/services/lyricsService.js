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
            console.debug && console.debug("Direct lyrics fetch failed, trying search...");
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

/**
 * Get synced lyrics with automatic parsing
 * @param {string} trackName 
 * @param {string} artistName 
 * @param {number} duration Duration in seconds
 * @returns {Promise<Array<{time: number, text: string}>>}
 */
export async function getSyncedLyrics(trackName, artistName, duration) {
    try {
        const data = await fetchLyrics(trackName, artistName, '', duration);
        
        if (!data) {
            return { lyrics: [], isInstrumental: false, error: 'No lyrics found' };
        }

        // Check if instrumental
        if (data.instrumental === true) {
            return { lyrics: [], isInstrumental: true, error: null };
        }

        // Parse synced lyrics if available
        if (data.syncedLyrics) {
            const parsed = parseLRC(data.syncedLyrics);
            return { lyrics: parsed, isInstrumental: false, error: null };
        }

        // Fallback to plain lyrics (convert to single timed entry)
        if (data.plainLyrics) {
            const plainLines = data.plainLyrics.split('\n').filter(line => line.trim());
            const parsed = plainLines.map((text, index) => ({
                time: index * 3, // Rough spacing of 3 seconds per line
                text: text.trim()
            }));
            return { lyrics: parsed, isInstrumental: false, error: null };
        }

        return { lyrics: [], isInstrumental: false, error: 'No lyrics available' };
    } catch (error) {
        console.error('getSyncedLyrics error:', error);
        return { lyrics: [], isInstrumental: false, error: error.message };
    }
}

/**
 * Parse LRC format to structured lyrics
 * @param {string} lrcString 
 * @returns {Array<{time: number, text: string}>}
 */
function parseLRC(lrcString) {
    if (!lrcString) return [];

    const lines = lrcString.split('\n');
    const lyrics = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

    for (const line of lines) {
        let match;
        const matches = [];
        
        // Find all timestamps in the line
        while ((match = timeRegex.exec(line)) !== null) {
            matches.push(match);
        }

        if (matches.length > 0) {
            // Get the text after all timestamps
            const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
            
            if (text) {
                // Add entry for each timestamp (some lines have multiple timestamps)
                matches.forEach(match => {
                    const minutes = parseInt(match[1], 10);
                    const seconds = parseInt(match[2], 10);
                    const milliseconds = parseInt(match[3], 10);
                    
                    // Convert to total seconds
                    const time = minutes * 60 + seconds + (milliseconds / (match[3].length === 2 ? 100 : 1000));
                    
                    lyrics.push({ time, text });
                });
            }
        }
    }

    // Sort by time
    return lyrics.sort((a, b) => a.time - b.time);
}
