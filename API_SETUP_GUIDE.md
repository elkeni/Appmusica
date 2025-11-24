# 🎵 CloudTune - API Setup & Configuration Guide

## 📋 Table of Contents
1. [Quick Start (5 minutes)](#quick-start)
2. [YouTube API Setup](#youtube-api-setup)
3. [API Key Configuration](#api-key-configuration)
4. [Quota Management](#quota-management)
5. [Fallback System](#fallback-system)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Minimum Requirements
**None!** The app works without any API keys using the fallback system (Invidious/Piped).

### Recommended Setup (5 minutes)
For best performance, get a **FREE** YouTube API key:

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Get YouTube API Key** (see detailed steps below)

3. **Add to `.env` file:**
   ```env
   REACT_APP_YOUTUBE_API_KEY=AIzaSy_YOUR_KEY_HERE
   ```

4. **Start the app:**
   ```bash
   npm install
   npm start
   ```

That's it! ✅

---

## 🔑 YouTube API Setup

### Why You Need This
- **With API Key:** Instant search, ~500 unique songs/day
- **Without API Key:** Unlimited songs but 2-3 second delay per new song

### Step-by-Step Guide

#### 1. Go to Google Cloud Console
🔗 [https://console.cloud.google.com/](https://console.cloud.google.com/)

#### 2. Create a New Project
```
Navigation: Select Project → New Project
Name: cloudtune-prod (or any name)
Click: Create
```

#### 3. Enable YouTube Data API v3
```
Navigation: APIs & Services → Library
Search: "YouTube Data API v3"
Click: Enable
```

#### 4. Create API Credentials
```
Navigation: APIs & Services → Credentials
Click: Create Credentials → API Key
Copy: The generated key (starts with AIzaSy...)
```

#### 5. (Optional) Secure Your API Key
```
Click: Edit API Key
Application restrictions: HTTP referrers
Add: http://localhost:3000/* (for development)
Add: https://yourdomain.com/* (for production)
API restrictions: Restrict key → YouTube Data API v3
Save
```

#### 6. Add to `.env` File
```env
REACT_APP_YOUTUBE_API_KEY=AIzaSyC_YOUR_ACTUAL_KEY_HERE_1234567890
```

#### 7. Restart Development Server
```bash
# Stop the server (Ctrl+C)
npm start
```

---

## ⚙️ API Key Configuration

### All Available APIs

| API | Required | Cost | Purpose | Setup Difficulty |
|-----|----------|------|---------|------------------|
| **YouTube Data API v3** | Recommended | FREE (10k quota/day) | Audio streaming | Easy (5 min) |
| **Deezer API** | No | FREE (unlimited) | Rich metadata | None (auto) |
| **iTunes API** | No | FREE (unlimited) | High-res artwork | None (auto) |

### Configuration File (`.env`)

```env
# REQUIRED for best performance
REACT_APP_YOUTUBE_API_KEY=your_key_here

# Already configured (no action needed)
REACT_APP_DEEZER_BASE_URL=https://api.deezer.com
REACT_APP_ITUNES_BASE_URL=https://itunes.apple.com
```

### Verification

After adding your API key:

1. **Check Console Logs:**
   ```javascript
   ✅ [YouTube] API key configured
   🔎 [YouTube] API call for: "song title" (100 quota cost)
   ```

2. **Check UI Indicator:**
   - Bottom-right should show "📊 YouTube API" (not "🔄 Fallback Mode")

3. **Test Quota Tracking:**
   - Play 5 different songs
   - Quota monitor should show: "Used: 500 / 10000"

---

## 📊 Quota Management

### Understanding YouTube Quota

**Daily Limit:** 10,000 points (resets at midnight PST)

**Costs:**
- Search: 100 points
- Video details: 1 point
- Cached result: **0 points** ✨

### Optimization Strategies

#### 1. **Cache Hits (Implemented)**
```javascript
First play: 100 quota → Save to cache
Second play: 0 quota → Use cache
Result: 95%+ quota savings
```

#### 2. **Minimal API Parameters (Implemented)**
```javascript
// Bad (500 quota)
part: 'snippet,contentDetails,statistics'

// Good (100 quota)
part: 'id,snippet'
```

#### 3. **Single Result Fetching (Implemented)**
```javascript
maxResults: 1  // Only fetch what you need
```

### Daily Usage Calculator

| Usage Pattern | Quota Used | Songs Playable |
|---------------|------------|----------------|
| 100 unique songs + replays | ~10,000 | ∞ unlimited |
| 50 unique songs + replays | ~5,000 | ∞ unlimited |
| Only replaying cached songs | 0 | ∞ unlimited |

### Monitoring Quota

**Real-Time Monitor:**
- Location: Bottom-right corner of app
- Colors:
  - 🔵 Blue: Normal (>1000 quota left)
  - 🟡 Yellow: Low (<1000 quota left)
  - 🔴 Red: Critical (<500 quota left)
  - 🟣 Purple: Fallback mode (quota exceeded)

**Check in Console:**
```javascript
// In browser DevTools console
localStorage.getItem('youtube_quota_usage')
// Output: {"date":"Sun Nov 24 2024","used":2500}
```

**Manual Reset:**
```javascript
// Only use if you want to clear tracking
localStorage.removeItem('youtube_quota_usage');
```

---

## 🔄 Fallback System

### How It Works

When YouTube API fails (quota exceeded or no API key):

```
User plays song
    ↓
Check localStorage cache
    ↓ MISS
Check quota status
    ↓ EXCEEDED or NO KEY
Try Invidious API #1 (free, no key)
    ↓ SUCCESS
Save to cache
    ↓
Play song (0 quota cost)
```

### Fallback Sources

1. **Invidious** (Primary fallback)
   - 5 rotating public instances
   - No API key required
   - Speed: ~2-3 seconds per search

2. **Piped** (Secondary fallback)
   - 3 rotating public instances
   - No API key required
   - Speed: ~2-3 seconds per search

### When Fallback Activates

- ✅ No YouTube API key in `.env`
- ✅ YouTube returns 403 Forbidden (quota exceeded)
- ✅ Manual activation via localStorage flag

### Testing Fallback Mode

**Activate manually:**
```javascript
// In browser console
localStorage.setItem('youtube_quota_exceeded', Date.now().toString());
// Reload page and play a song
```

**Deactivate:**
```javascript
localStorage.removeItem('youtube_quota_exceeded');
// Reload page
```

### Fallback Performance

| Metric | With API | Fallback Mode |
|--------|----------|---------------|
| First play | Instant | 2-3 sec delay |
| Cached play | Instant | Instant |
| Daily limit | 500 songs | ∞ unlimited |
| Reliability | 99.9% | 95% (depends on instance) |

---

## 🔧 Troubleshooting

### Issue: 403 Forbidden Error

**Symptoms:**
```
❌ [YouTube] QUOTA EXCEEDED - API blocked
🚨 ERROR 403: Quota exceeded or forbidden
```

**Solutions:**

1. **Generate New API Key:**
   ```
   Google Cloud Console → Credentials → Create Credentials → API Key
   Replace old key in .env with new key
   Restart: npm start
   ```

2. **Use Fallback Mode (Temporary):**
   ```env
   # Remove or comment out YouTube key
   # REACT_APP_YOUTUBE_API_KEY=
   ```
   App will automatically use Invidious/Piped.

3. **Wait for Reset:**
   Quota resets at midnight Pacific Time (PST/PDT).

---

### Issue: No Sound / Silent Playback

**Symptoms:**
- Video URL loads but no audio
- Player shows playing but silent

**Solutions:**

1. **Check Volume:**
   - Player volume slider not at 0
   - Browser tab not muted (check tab icon)

2. **Try Different Song:**
   Some videos may be region-locked or age-restricted.

3. **Check Console Errors:**
   ```
   Open: DevTools (F12) → Console
   Look for: ReactPlayer errors or YouTube player errors
   ```

4. **Clear Cache:**
   ```javascript
   // In browser console
   localStorage.clear();
   // Reload page
   ```

---

### Issue: Songs Not Loading

**Symptoms:**
- Infinite loading spinner
- Error messages in console

**Solutions:**

1. **Check Internet Connection:**
   ```bash
   # Test API access
   curl https://api.deezer.com/chart
   curl https://www.googleapis.com/youtube/v3/search?key=YOUR_KEY&q=test&part=id
   ```

2. **Check Firewall:**
   Ensure these domains are not blocked:
   - `youtube.com`
   - `googleapis.com`
   - `api.deezer.com`
   - `itunes.apple.com`
   - `inv.riverside.rocks` (Invidious)
   - `pipedapi.kavin.rocks` (Piped)

3. **Clear All Storage:**
   ```
   DevTools → Application → Clear Storage → Clear site data
   ```

---

### Issue: Fallback Mode Not Working

**Symptoms:**
- Purple indicator shows but songs don't load
- Console shows all fallback instances failing

**Solutions:**

1. **Check Network:**
   Invidious/Piped instances might be down or blocked.
   Try accessing manually:
   ```
   https://yewtu.be/
   https://pipedapi.kavin.rocks/
   ```

2. **Force YouTube API (if available):**
   ```javascript
   localStorage.removeItem('youtube_quota_exceeded');
   // Ensure API key is in .env
   // Restart app
   ```

3. **Update Fallback Instances:**
   Edit `src/api/utils/youtubeFallback.js` to add working instances.

---

### Issue: High Quota Consumption

**Symptoms:**
- Quota reaches 10,000 after <100 songs
- Daily limit hit quickly

**Diagnosis:**

1. **Check Cache:**
   ```javascript
   // Count cached entries
   Object.keys(localStorage).filter(k => k.startsWith('yt_video_cache')).length
   ```

2. **Check Logs:**
   Look for repeated API calls for same song:
   ```
   🔎 [YouTube] API call for: "Same Song Title"
   🔎 [YouTube] API call for: "Same Song Title"  // Should NOT repeat
   ```

**Solutions:**

1. **Verify Cache Working:**
   Second play should show:
   ```
   💾 [YouTube] Cache hit for: song-title (0 quota used)
   ```

2. **Clear Corrupted Cache:**
   ```javascript
   Object.keys(localStorage)
     .filter(k => k.startsWith('yt_video_cache_v1'))
     .forEach(k => localStorage.removeItem(k));
   // Only v2 cache should remain
   ```

---

## 📈 Performance Tips

### 1. Pre-Cache Favorites
Play all your favorite songs once to cache them. Subsequent plays cost 0 quota.

### 2. Use Playlists
Create playlists with cached songs for instant playback.

### 3. Monitor Quota
Keep an eye on the quota monitor. If low, switch to replaying cached songs.

### 4. Strategic Fallback
If running low on quota, manually enable fallback mode:
```javascript
localStorage.setItem('youtube_quota_exceeded', Date.now().toString());
```

### 5. Multiple API Keys (Advanced)
Rotate between multiple Google Cloud projects for 10k quota each.

---

## 🎯 Best Practices

### Development
```env
# Use separate API key for development
REACT_APP_YOUTUBE_API_KEY=dev_key_here
```

### Production
```env
# Use production API key with domain restrictions
REACT_APP_YOUTUBE_API_KEY=prod_key_here
```

### API Key Security
- ✅ Add HTTP referrer restrictions
- ✅ Restrict to YouTube Data API v3 only
- ✅ Rotate keys periodically
- ✅ Never commit `.env` file to git
- ✅ Use different keys for dev/prod

---

## 📞 Support

**Issues:**
- GitHub: [Report Issue](https://github.com/yourusername/cloudtune/issues)

**Documentation:**
- API Setup: This file
- Phase 1: Persistent cache implementation
- Phase 2: Fallback system architecture
- Phase 3: Configuration & monitoring

**Community:**
- Discord: [Join Server](#)
- Reddit: r/cloudtune

---

**Last Updated:** November 24, 2025  
**Version:** 2.0 (Post Phase 1-3 optimization)
