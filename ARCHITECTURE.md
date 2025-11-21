# Architecture & Data Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLOUDTUNE APPLICATION                     │
└─────────────────────────────────────────────────────────────────┘

                           ┌──────────────────┐
                           │   Auth Layer     │
                           │  (Auth.js)       │
                           └────────┬─────────┘
                                    │
                        ┌───────────▼──────────────┐
                        │  Google OAuth 2.0        │
                        │  + YouTube Scope         │
                        └───────────┬──────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼────────┐  ┌───▼────┐  ┌──────▼──────┐
            │  Firebase Auth │  │YouTube │  │  Firestore  │
            │                │  │  API   │  │  (User DB)  │
            └───────┬────────┘  └───┬────┘  └──────┬──────┘
                    │                │              │
                    └────────────────┼──────────────┘
                                     │
                    ┌────────────────▼──────────────┐
                    │  User Data in localStorage    │
                    │  {uid, email, displayName,    │
                    │   photoURL}                   │
                    └────────────────┬──────────────┘
                                     │
                    ┌────────────────▼──────────────┐
                    │   HomeView Component          │
                    │  - Displays header            │
                    │  - Shows 3 carousels          │
                    │  - User avatar in top-right   │
                    └────────────────┬──────────────┘
                                     │
                    ┌────────────────┼──────────────┐
                    │                │              │
        ┌───────────▼──────┐  ┌──────▼────────┐  ┌─▼──────────┐
        │ Recommendation   │  │ Deezer API    │  │PlayerCont. │
        │ Service          │  │ (Music data)  │  │(Playback)  │
        └───────────┬──────┘  └───────────────┘  └────────────┘
                    │
         ┌──────────▼────────────┐
         │  1. Fetch YouTube     │
         │     "Liked Videos"    │
         │  2. Extract Artists   │
         │  3. Query Deezer      │
         │  4. Deduplicate       │
         │  5. Return Results    │
         └───────────────────────┘

            ┌──────────────────────────────────┐
            │   Bottom Navigation              │
            │  (Inicio | Novedades | Radio |   │
            │   Biblioteca | Buscar | Salir)   │
            └──────────────────────────────────┘
```

---

## Authentication Flow

```
USER STARTS APP
      │
      ▼
  ┌─────────────────────┐
  │  Auth.js Component  │
  │  (Login Screen)     │
  └─────────┬───────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ User clicks:                    │
   │ "Inicia sesión con Google"      │
   └────────────┬────────────────────┘
                │
        ┌───────▼──────────────┐
        │ GoogleAuthProvider   │
        │ + YouTube scope      │
        │ + Consent prompt     │
        └───────┬──────────────┘
                │
                ▼
        ┌─────────────────────┐
        │ Google Login Dialog │
        └────────┬────────────┘
                 │
         ┌───────▼──────────────┐
         │ User grants YouTube  │
         │ access permission    │
         └────────┬─────────────┘
                  │
         ┌────────▼────────────┐
         │ Firebase Auth       │
         │ authenticates user  │
         └────────┬────────────┘
                  │
    ┌─────────────▼──────────────┐
    │ Store user in localStorage │
    │ Save to Firestore          │
    └─────────────┬──────────────┘
                  │
         ┌────────▼────────────┐
         │ onAuthSuccess()     │
         │ triggered           │
         └────────┬────────────┘
                  │
                  ▼
         ┌─────────────────────┐
         │ HomeView loads      │
         │ (Inicio screen)     │
         └─────────────────────┘
```

---

## Recommendation Generation Flow

```
HOME VIEW LOADS
      │
      ▼
