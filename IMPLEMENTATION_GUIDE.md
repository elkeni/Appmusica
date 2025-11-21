# CloudTune - Apple Music UI Clone with YouTube Personalization

## Project Overview

This project is a complete redesign of the "Home" (Inicio) view to match Apple Music's aesthetic while implementing YouTube-based personalized music recommendations.

---

## PHASE 1: UI/UX Redesign ✅

### What's New

#### 1. **Apple Music-Style Header & Profile**
- **Pure Black Background**: Clean, minimalist design at the top of the page
- **Large Typography**: "Inicio" title in `text-4xl` or `text-5xl` bold font
- **User Avatar**: Google profile picture displayed in top-right corner (circular, with purple hover state)

#### 2. **Horizontal Scrolling Carousel Sections**
Three distinct sections with smooth scrolling behavior:

- **Sugerencias destacadas para ti** (Highlighted for You)
  - Aspect ratio: Square (1:1)
  - Rounded corners with `rounded-lg`
  - Title and artist below image
  - Play button overlay on hover

- **Novedad** (New Releases)
  - Aspect ratio: Portrait (3:4)
  - Larger cards with `rounded-xl`
  - Gradient overlay on bottom on hover
  - Release date in gray below title

- **Escuchado recientemente** (Recently Played)
  - Aspect ratio: Square smaller cards
  - Compact styling with `rounded-md`
  - Fast navigation between items

#### 3. **Carousel Navigation**
- Uses `overflow-x-auto` with `scroll-snap-type: x mandatory`
- Native "snap" feel for smooth scrolling
- Left/right chevron buttons to navigate sections
- `hide-scrollbar` class to hide horizontal scrollbars

#### 4. **Metadata Formatting**
- All dates formatted in Spanish: "21 de noviembre de 2025"
- Relative timestamps: "hace 2 días", "hace 1 hora"
- Using the new `formatDateSpanish()`, `formatDateShortSpanish()`, and `formatRelativeTimeSpanish()` utilities

---

## PHASE 2: Authentication & YouTube Integration ✅

### Google Sign-In Only

The authentication system now enforces **Google Sign-In exclusively**:

**Updated Auth.js:**
```javascript
const provider = new GoogleAuthProvider();
// Request YouTube scope for recommendations
provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
provider.setCustomParameters({ 'prompt': 'consent' });
```

**What Changed:**
- ❌ Removed email/password login and registration forms
- ✅ Google Login button now primary action
- ✅ User prompted for YouTube access during login
- ✅ Footer explains YouTube scope requirement

### User Data Storage

When a user logs in, their profile information is stored:
```javascript
localStorage.setItem('appmusica_user', JSON.stringify({
  uid: currentUser.uid,
  email: currentUser.email,
  displayName: currentUser.displayName,
  photoURL: currentUser.photoURL
}));
```

This data is accessible to all components and enables HomeView to display the user's avatar.

---

## PHASE 3: YouTube-Based Recommendations ✅

### How It Works

#### Step 1: Fetch YouTube Liked Videos
```javascript
const likedVideos = await fetchYouTubeLikedVideos(auth, 30);
```
- Fetches user's "Liked Videos" playlist (special ID: `'LL'`)
- Returns up to 30 most recent liked videos
- Requires: `youtube.readonly` scope

#### Step 2: Extract Artist Names
```javascript
const artists = extractArtistsFromVideos(likedVideos);
```
Intelligently parses video titles to extract artist names:
- **Pattern 1**: "Artist - Song" → Returns "Artist"
- **Pattern 2**: "Song by Artist" / "Song ft. Artist" → Returns "Artist"
- **Pattern 3**: "Song (Artist)" / "Song [Artist]" → Returns "Artist"

Example:
- "The Weeknd - Blinding Lights" → "The Weeknd"
- "Song featuring Taylor Swift" → "Taylor Swift"
- "Imagine Dragons - Natural" → "Imagine Dragons"

#### Step 3: Generate Recommendations
```javascript
const recommendations = await generatePersonalizedRecommendations(auth, {
  maxYouTubeVideos: 30,
  recommendationsPerCategory: 15
});
```

