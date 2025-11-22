/**
 * RecommendationService.js
 * 
 * Fetches user's YouTube liked videos and generates music recommendations
 * based on their listening history. This service bridges YouTube API with
 * music recommendation engines (Deezer, Last.fm, etc.)
 */

import axios from 'axios';
import { searchDeezer } from './hybridMusicService';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Extracts artist names from YouTube video titles
 * Assumes titles follow patterns like "Artist - Song" or "Song by Artist"
 */
function extractArtistName(title) {
  if (!title) return null;
  
  // Pattern 1: "Artist - Song"
  const dashPattern = /^([^-]+)\s*-\s*(.+)$/;
  const dashMatch = title.match(dashPattern);
  if (dashMatch && dashMatch[1].length > 0) {
    return dashMatch[1].trim();
  }
  
  // Pattern 2: "Song by Artist" / "Song ft. Artist"
  const byPattern = /(?:by|featuring|feat\.|ft\.|with)\s+([^(]+)/i;
  const byMatch = title.match(byPattern);
  if (byMatch && byMatch[1].length > 0) {
    return byMatch[1].trim();
  }
  
  // Pattern 3: "Song (Artist)" / "Song [Artist]"
  const parenPattern = /\(?([^)]+)\)?(?:\s*\[([^\]]+)\])?$/;
  const parenMatch = title.match(parenPattern);
  if (parenMatch && (parenMatch[1] || parenMatch[2])) {
    return (parenMatch[1] || parenMatch[2]).trim();
  }
  
  // Fallback: return first part before special chars
  const firstPart = title.split(/[-—–]/)[0].trim();
  return firstPart.length > 2 ? firstPart : null;
}

/**
 * Fetches user's YouTube liked videos
 * Requires: YouTube Data API v3 access with youtube.readonly scope
 * 
 * @param {Object} auth - Firebase auth object with user
 * @param {number} maxResults - Number of videos to fetch (default: 20)
 * @returns {Promise<Array>} Array of liked video objects
 */
export const fetchYouTubeLikedVideos = async (auth, maxResults = 20) => {
  try {
    if (!auth.currentUser) {
      console.warn('No authenticated user for YouTube API');
      return [];
    }

    // Get the user's ID token which includes YouTube access
    const idToken = await auth.currentUser.getIdToken();
    
    // Fetch the "Liked Videos" playlist (special playlist ID: 'LL')
    const response = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
      params: {
        playlistId: 'LL', // Special ID for "Liked Videos"
        part: 'snippet,contentDetails',
        maxResults: Math.min(maxResults, 50),
        fields: 'items(snippet(title,resourceId/videoId,publishedAt,thumbnails),contentDetails/videoPublishedAt)',
        access_token: idToken,
      },
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching YouTube liked videos:', error);
    
    // Handle quota exceeded
    if (error?.response?.status === 403) {
      console.error('YouTube API quota exceeded or access denied');
    }
    
    return [];
  }
};

/**
 * Extracts unique artist names from YouTube liked videos
 * 
 * @param {Array} videos - Array of YouTube video objects
 * @returns {Array<string>} Deduplicated list of artist names
 */
export const extractArtistsFromVideos = (videos) => {
  const artists = new Set();
  
  videos.forEach(video => {
    const title = video.snippet?.title;
    const artist = extractArtistName(title);
    
    if (artist && artist.length > 2) {
      // Filter out common non-artist words
      const commonWords = ['music', 'audio', 'official', 'video', 'lyrics', 'live'];
      const isCommon = commonWords.some(word => 
        artist.toLowerCase().includes(word)
      );
      
      if (!isCommon) {
        artists.add(artist);
      }
    }
  });
  
  return Array.from(artists);
};

/**
 * Fetches recommendations based on user's YouTube liked artists
 * Uses Deezer API to find similar artists and their top tracks
 * 
 * @param {Array<string>} artists - List of artist names
 * @param {string} category - Type of recommendations: 'highlighted', 'new', 'recent'
 * @param {number} limit - Number of recommendations to return
 * @returns {Promise<Array>} Array of recommended tracks
 */
