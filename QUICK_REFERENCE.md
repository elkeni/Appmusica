# 🚀 CloudTune - Quick Reference Card

## 📋 Essential Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## 🔑 Get YouTube API Key (5 minutes)

1. **Google Cloud Console:** https://console.cloud.google.com/
2. **Create Project:** cloudtune-prod
3. **Enable API:** YouTube Data API v3
4. **Create Credentials:** API Key
5. **Copy to `.env`:**
   ```env
   REACT_APP_YOUTUBE_API_KEY=AIzaSy...
   ```
6. **Restart:** `npm start`

## 📊 Quota at a Glance

| Action | Quota Cost | Notes |
|--------|------------|-------|
| Search new song | 100 | First time only |
| Play cached song | 0 | Instant, unlimited |
| Browse search | 100 | Per search query |
| **Daily Limit** | **10,000** | ~100 unique songs |

## 🎨 UI Indicators

| Icon | Color | Meaning |
|------|-------|---------|
| 📊 | Blue | Normal operation |
| 📊 | Yellow | Low quota (<1000) |
| 📊 | Red | Critical (<500) |
| 🔄 | Purple | Fallback mode (free, unlimited) |

## 🔄 Fallback System

**When it activates:**
- No API key in `.env`
- Quota exceeded (403 error)
- Manual activation

**What it does:**
- Uses Invidious/Piped (free public APIs)
- 2-3 second delay per new song
- Unlimited daily usage
- Auto-caches results

**Toggle manually:**
```javascript
// Activate fallback
localStorage.setItem('youtube_quota_exceeded', Date.now());

// Deactivate fallback
localStorage.removeItem('youtube_quota_exceeded');
```

## 🐛 Quick Fixes

### 403 Error (Quota Exceeded)
```bash
# Generate NEW API key → Update .env → Restart
```

### No Sound
```
Check volume slider → Check browser tab not muted → Try different song
```

### Cache Issues
```javascript
// Clear all cache
localStorage.clear();
// Reload page
```

### Check Quota Usage
```javascript
// In browser console
localStorage.getItem('youtube_quota_usage')
```

## 💾 Cache Management

**View cached songs:**
```javascript
// In DevTools console
Object.keys(localStorage)
  .filter(k => k.startsWith('yt_video_cache_v2'))
  .length
// Returns: number of cached songs
```

**Clear cache:**
```javascript
// Clear ALL cache
localStorage.clear();

// Clear only video cache
Object.keys(localStorage)
  .filter(k => k.startsWith('yt_video_cache'))
  .forEach(k => localStorage.removeItem(k));
```

## 📈 Optimization Tips

### Maximize Free Tier
1. Play each favorite song once (100 quota each)
2. Create playlists with cached songs
3. Replay cached songs infinitely (0 quota)
4. Monitor quota indicator
5. Switch to fallback mode when low

### Pre-Cache Strategy
```
Morning: Play 50 favorite songs → 5000 quota used
Day: Replay same 50 songs → 0 quota used
Result: 5000 quota saved for exploration
```

## 🔍 Monitoring

**Console Logs:**
```javascript
💾 Cache hit → Good! (0 quota)
🔎 API call → Normal (100 quota)
🔄 Fallback → Quota exhausted (0 quota)
✅ Found → Success
❌ Error → Check logs
```

**localStorage Keys:**
```javascript
yt_video_cache_v2_*     // Cached video IDs
youtube_quota_usage     // Daily quota tracking
youtube_quota_exceeded  // Fallback mode flag
```

## 📞 Support Checklist

Before asking for help:

- [ ] Checked console logs (F12)
- [ ] Verified `.env` file has API key
- [ ] Restarted dev server after .env change
- [ ] Tried clearing localStorage
- [ ] Checked internet connection
- [ ] Looked at quota monitor indicator
- [ ] Read error message carefully
- [ ] Checked [API_SETUP_GUIDE.md](API_SETUP_GUIDE.md)

## 🎯 Performance Targets

**With API Key:**
- First load: <2 seconds
- Cached song: <0.5 seconds
- Search: <1 second
- Quota efficiency: 95%+ cache hit rate

**Fallback Mode:**
- First load: <5 seconds
- Cached song: <0.5 seconds
- Search: 2-3 seconds
- Daily limit: Unlimited

## 📚 Documentation

- **Setup Guide:** [API_SETUP_GUIDE.md](API_SETUP_GUIDE.md)
- **Environment:** [.env.example](.env.example)
- **README:** [README.md](README.md)
- **This Card:** QUICK_REFERENCE.md

---

**Version:** 2.0 (Post Phase 1-3)  
**Last Updated:** November 24, 2025