Returns an object:
```javascript
{
  highlighted: [...],    // Top tracks from liked artists
  new: [...],           // New releases from liked artists
  recent: [...],        // Recent tracks from liked artists
  sourceArtists: [],    // List of extracted artists
  videoCount: 30        // Number of YouTube videos analyzed
}
```

### Service Architecture

**File**: `src/services/recommendationService.js`

#### Key Functions:

1. **`fetchYouTubeLikedVideos(auth, maxResults = 20)`**
   - Fetches user's "Liked Videos" playlist from YouTube API
   - Returns array of video objects with snippet data
   - Handles quota exceeded errors gracefully

2. **`extractArtistsFromVideos(videos)`**
   - Parses video titles to find artist names
   - Filters out common non-artist words
   - Returns deduplicated array of artist names

3. **`getRecommendationsFromArtists(artists, category, limit)`**
   - Categories: `'highlighted'`, `'new'`, `'recent'`
   - Searches Deezer for each artist's tracks/albums
   - Deduplicates results
   - Returns limited array of recommendations

4. **`generatePersonalizedRecommendations(auth, options)`**
   - Main entry point that orchestrates the flow
   - Combines all the above functions
   - Error-safe with fallback empty arrays
   - Returns structured recommendations object

5. **`filterTracksByGenre(tracks, preferredGenres)`**
   - Filters recommendations by genre profile
   - Helps avoid irrelevant suggestions
   - Optional: can be extended for more intelligent filtering

### Integration in HomeView

The `src/pages/HomeView.js` component:
- Loads recommendations on mount
- Falls back to Deezer charts if YouTube recommendations unavailable
- Displays three carousel sections with recommendations
- Shows user avatar in header (retrieved from localStorage)
- Empty state with prompt to sync YouTube data if no recommendations found

---

## Bottom Navigation Update ✅

**File**: `src/components/BottomNav.js`

### Icons & Labels
| Icon | Label | Route |
|------|-------|-------|
| 🏠 Home | Inicio | `/` |
| 📊 Grid | Novedades | `/library` |
| 📡 Radio | Radio | `/radio` |
| 🎵 Music | Biblioteca | `/favorites` |
| 🔍 Search | Buscar | `/search` |
| 🚪 LogOut | Salir | logout |

### Active State Styling
- **Active**: Red color (`text-red-500`)
- **Inactive**: Gray color (`text-slate-400`)
- **Hover**: Scale up animation (`hover:scale-110`)

---

## File Structure

```
src/
├── components/
│   ├── Auth.js                 (Updated: Google Sign-In only)
│   ├── BottomNav.js            (Updated: Apple Music icons)
│   └── ...
├── pages/
│   ├── HomeView.js             (New: Apple Music-style home)
│   └── ...
├── services/
│   ├── recommendationService.js (New: YouTube → Recommendations)
│   ├── hybridMusicService.js
│   ├── youtubeService.js
│   └── lyricsService.js
├── utils/
│   └── formatUtils.js          (Updated: Spanish date formatting)
├── context/
│   └── PlayerContext.js
└── App.js                      (Updated: Use HomeView as home route)
```

---

## Environment Variables

Ensure you have these in your `.env` file:

```
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
```

### Getting YouTube API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials (Web application)
5. Add `https://yourdomain.com` to authorized origins
6. Copy the Client ID to `.env` as `REACT_APP_GOOGLE_CLIENT_ID`

---

## How to Use

### For End Users:

1. **Login**: Click the Google Sign-In button
   - You'll be prompted to allow YouTube access
   - Accept to enable personalized recommendations

2. **View Home**: You'll see "Inicio" with three recommendation sections
   - **Destacadas**: Your top artist recommendations
   - **Novedad**: New releases from your liked artists
   - **Escuchado recientemente**: Recent tracks to explore

3. **Browse**: Use the carousel arrows to navigate within sections
   - Click any track to play it
   - Hover to see play button

4. **Navigate**: Use bottom nav (mobile) or sidebar (desktop)
   - Red color indicates active page

### For Developers:

#### To Generate Recommendations Programmatically:

