# GitHub Copilot Instructions for CloudTune

## Project Overview

CloudTune (formerly Appmusica) is a modern music streaming web application built with React 18 that integrates with YouTube, Deezer, and iTunes APIs. The app features intelligent caching, automatic fallback systems, and real-time quota monitoring to provide an optimized audio streaming experience.

**Tech Stack:**
- **Frontend:** React 18.2, React Router v7
- **Styling:** Tailwind CSS 3.3
- **State Management:** React Context API (PlayerContext)
- **Backend Services:** Firebase (Authentication, Cloud Firestore)
- **Build Tool:** Create React App (react-scripts 5.0.1)
- **APIs:** YouTube Data API v3, Deezer API, iTunes API, Invidious/Piped (fallback)
- **Player:** react-player 3.4
- **Animations:** GSAP 3.13

## Architecture

The application follows a **Repository Pattern** with provider abstraction:

```
src/
├── api/
│   ├── providers/          # API providers (YouTube, Deezer, iTunes)
│   ├── utils/              # Cache, error handling, fallback systems
│   ├── MusicRepository.js  # Facade pattern for API access
│   └── config.js
├── components/
│   ├── layout/             # Sidebar, Header, BottomNav
│   ├── player/             # PlayerBar, NowPlayingModal
│   ├── shared/             # QuotaMonitor, Auth components
│   └── lyrics/
├── context/
│   └── PlayerContext.js    # Global player state
├── views/                  # Page components
├── services/               # Business logic services
└── firebase.js             # Firebase configuration
```

## Coding Standards

### JavaScript/React Guidelines
- Use **functional components** with hooks (no class components)
- Follow **React best practices**: hooks rules, proper dependency arrays
- Use **arrow functions** for component definitions
- Prefer **destructuring** for props and state
- Use **PropTypes** or TypeScript types when adding type checking
- Follow **ESLint rules** defined in `.eslintrc.json` (extends react-app)

### Style Guidelines
- Use **Tailwind CSS** utility classes for styling
- Follow existing color palette from `tailwind.config.js`:
  - Primary: `#1DB954` (Spotify Green)
  - Pink accent: `#ff2d8f`
  - Cyan accent: `#06b6d4`
  - Dark panel: `#121212`
- Keep components responsive (mobile-first approach)
- Use GSAP for animations (already in dependencies)

### Code Organization
- Group imports: React/external libraries → components → utils → styles
- Keep components small and focused (Single Responsibility Principle)
- Extract reusable logic into custom hooks (see `src/hooks/`)
- Use the MusicRepository pattern for API interactions
- Implement proper error handling with `api/utils/errorHandler.js`

### Naming Conventions
- **Components:** PascalCase (e.g., `PlayerBar.js`, `NowPlayingModal.js`)
- **Utilities/Hooks:** camelCase (e.g., `cache.js`, `usePlayer.js`)
- **Constants:** UPPER_SNAKE_CASE
- **Folders:** lowercase or kebab-case

## Git Workflow

### Branch Naming
- Feature branches: `feature/[feature-name]` or `copilot/[issue-description]`
- Bug fixes: `fix/[bug-description]`
- Never commit directly to `main` or `master`

### Commit Messages
- Use clear, descriptive commit messages
- Format: `Type: Brief description`
- Examples:
  - `Fix: Resolve audio playback issue in Safari`
  - `Feature: Add playlist sharing functionality`
  - `Refactor: Optimize cache implementation`

## Build & Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm start

# Build for production
npm run build

# Run tests (if any exist)
npm test

# Run ESLint (manual check)
npx eslint src/
```

## Firebase Deployment

```bash
# Build the app first
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Important Files & Directories

### DO NOT MODIFY
- **`/node_modules/`** - Dependencies (in .gitignore)
- **`/build/`** - Production build output (in .gitignore)
- **`.env.production`** - Production environment variables (contains API keys)
- **`/public/`** - Static assets (only modify if necessary)
- **`firebase.json`** - Firebase hosting configuration
- **`.firebaserc`** - Firebase project configuration

