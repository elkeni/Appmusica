# 🚀 Quick Test Guide - Lyrics & Player UI

## ⚡ Testing in 5 Minutes

### **1. Lyrics Feature** (30 seconds)
```
1. Play any song
2. On mobile: Tap full-screen → Tap quote icon (♫)
3. On desktop: Click quote icon in player bar
4. Watch lyrics auto-scroll with the music!
```

**What to look for:**
- ✅ Active line is **bright white, larger, bold**
- ✅ Inactive lines are **dimmed, smaller, blurred**
- ✅ Auto-scroll keeps active line **centered**
- ✅ If instrumental: Shows music icon + message

---

### **2. Player Bar Layout** (30 seconds)
```
1. Look at bottom player bar on desktop
2. Check the layout:
   - LEFT: Album art + song info
   - CENTER: Controls + Timeline (full-width!)
   - RIGHT: Volume + extras
```

**What to look for:**
- ✅ Timeline is **centered and wide**
- ✅ Hover over timeline → **thumb appears**
- ✅ Shuffle/Repeat buttons **change color** when active
- ✅ Radio badge shows when in radio mode

---

### **3. Full-Screen Mode** (1 minute)

#### **Mobile:**
```
1. Tap mini player at bottom
2. Try the tabs:
   - [Album art icon] → Artwork view
   - [Quote icon] → Lyrics view
   - [List icon] → Queue view
3. Swipe down to close
```

#### **Desktop:**
```
1. Click album art in player bar
2. See split-screen:
   - LEFT: Big album art + controls
   - RIGHT: Lyrics panel
3. Click [List icon] → See queue instead of lyrics
4. Click [X] to close
```

**What to look for:**
- ✅ Background **changes colors** based on album art
- ✅ Smooth **transitions** between views
- ✅ Lyrics **scroll automatically**
- ✅ Queue shows **real upcoming songs**

---

## 🎨 Visual Features to Notice

### **Dynamic Background**
```
The background creates a mesh gradient using colors from the album art:
- Primary color → Top radial gradient
- Secondary color → Side radial gradients
- Heavy blur for depth effect
- Smooth transitions (1 second)
```

### **Lyrics Highlighting**
```
Active Line:
- text-white (100% opacity)
- text-2xl (larger)
- font-bold
- scale-105
- No blur

Inactive Lines:
- text-slate-400 (60% opacity)
- text-lg (smaller)
- font-medium
- blur-[1px]
```

### **Player Bar Timeline**
```
Normal State:
- h-1 (thin)
- Purple → Blue gradient

Hover State:
- h-1.5 (thicker)
- White thumb indicator appears
- Clickable for seeking
```

---

## 🐛 Troubleshooting

### **Issue: Lyrics not showing**
```
Possible causes:
1. Song not in LRCLIB database
2. Internet connection issue
3. Instrumental track (will show music icon)

Fix:
- Try a popular song (Billboard Top 100)
- Check console for errors (F12)
- Wait for loading spinner to finish
```

### **Issue: Player bar looks wrong**
```
Check:
1. Browser window width ≥ 768px (desktop mode)
2. Refresh page (Ctrl+R / Cmd+R)
3. Clear cache if CSS not updating

If hidden on mobile:
- Player bar is desktop-only
- Mobile uses mini player at bottom
```

### **Issue: Full-screen not split on desktop**
```
Check:
1. Window width ≥ 768px
2. Browser zoom is 100%
3. Try F11 to exit full-screen browser mode

Desktop layout requires:
- min-width: 768px (md breakpoint)
```

---

## 📊 Test Songs Recommendations

### **Best for Testing Lyrics:**
```
✅ Popular songs with good LRCLIB data:
- "Bohemian Rhapsody" - Queen
- "Shape of You" - Ed Sheeran
- "Blinding Lights" - The Weeknd
- "Bad Guy" - Billie Eilish
- "Someone Like You" - Adele

❌ Avoid for first test:
- Very new releases (may not be in database)
- Obscure indie tracks
- Classical/instrumental music
```

### **Test Instrumental Detection:**
```
Search for:
- Classical music
- Lo-fi beats
- Movie soundtracks
Should show: Music icon + "Instrumental" message
```

---

## 🎯 Feature Checklist

### **Must Test:**
- [ ] Lyrics load automatically
- [ ] Active line highlights correctly
- [ ] Auto-scroll keeps line centered
- [ ] Desktop: Split-screen layout works
- [ ] Mobile: Tab switching works
- [ ] Player bar: Timeline centered
- [ ] Player bar: Hover effect on timeline
- [ ] Background changes with new song
- [ ] Queue shows real upcoming songs

### **Nice to Test:**
- [ ] Instrumental track detection
- [ ] No lyrics error message
- [ ] Lyrics loading spinner
- [ ] Shuffle/Repeat button toggle
- [ ] Radio Mode badge appears
- [ ] Queue count badge
- [ ] Swipe down to close (mobile)
- [ ] Bottom sheet menu

---

## 🔍 Console Commands (Advanced)

### **Check Lyrics Data:**
```javascript
// Open console (F12) and paste:
import { getSyncedLyrics } from './services/lyricsService';
const result = await getSyncedLyrics('Shape of You', 'Ed Sheeran', 233);
console.log(result);

// Should show:
// {
//   lyrics: [{time: 0, text: "..."}, ...],
//   isInstrumental: false,
//   error: null
// }
```

### **Test LRC Parser:**
```javascript
// Paste in console:
const lrc = "[00:12.50] Hello world\n[00:15.30] Test line";
const parsed = parseLRC(lrc);
console.log(parsed);

// Should show:
// [
//   {time: 12.5, text: "Hello world"},
//   {time: 15.3, text: "Test line"}
// ]
```

---

## 📱 Responsive Breakpoints

```css
/* When to expect different layouts: */

< 768px (Mobile):
- Vertical stack full-screen
- Mini player at bottom
- Tab-based navigation

≥ 768px (Desktop):
- Split-screen full-screen
- Player bar at bottom
- Side-by-side panels
```

---

## 🎉 Success Criteria

### **You'll know it's working when:**

1. **Lyrics:**
   - ✅ Text appears automatically
   - ✅ Highlights move with music
   - ✅ Scrolls to keep active line visible

2. **Player Bar:**
   - ✅ Looks like Apple Music
   - ✅ Timeline is wide and centered
   - ✅ Buttons respond to hover

3. **Full-Screen:**
   - ✅ Desktop shows two columns
   - ✅ Mobile shows single column
   - ✅ Background is colorful and blurred
   - ✅ Transitions are smooth

---

## 🚨 Common Mistakes

### **Don't:**
- ❌ Test on window < 768px expecting desktop layout
- ❌ Expect lyrics for brand new/obscure songs
- ❌ Click timeline expecting seek (not implemented yet)
- ❌ Try to play queue items by clicking (display only)

### **Do:**
- ✅ Test with popular songs first
- ✅ Check both mobile and desktop layouts
- ✅ Look for smooth animations
- ✅ Verify auto-scroll behavior

---

## 📞 Need Help?

### **Check These First:**
1. Console (F12) for errors
2. Network tab for LRCLIB API calls
3. React DevTools for component state

### **Logs to Look For:**
```
✅ Good:
"Lyrics loaded: 45 lines"
"Color extraction: {primary: '#...', secondary: '#...'}"
"Active lyric index: 12"

❌ Bad:
"getSyncedLyrics error: ..."
"LRCLIB API failed: ..."
"Failed to parse LRC: ..."
```

---

**Ready to Test!** 🎵

Start with a popular song, click the lyrics button, and watch the magic happen! ✨