┌──────────────────────────────────────┐
│ generatePersonalizedRecommendations  │
│ (auth, {max: 30, per_cat: 15})       │
└────────┬─────────────────────────────┘
         │
    ┌────▼─────────────────────────────┐
    │ Step 1: Fetch YouTube Likes      │
    │ fetchYouTubeLikedVideos(auth, 30)│
    │                                  │
    │ YouTube API Request:             │
    │ GET /youtube/v3/playlistItems    │
    │ playlistId='LL' (Liked Videos)   │
    │ Returns: 30 video objects        │
    └────┬──────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │ Step 2: Extract Artists           │
    │ extractArtistsFromVideos(videos)  │
    │                                   │
    │ Parse titles:                     │
    │ "Artist - Song" → Artist          │
    │ "Song by Artist" → Artist         │
    │ "Song (Artist)" → Artist          │
    │                                   │
    │ Returns: ["Artist1", "Artist2"..] │
    └────┬───────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │ Step 3: Query Music API (Deezer)  │
    │ getRecommendationsFromArtists     │
    │ (artists, category, 15)           │
    │                                   │
    │ For each artist:                  │
    │ - Search Deezer                   │
    │ - Get 3-5 top tracks              │
    │ - Deduplicate                     │
    │                                   │
    │ 3 parallel requests:              │
    │ - highlighted: top tracks         │
    │ - new: albums/releases            │
    │ - recent: recent tracks           │
    └────┬───────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │ Results Object:                   │
    │ {                                 │
    │   highlighted: [...15 tracks],    │
    │   new: [...15 tracks],            │
    │   recent: [...15 tracks],         │
    │   sourceArtists: [...extracted],  │
    │   videoCount: 30                  │
    │ }                                 │
    └────┬───────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │ Render 3 Carousels                │
    │ Section 1: Destacadas             │
    │ Section 2: Novedad                │
    │ Section 3: Escuchado              │
    └───────────────────────────────────┘
```

---

## Component Hierarchy

```
App
├── Auth (when not logged in)
└── PlayerProvider
    ├── Sidebar (desktop)
    │   ├── Logo
    │   ├── Navigation Links
    │   ├── User Profile
    │   └── Logout
    ├── Main Content
    │   ├── Header
    │   │   ├── Back/Forward buttons
    │   │   └── Search bar
    │   └── Routes
    │       ├── HomeView ⭐ NEW
    │       │   ├── Header
    │       │   │   ├── Title: "Inicio"
    │       │   │   └── User Avatar
    │       │   ├── Carousel 1: Destacadas
    │       │   ├── Carousel 2: Novedad
    │       │   ├── Carousel 3: Escuchado
    │       │   └── Empty State (fallback)
    │       ├── SearchResults
    │       ├── ArtistDetail
    │       ├── AlbumDetail
    │       ├── PlaylistDetail
    │       ├── UserLibrary
    │       └── Favorites
    ├── RightPanel (desktop)
    │   └── Now Playing Queue
    ├── PlayerBar (desktop)
    │   ├── Track info
    │   ├── Progress
    │   └── Controls
    ├── Modals
    │   ├── NowPlayingModal
    │   ├── AddToPlaylistModal
    │   └── MobileFullScreenPlayer
    └── BottomNav (mobile) ⭐ UPDATED
        ├── Inicio 🏠
        ├── Novedades 📊
        ├── Radio 📡
        ├── Biblioteca 🎵
        ├── Buscar 🔍
        └── Salir 🚪
```

---

## Data Flow: User Interaction

```
USER CLICKS TRACK ON HOMEVIEW
        │
        ▼
┌──────────────────────────┐
│ playItem(track, list)    │
│ triggered                │
└────────┬─────────────────┘
         │
    ┌────▼───────────────────────┐
    │ PlayerContext receives:    │
    │ - Current track            │
    │ - Queue (carousel tracks)  │
    └────────┬────────────────────┘
             │
      ┌──────▼─────────────────────┐
      │ Update Player State:       │
      │ - currentTrack = track     │
      │ - queue = list             │
      │ - isPlaying = true         │
      └──────┬──────────────────────┘
             │
      ┌──────▼──────────────────────┐
      │ Audio Element plays track   │
      │ (HTML5 Audio API)           │
      └──────┬───────────────────────┘
             │
    ┌────────▼──────────────┐
    │ PlayerBar updates     │
    │ Shows current playing │
    │ track info            │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────┐
    │ User can:             │
    │ - Pause/Resume        │
    │ - Skip to next        │
    │ - Seek progress       │
    │ - Add to favorites    │
    │ - Add to playlist     │
    └───────────────────────┘
