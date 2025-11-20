# Appmusica Server Proxy

This small Express proxy unifies MusicBrainz and iTunes search results and provides caching.

Quick start (from project root):

```powershell
cd server
npm install
npm start
```

Then in another terminal start the React app (from project root):

```powershell
npm start
```

Example request (after server running):

```
GET http://localhost:5000/api/search?q=shape%20of%20you&sources=musicbrainz,itunes&limit=10
```

Notes:
- The server caches search results for 30 minutes.
- MusicBrainz requires a meaningful `User-Agent` header; adjust it in `index.js` for your app.
- This proxy keeps your API usage centralized and avoids exposing keys (iTunes does not need a key for search).