### Configuration Files
- **`src/firebase.js`** - Firebase SDK configuration
- **`src/api/config.js`** - API configuration
- **`tailwind.config.js`** - Tailwind CSS theme
- **`jsconfig.json`** - JavaScript project configuration

### Can Modify with Care
- **`src/`** - Application source code (primary workspace)
- **`package.json`** - Only modify if adding/updating dependencies
- **`.eslintrc.json`** - ESLint configuration

## Key Features & Considerations

### 1. Intelligent Caching System
- **localStorage** for persistent video ID cache
- **In-memory Map** for session-based cache
- Cache implementation: `src/api/utils/cache.js`
- Always utilize cache before making API calls

### 2. Fallback System
- Primary: YouTube Data API v3
- Fallback: Invidious/Piped APIs (8 public instances)
- Implementation: `src/api/utils/youtubeFallback.js`
- Handle API quota limits gracefully

### 3. Quota Monitoring
- Real-time quota indicator in UI
- Component: `src/components/shared/QuotaMonitor.js`
- Alert users before quota exhaustion

### 4. Firebase Integration
- Authentication: Firebase Auth
- Database: Cloud Firestore (for favorites/playlists)
- Always handle auth state changes properly

## Testing Guidelines

Currently, the project **does not have a test suite**. When adding tests:
- Use React Testing Library (already available via react-scripts)
- Place tests adjacent to components: `Component.test.js`
- Test user interactions, not implementation details
- Mock external API calls

## Security Best Practices

### Critical Security Rules
- **NEVER** commit API keys or secrets to version control
- Use environment variables for sensitive data (`.env` files)
- Validate and sanitize user inputs
- Handle authentication errors properly
- Implement proper CORS configuration in `setupProxy.js`

### Sensitive Data Locations
- API keys should only be in `.env` (local) or `.env.production` (already committed)
- Firebase configuration in `src/firebase.js` (public keys are acceptable)

## Performance Considerations

- Use React.memo() for expensive components
- Implement lazy loading for routes (React.lazy)
- Optimize images (use WebP when possible)
- Minimize bundle size (code splitting)
- Leverage the existing cache system to reduce API calls

## Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Test with screen readers when possible

## Common Pitfalls to Avoid

1. **Don't bypass the MusicRepository** - Always use it for API access
2. **Don't ignore the cache** - Check cache before API calls
3. **Don't hardcode API keys** - Use environment variables
4. **Don't modify working audio player logic** unless fixing a bug
5. **Don't remove or modify Firebase configuration** without proper testing
6. **Don't add large dependencies** without justification
7. **Don't break the responsive layout** - Test on mobile viewports

## Documentation

- Main README: `README.md` (in Spanish)
- API setup guide: `API_SETUP_GUIDE.md` (if exists)
- Usage examples: `USAGE_EXAMPLES.js`
- Verification checklist: `VERIFICATION_CHECKLIST.txt`

## Language & Localization

- **Primary Language:** Spanish (UI, README, comments)
- Keep user-facing text in Spanish unless instructed otherwise
- Code comments can be in English or Spanish

## Acceptance Criteria for Changes

Every change should:
1. **Maintain existing functionality** - Don't break working features
2. **Follow the established architecture** - Repository pattern, context usage
3. **Be responsive** - Work on mobile and desktop
4. **Handle errors gracefully** - Use errorHandler utility
5. **Pass ESLint checks** - No linting errors
6. **Build successfully** - `npm run build` completes without errors
7. **Preserve Firebase integration** - Auth and Firestore must continue working
8. **Maintain performance** - Use cache, avoid unnecessary API calls

## Questions or Clarifications

If uncertain about:
- **API integrations:** Check `src/api/providers/` and `MusicRepository.js`
- **State management:** Review `src/context/PlayerContext.js`
- **Styling approach:** Reference existing components and `tailwind.config.js`
- **Deployment:** See README.md Firebase section

When in doubt, maintain consistency with existing code patterns and ask for clarification rather than making assumptions that could break functionality.