```javascript
import { generatePersonalizedRecommendations } from './services/recommendationService';
import { auth } from './firebase';

// In a component or service
const recommendations = await generatePersonalizedRecommendations(auth, {
  maxYouTubeVideos: 30,
  recommendationsPerCategory: 15
});

console.log(recommendations.highlighted);  // Top tracks
console.log(recommendations.sourceArtists); // Extracted artists
```

#### To Format Dates:

```javascript
import { 
  formatDateSpanish, 
  formatDateShortSpanish,
  formatRelativeTimeSpanish 
} from './utils/formatUtils';

const date = new Date();
console.log(formatDateSpanish(date));        // "21 de noviembre de 2025"
console.log(formatDateShortSpanish(date));   // "21 nov 2025"
console.log(formatRelativeTimeSpanish(date - 3600000)); // "hace 1 hora"
```

---

## Styling & Classes

### Tailwind Classes Used:

- **Colors**: `text-red-500`, `bg-black`, `text-slate-400`
- **Effects**: `backdrop-blur-md`, `shadow-lg`, `rounded-lg`
- **Animations**: `animate-spin`, `hover:scale-110`, `transition-all`
- **Responsive**: `hidden md:block`, `w-full md:w-48`

### Custom Classes:

- `hide-scrollbar`: Hides horizontal scrollbars (in CSS)
- `custom-scrollbar`: Styled vertical scrollbars
- `glass-fluid-*`: Glassmorphism effects

---

## Known Limitations & Future Enhancements

### Current Limitations:
1. Recommendations fallback to Deezer charts if YouTube API fails
2. Artist extraction depends on consistent YouTube title formatting
3. No persistent caching of YouTube data between sessions

### Future Enhancements:
1. **Genre-based filtering**: Avoid recommendations outside user's taste
2. **Collaborative filtering**: Mix YouTube data with listening history
3. **Smart caching**: Cache recommendations for 24 hours
4. **Trending artists**: Add "Trending from your artists" section
5. **Playlist sync**: Sync YouTube playlists to app library
6. **Discovery mode**: AI-powered recommendations beyond liked artists

---

## Troubleshooting

### "No authenticated user for YouTube API"
- User not logged in or session expired
- Solution: Re-login via Google Sign-In

### Recommendations showing generic Deezer charts
- YouTube API quota exceeded or access denied
- Check YouTube API key and scopes in Firebase
- Verify `youtube.readonly` scope is requested during login

### Avatar not showing in header
- User's Google profile doesn't have a photo
- localStorage might be cleared
- Solution: Check browser's localStorage under key `appmusica_user`

### Dates showing in English instead of Spanish
- Check that `formatDateSpanish()` is imported correctly
- Verify function is being called with proper date format

---

## Testing Checklist

- [ ] Google Sign-In works without email/password option
- [ ] YouTube scope is requested during login
- [ ] HomeView loads with "Inicio" header
- [ ] User avatar displays in top-right
- [ ] Three carousel sections appear
- [ ] Carousel scrolling works smoothly
- [ ] Play buttons appear on hover
- [ ] Dates display in Spanish format
- [ ] Bottom nav shows correct icons
- [ ] Active nav item is red, inactive are gray
- [ ] Clicking nav items navigates correctly
- [ ] Empty state shows when no recommendations

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  Google Sign-In (OAuth)                  │
│              with youtube.readonly scope                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │    recommendationService.js   │
         │  - Fetch YouTube Likes        │
         │  - Extract Artists            │
         │  - Query Deezer               │
         └────────────┬────────────┘
                      │
         ┌────────────┴──────────────┐
         ▼                           ▼
┌──────────────────┐      ┌──────────────────┐
│  HomeView.js     │      │  hybridMusicService  │
│ - Display home   │      │  (Deezer API)    │
│ - 3 carousels    │      └──────────────────┘
│ - Show avatar    │
└──────────────────┘
         ▼
┌──────────────────────────┐
│   PlayerContext          │
│   (Handle playback)      │
└──────────────────────────┘
```

---

## Questions?

Refer to the inline comments in:
- `src/services/recommendationService.js` for recommendation logic
- `src/pages/HomeView.js` for UI structure
- `src/components/Auth.js` for OAuth flow
- `src/utils/formatUtils.js` for date formatting