```

---

## Carousel Interaction

```
USER VIEWS CAROUSEL
    │
    ├─ Mouse wheel / Touch swipe
    │       │
    │       ▼
    │  ┌──────────────────────┐
    │  │ scroll-snap behavior │
    │  │ (native CSS)         │
    │  └──────┬───────────────┘
    │         │
    │         ▼
    │  Auto-snaps to next item
    │
    └─ Click Chevron Button
            │
            ▼
       ┌─────────────────────┐
       │ scroll(id, 'right') │
       │ Smooth animation    │
       └────┬────────────────┘
            │
            ▼
       Carousel scrolls 300px
```

---

## Storage Architecture

```
BROWSER STORAGE
│
├─ localStorage
│   └─ appmusica_user: {
│       uid: "user123",
│       email: "user@example.com",
│       displayName: "User Name",
│       photoURL: "https://..."
│     }
│
├─ sessionStorage
│   └─ (Currently unused, can add for caching)
│
└─ IndexedDB / Cache API
    └─ (Can use for offline recommendations)


FIRESTORE (Cloud Database)
│
└─ users/{uid}/
    ├─ email: "user@example.com"
    ├─ displayName: "User Name"
    ├─ photoURL: "https://..."
    ├─ createdAt: "2025-11-21T..."
    ├─ favorites: [
    │   {id, title, artist, image, ...},
    │   ...
    │ ]
    └─ playlists: [
        {
          id: "playlist1",
          name: "My Playlist",
          songs: [...],
          createdAt: "2025-11-21T..."
        },
        ...
      ]


EXTERNAL APIS
│
├─ Google OAuth
│   └─ Provides: idToken, user profile, YouTube access
│
├─ YouTube API v3
│   └─ /playlistItems (Liked Videos)
│       - Requires: youtube.readonly scope
│       - Returns: video titles, thumbnails, dates
│
├─ Deezer API
│   └─ /search
│       - Returns: tracks, albums, artists
│       - No auth needed (API key in frontend)
│
└─ Firebase Auth
    └─ Manages user sessions
```

---

## Error Handling Flow

```
RECOMMENDATION SERVICE LOADS
    │
    ├─ YouTube API call fails
    │       │
    │       ▼
    │  Log error
    │  Return empty array
    │       │
    │       ▼
    │  HomeView catches empty results
    │       │
    │       ▼
    │  Fallback: getDeezerCharts()
    │       │
    │       ▼
    │  Show generic charts instead
    │
    └─ User data missing
            │
            ▼
        Log warning
        Show empty state message
        Prompt to login/sync YouTube
```

---

## Performance Considerations

```
BOTTLENECK AREAS              OPTIMIZATION STRATEGY
──────────────────────────────────────────────────────
1. YouTube API calls    →  Cache for 24 hours
2. Deezer searches      →  Parallel requests (Promise.all)
3. Large arrays         →  Pagination / Lazy loading
4. Image loading        →  Lazy load on scroll
5. Carousel re-renders  →  useRef for scroll containers
6. Network requests     →  Retry logic + timeout
```

---

## Version Timeline

```
v1.0.0
├─ Original login (email + password)
├─ Basic BrowseView
├─ Simple playlists
└─ Generic recommendations

v2.0.0 ⭐ CURRENT
├─ Google Sign-In only
├─ YouTube integration
├─ Apple Music UI (HomeView)
├─ Personalized recommendations
├─ Updated navigation
└─ Spanish localization

v2.1.0 (Planned)
├─ Persistent caching
├─ Genre filtering
├─ Trending section
└─ Offline support

v3.0.0 (Future)
├─ Mini player
├─ Playlist sync from YouTube
├─ AI recommendations
└─ Social features
```

---

*Last Updated: November 21, 2025*