export const getRecommendationsFromArtists = async (artists, category = 'highlighted', limit = 15) => {
  try {
    if (!artists || artists.length === 0) {
      console.warn('No artists provided for recommendations');
      return [];
    }

    const recommendations = [];
    const seenIds = new Set();

    // For each artist, fetch their top tracks or similar artists
    for (const artist of artists.slice(0, 5)) { // Limit to 5 artists to avoid excessive API calls
      try {
        let tracks = [];

        if (category === 'recent') {
          // Get recent tracks by this artist
          tracks = await searchDeezer(artist, 'track', limit);
        } else if (category === 'new') {
          // Search for albums and extract latest ones
          const albums = await searchDeezer(artist, 'album', 10);
          // In a real implementation, we'd fetch tracks from these albums
          tracks = albums.slice(0, Math.ceil(limit / 5));
        } else {
          // 'highlighted' - top tracks from artist
          tracks = await searchDeezer(artist, 'track', Math.ceil(limit / 5));
        }

        // Deduplicate and add to recommendations
        tracks.forEach(track => {
          if (!seenIds.has(track.id)) {
            seenIds.add(track.id);
            recommendations.push({
              ...track,
              sourceArtist: artist, // Track which artist this came from
              category
            });
          }
        });
      } catch (error) {
        console.error(`Error fetching tracks for artist ${artist}:`, error);
      }
    }

    // Shuffle and limit results
    return recommendations
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recommendations from artists:', error);
    return [];
  }
};

/**
 * Main function: Fetch YouTube liked videos and generate recommendations
 * 
 * @param {Object} auth - Firebase auth object
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Object with recommendations by category
 */
export const generatePersonalizedRecommendations = async (
  auth,
  options = {
    maxYouTubeVideos: 30,
    recommendationsPerCategory: 15
  }
) => {
  try {
    // Step 1: Fetch user's YouTube liked videos
    console.debug && console.debug('Fetching YouTube liked videos...');
    const likedVideos = await fetchYouTubeLikedVideos(auth, options.maxYouTubeVideos);

    if (likedVideos.length === 0) {
      console.warn('No liked videos found on YouTube');
      return {
        highlighted: [],
        new: [],
        recent: [],
        sourceArtists: []
      };
    }

    // Step 2: Extract artist names
    console.debug && console.debug('Extracting artist names from videos...');
    const artists = extractArtistsFromVideos(likedVideos);
    console.debug && console.debug(`Found ${artists.length} unique artists:`, artists);

    if (artists.length === 0) {
      console.warn('Could not extract any artists from YouTube videos');
      return {
        highlighted: [],
        new: [],
        recent: [],
        sourceArtists: []
      };
    }

    // Step 3: Generate recommendations for each category
    console.debug && console.debug('Generating recommendations...');
    const [highlighted, newReleases, recent] = await Promise.all([
      getRecommendationsFromArtists(artists, 'highlighted', options.recommendationsPerCategory),
      getRecommendationsFromArtists(artists, 'new', options.recommendationsPerCategory),
      getRecommendationsFromArtists(artists, 'recent', options.recommendationsPerCategory)
    ]);

    return {
      highlighted,
      new: newReleases,
      recent,
      sourceArtists: artists,
      videoCount: likedVideos.length
    };
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return {
      highlighted: [],
      new: [],
      recent: [],
      sourceArtists: [],
      error: error.message
    };
  }
};

/**
 * Filters tracks by genre profile to avoid irrelevant recommendations
 * 
 * @param {Array} tracks - Array of track objects to filter
 * @param {Array<string>} preferredGenres - List of preferred genres
 * @returns {Array} Filtered tracks
 */
export const filterTracksByGenre = (tracks, preferredGenres = []) => {
  if (!preferredGenres || preferredGenres.length === 0) {
    return tracks;
  }

  return tracks.filter(track => {
    const genres = (track.genre || []).map(g => g.toLowerCase());
    return genres.some(g => preferredGenres.some(p => g.includes(p.toLowerCase())));
  });
};
