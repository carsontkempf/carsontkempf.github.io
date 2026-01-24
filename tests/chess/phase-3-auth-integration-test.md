# Phase 3: Authentication Integration - Test Plan

## Test Environment
- Local: `bundle exec jekyll serve` or `netlify dev`
- Production: https://carsontkempf.github.io/chess/

## Test Cases

### Test 1: Unauthenticated User
**Steps:**
1. Navigate to /chess/
2. Ensure you are logged out

**Expected Results:**
- User profile section displays "Welcome, Guest"
- "Login to Save Games" button is visible
- User stats section is hidden
- Console shows:
  - `[CHESS] User not authenticated`
  - `[CHESS] Profile UI updated for guest user`

**Pass Criteria:** All expected results match

---

### Test 2: Login Button Functionality
**Steps:**
1. Navigate to /chess/ (unauthenticated)
2. Click "Login to Save Games" button

**Expected Results:**
- Redirected to Auth0 login page
- After successful login, redirected back to /chess/
- Profile UI updates automatically

**Pass Criteria:** Login flow completes successfully

---

### Test 3: Authenticated User - Profile Load
**Steps:**
1. Navigate to /chess/ (authenticated)
2. Open browser console

**Expected Results:**
- User profile section displays "Welcome, [Name]"
- Login button is hidden
- User stats section is visible showing:
  - Elo Rating (default: 1200 for new users)
  - Games Played (default: 0 for new users)
  - Win Rate (default: 0% for new users)
- Console shows:
  - `[CHESS] User: [email]`
  - `[CHESS] Loading user profile...`
  - `[CHESS] ✓ Profile loaded: [profile object]`
  - `[CHESS] Profile UI updated for authenticated user: [name]`

**Pass Criteria:** All expected results match

---

### Test 4: Storage Manager Integration
**Steps:**
1. Navigate to /chess/ (authenticated)
2. Open browser console
3. Run: `window.chessStorageManager`

**Expected Results:**
- Returns StorageManager instance
- Has methods: loadUserProfile, saveUserProfile, saveGame, etc.
- Console shows: `[StorageManager] Returning cached profile` (if recently loaded)

**Pass Criteria:** Storage manager is accessible and functional

---

### Test 5: Profile Data Persistence
**Steps:**
1. Navigate to /chess/ (authenticated)
2. Open browser console
3. Run: `await window.chessStorageManager.loadUserProfile(true)` (force refresh)
4. Check returned profile object

**Expected Results:**
- Profile object contains:
  ```javascript
  {
    preferences: { boardTheme, ttSizePower, depthPriority, agePriority },
    stats: { wins, losses, draws, gamesPlayed, elo },
    auth0_id: "[user's auth0 id]",
    email: "[user's email]",
    lastUpdated: "[timestamp]"
  }
  ```
- For new users, returns default profile
- Console shows: `[StorageManager] Profile loaded successfully`

**Pass Criteria:** Profile loads correctly from GitHub storage

---

### Test 6: Dynamic Profile Updates
**Steps:**
1. Navigate to /chess/ (authenticated)
2. Open browser console
3. Manually trigger profile update:
   ```javascript
   window.updateChessProfile({
     stats: {
       elo: 1500,
       gamesPlayed: 10,
       wins: 7,
       losses: 2,
       draws: 1
     }
   });
   ```

**Expected Results:**
- UI updates immediately:
  - Elo Rating: 1500
  - Games Played: 10
  - Win Rate: 70%

**Pass Criteria:** UI reflects updated stats

---

### Test 7: Error Handling - Storage Unavailable
**Steps:**
1. Navigate to /chess/ (authenticated)
2. Open browser console
3. Delete storageManager: `delete window.chessStorageManager`
4. Reload page

**Expected Results:**
- Console shows: `[CHESS] Storage manager not yet available`
- Page doesn't crash
- Guest UI is shown

**Pass Criteria:** Graceful degradation

---

### Test 8: Mobile Responsive Design
**Steps:**
1. Navigate to /chess/
2. Open DevTools mobile emulation (iPhone 12 or similar)

**Expected Results:**
- User profile section stacks vertically
- Stats display in horizontal row centered
- Board remains centered
- All text is readable
- Touch targets are appropriately sized

**Pass Criteria:** Layout works on mobile viewports

---

### Test 9: Dark Mode Support
**Steps:**
1. Navigate to /chess/
2. Enable dark mode in OS settings or browser DevTools
3. Check user profile section

**Expected Results:**
- User profile background is dark (#2a2a2a → #1f1f1f gradient)
- Text is light colored
- Stats values use lighter blue (#4da6ff)
- Good contrast maintained

**Pass Criteria:** Dark mode renders correctly

---

## Regression Tests

### Test 10: Existing Auth Flow Unaffected
**Steps:**
1. Navigate to /dashboard/
2. Click login
3. Verify dashboard auth still works

**Expected Results:**
- Dashboard authentication unchanged
- Login redirects to /dashboard/ (not /chess/)
- authReady event fires correctly

**Pass Criteria:** No regressions in existing auth

---

## Performance Tests

### Test 11: Profile Load Time
**Steps:**
1. Navigate to /chess/ (authenticated, cache cleared)
2. Measure time from authReady to profile display

**Expected Results:**
- Profile loads within 2 seconds
- Cached profile loads instantly (<100ms)

**Pass Criteria:** Acceptable load times

---

## Manual Verification Checklist

- [ ] Guest user sees "Welcome, Guest"
- [ ] Guest user sees login button
- [ ] Guest user stats are hidden
- [ ] Authenticated user sees their name
- [ ] Authenticated user sees Elo rating
- [ ] Authenticated user sees games played
- [ ] Authenticated user sees win rate
- [ ] Login button works
- [ ] Profile loads automatically on auth
- [ ] Profile data persists across refreshes
- [ ] Storage manager is accessible
- [ ] Mobile layout works
- [ ] Dark mode works
- [ ] No console errors
- [ ] Dashboard auth unaffected

---

## Known Issues / Limitations

1. **First-time users**: May see brief flash of "Guest" before profile loads
2. **Cache timing**: 5-minute cache may show stale data if updated elsewhere
3. **Win rate calculation**: Shows 0% for users with no games (expected)

---

## Testing Notes

- Use browser DevTools Network tab to verify API calls
- Use browser DevTools Application tab to check localStorage caching
- Check Netlify Functions logs for server-side errors
- Verify GitHub db-storage branch shows user profile files
