// src/youtubeService.js
import axios from 'axios';

// ¡IMPORTANTE! En un proyecto real, esto debería estar en variables de entorno (.env)
// Pero para aprender, pégalo aquí. NO SUBAS ESTO A GITHUB PÚBLICO si es una clave de pago.
const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Simple caching to reduce quota usage during development: stored in localStorage with TTL
const CACHE_TTL_SECONDS = 60 * 30; // 30 minutes
const cacheKey = (prefix, q, maxResults) => `${prefix}::${q}::${maxResults}`;
const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > (parsed.ttl || CACHE_TTL_SECONDS) * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch (err) { return null; }
};
const writeCache = (key, value, ttl = CACHE_TTL_SECONDS) => {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), ttl, value }));
  } catch (err) {}
};

// cooldown when quota exceeded to avoid hammering the API
const QUOTA_COOLDOWN_MS = 1000 * 60 * 60; // 1 hour
const quotaCooldownKey = '__yt_quota_cooldown__';
const isInQuotaCooldown = () => {
  try {
    const v = localStorage.getItem(quotaCooldownKey);
    if (!v) return false;
    return Date.now() < Number(v);
  } catch (err) { return false; }
};
const setQuotaCooldown = (msFromNow = QUOTA_COOLDOWN_MS) => {
  try { localStorage.setItem(quotaCooldownKey, String(Date.now() + msFromNow)); } catch (err) {}
};

export const searchMusic = async (query) => {
  try {
    if (!API_KEY) {
      console.warn('YouTube API key missing. Aborting searchMusic call.');
      return [];
    }
    if (!query || (typeof query === 'string' && !query.trim())) return [];

    if (isInQuotaCooldown()) {
      console.warn('YouTube quota cooldown active, returning empty result for searchMusic');
      return [];
    }
    const key = cacheKey('searchMusic', query, 25);
    const cached = readCache(key);
    if (cached) return cached;
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 25,
        q: query,
        // por defecto buscamos videos musicales
        type: 'video',
        videoCategoryId: '10', // 10 es la categoría de "Música" en YouTube
        key: API_KEY,
      },
    });
    const items = response.data.items || [];
    const filtered = items.filter((item) => item.id && item.id.videoId);
    writeCache(key, filtered);
    return filtered;
  } catch (error) {
    if (error?.response?.data) {
      console.error('YouTube API error response:', JSON.stringify(error.response.data, null, 2));
      try {
        const reason = error.response.data?.error?.errors?.[0]?.reason;
        if (reason === 'quotaExceeded') {
          setQuotaCooldown();
        }
      } catch (err) {}
    }
    console.error("Error buscando música", error);
    return [];
  }
};

// Búsqueda mixta: devuelve videos, canales y playlists para clasificación en cliente
export const searchMixed = async (query, maxResults = 50) => {
  try {
    if (!API_KEY) {
      console.warn('YouTube API key missing. Aborting searchMixed call.');
      return [];
    }
    if (!query || (typeof query === 'string' && !query.trim())) return [];

    if (isInQuotaCooldown()) {
      console.warn('YouTube quota cooldown active, returning empty result for searchMixed');
      return [];
    }
    const key = cacheKey('searchMixed', query, maxResults);
    const cached = readCache(key);
    if (cached) return cached;
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: Math.min(maxResults, 25),
        q: query,
        // No forzamos 'type' para recibir canales, playlists y videos
        key: API_KEY,
      },
    });
    const items = response.data.items || [];
    writeCache(key, items);
    return items;
  } catch (error) {
    if (error?.response?.data) {
      console.error('YouTube mixed search API error response:', JSON.stringify(error.response.data, null, 2));
      try {
        const reason = error.response.data?.error?.errors?.[0]?.reason;
        if (reason === 'quotaExceeded') {
          setQuotaCooldown();
        }
      } catch (err) {}
    }
    console.error('Error buscando mixto en YouTube', error);
    return [];
  }
};