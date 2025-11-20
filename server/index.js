const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 5000;

// Simple in-memory cache with TTL
const cache = new Map();
function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}
function setCache(key, value, ttlSeconds = 1800) {
  const expires = Date.now() + ttlSeconds * 1000;
  cache.set(key, { value, expires });
}

app.use(express.json());
// Allow simple CORS for dev (CRA proxy avoids this when proxy is set)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Helper: search MusicBrainz recordings
async function searchMusicBrainz(query, limit = 10) {
  const url = 'https://musicbrainz.org/ws/2/recording';
  const params = { query, fmt: 'json', limit };
  const headers = { 'User-Agent': 'Appmusica/1.0 (https://example.com; dev@local)' };
  const res = await axios.get(url, { params, headers, timeout: 10000 });
  const items = (res.data && res.data.recordings) || [];
  return items.map(r => {
    const artist = Array.isArray(r['artist-credit']) && r['artist-credit'][0] && (r['artist-credit'][0].name || r['artist-credit'][0].artist && r['artist-credit'][0].artist.name);
    const album = Array.isArray(r.releases) && r.releases[0] && r.releases[0].title;
    const releaseId = Array.isArray(r.releases) && r.releases[0] && r.releases[0]['id'];
    // Cover Art Archive URL pattern if release id available
    const artwork = releaseId ? `https://coverartarchive.org/release/${releaseId}/front-250` : null;
    return {
      id: r.id,
      title: r.title,
      artist: artist || null,
      album: album || null,
      artwork,
      source: 'musicbrainz',
      raw: r
    };
  });
}

// Helper: search iTunes (Apple) for track previews and artwork
async function searchITunes(query, limit = 10) {
  const url = 'https://itunes.apple.com/search';
  const params = { term: query, entity: 'song', limit };
  const res = await axios.get(url, { params, timeout: 10000 });
  const items = (res.data && res.data.results) || [];
  return items.map(t => ({
    id: String(t.trackId || t.collectionId || t.artistId),
    title: t.trackName || t.collectionName || null,
    artist: t.artistName || null,
    album: t.collectionName || null,
    artwork: t.artworkUrl100 ? t.artworkUrl100.replace('100x100', '600x600') : null,
    previewUrl: t.previewUrl || null,
    source: 'itunes',
    raw: t
  }));
}

app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'q (query) parameter required' });
    const sources = (req.query.sources || 'musicbrainz,itunes').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const limit = Math.min(50, parseInt(req.query.limit || '10', 10) || 10);

    const cacheKey = `search:${q}:${sources.join('|')}:${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ results: cached, cached: true });

    const tasks = [];
    if (sources.includes('musicbrainz') || sources.includes('mb')) tasks.push(searchMusicBrainz(q, limit));
    if (sources.includes('itunes') || sources.includes('apple')) tasks.push(searchITunes(q, limit));

    const settled = await Promise.allSettled(tasks);
    const results = [];
    for (const s of settled) {
      if (s.status === 'fulfilled' && Array.isArray(s.value)) results.push(...s.value);
    }

    // Basic dedupe by source:id and normalize id
    const seen = new Set();
    const normalized = results.map(r => ({
      id: `${r.source}:${r.id}`,
      title: r.title,
      artist: r.artist,
      album: r.album,
      artwork: r.artwork,
      previewUrl: r.previewUrl || null,
      source: r.source,
      raw: r.raw
    })).filter(item => {
      if (!item.id) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    setCache(cacheKey, normalized, 30 * 60); // cache 30 minutes
    res.json({ results: normalized, cached: false });
  } catch (err) {
    console.error('Search error', err && err.response && err.response.data ? err.response.data : err.message || err);
    res.status(500).json({ error: 'search_failed', details: (err && err.message) || 'unknown' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.listen(port, () => {
  console.log(`Appmusica proxy server listening on http://localhost:${port}`);
});
