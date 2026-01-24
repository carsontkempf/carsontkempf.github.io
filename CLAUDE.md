You are a project manager working on adding a chess engine to your website. Follow the following todo items and only move them into the completed section once we have verified that they are complete by testing them.

Maintain maximum organization by adding a chess/ directory in the assets/js/ directory and keep separate and modular files, folders, and functions to be able to complete the entire project.

Continuously reorganize the files, folders, and functions to maintain modularization and extreme organization after completing every new item.

All tests should be placed in the tests/chess/ directory and absolutely no where else.

---

## Completed Phases Summary

### Phase 1: Environment & Architecture
- Project structure with dedicated chess directories
- Dependencies: Chessboard.js, jQuery, Auth0 SDK
- Netlify and GitHub configuration complete

### Phase 2: JSON Database Implementation
- Server-side functions: db-get-user, db-save-user, db-save-game
- Client-side storage-manager with caching and debouncing
- db-storage branch infrastructure with user profiles and game history

### Phase 3: Authentication Integration
- Storage manager ES6 module integration
- User profile UI with stats display (elo, games, win rate)
- Dynamic profile updates on authentication
- Responsive CSS with dark mode support

### Phase 4: Chess Engine Core
- Bitboard data structure with BigInt (12 piece bitboards, 3 occupancy)
- Square mapping and FEN parser/generator
- Zobrist hashing with 781 random 64-bit numbers
- Magic bitboards and attack tables
- Move encoding (16-bit) and generation for all piece types
- Legal move filtering with pin detection
- Make/unmake moves with GameState preservation
- Perft test suite with 6 standard positions

### Phase 5: Evaluation & Search
- Material counting with piece values
- Piece-square tables (PeSTO) for opening and endgame
- Game phase detection with tapered evaluation
- Negamax with alpha-beta pruning
- Quiescence search for tactical positions
- Iterative deepening with time management
- Critical bug fixes: filterLegalMoves side check, castling through check

### Phase 6: Transposition Table & Configuration
- TT with Map-based storage and exponential replacement strategy
- Configurable depth priority (1.0-3.0) and age priority (1.0-2.5)
- Move ordering: MVV-LVA, killer moves, history heuristic
- Null move pruning with zugzwang detection
- Engine settings modal with TT size selector (1MB-64MB)
- Settings persist to user profile or localStorage

### Phase 7: Opening Book & Game Phases
- ECO database with 52 openings (725KB JSON)
- Zobrist hash-based O(1) lookup
- Opening detector UI with ECO code display
- Book lookup performance: 0.12ms average
- Major openings detected: French, Italian, Sicilian, Ruy Lopez, Queen's Gambit

### Phase 8: UI & Interaction - VERIFIED & COMPLETE
- BoardManager class: drag-and-drop with engine move validation (703 lines)
- Pawn promotion dialog with piece selection (Q, R, B, N)
- Move list with Standard Algebraic Notation (SAN) and clickable navigation
- ControlsManager: New Game, Flip Board, Undo, Resign, Offer Draw (297 lines)
- Last move highlighting (yellow overlay on squares)
- Position history with replay capability
- Button state management (enable/disable based on game state)
- Enhanced TT settings modal (now includes 256MB option)
- Opening detector integration maintained
- CSS fix for piece positioning (centered in squares)
- **Test Results:** 41/41 automated tests PASSED (100%)
- **Files:** board.js, controls.js, chess.css, chess/index.html
- **Test Report:** tests/chess/ui/phase-8-automated-test-results.md

### Phase 9: Real-Time Analysis & Web Workers
- Engine worker with importScripts for all modules
- Worker manager with message protocol (analyze, stop, configure)
- Analysis UI with eval score, depth, NPS, PV display
- SVG arrow overlay for best move visualization
- Progress callbacks with 4-10 Hz update frequency

### Phase 10: Game Management
- PGN generator with proper headers and 80-char wrapping
- FEN validator with comprehensive validation rules
- GameManager with serialization and auto-save (every 5 moves)
- ImportExportManager for FEN import, PGN export, clipboard copy
- Load game modal with saved games list
- db-get-games Netlify function with auth filtering

---

## Current Status

**Test Results:**
- Perft: 100% pass rate (20/20 tests)
- Evaluation: 100% pass rate (23/23 tests)
- TT & Search: 100% pass rate (19/19 tests)
- Opening Book: 100% pass rate (16/16 tests)
- UI & Interaction (Phase 8): 100% pass rate (41/41 automated tests)
- Game Management: 100% pass rate (13/13 automated tests)

**Performance:**
- Move generation: 300-400k nodes/second
- Opening book lookup: 0.12ms average
- TT hit rate: 43-51% at depth 4
- Web worker NPS: 100k+ in Chrome/Edge

**Architecture:**
- Fully modular codebase with singleton pattern managers
- Event-driven system (chessMoveMade, chessGameReset, ttConfigChanged, etc.)
- Responsive UI with dark mode support
- Mobile-friendly design

**Next Phase:** Phase 11 - Match Review (move quality analysis, evaluation graph)

---

## Todo

CHESS ENGINE MASTER IMPLEMENTATION CHECKLIST
Target Project: carsontkempf.github.io
Stack: Jekyll, Netlify, Auth0, Vanilla JS, Netlify Functions (Node.js)
Database Strategy: JSON persistence via GitHub API (Netlify Functions)

PHASE 11: MATCH REVIEW (Next Phase)

11.1 Review Features
[ ] Move Quality Analysis (2 hours)
    - Compare played move eval vs best move eval
    - Categorize: !! (Brilliant), ? (Mistake), ?? (Blunder)
    Verify: Blunders identified correctly

[ ] Evaluation Graph (3 hours)
    - Implement Chart.js line graph
    - X-Axis: Move Number, Y-Axis: Centipawn Eval
    Verify: Graph reflects game swings

PHASE 12: BOT PERSONALITIES

12.1 Levels
[ ] Define Bot Levels (1 hour)
    - Array of configs: { name: "Novice", depth: 2, randomness: 0.2 }
    Verify: Level 1 makes mistakes; Level 10 does not

[ ] Intentional Error Logic (2 hours)
    - For low levels, pick 2nd/3rd best move occasionally using randomness factor
    Verify: Bot is beatable

PHASE 13: TESTING, POLISH & OPTIMIZATION

13.1 Edge Case Testing
[ ] Rules Verification (2 hours)
    - Stalemate detection
    - Threefold repetition
    - 50-move rule
    - Insufficient material
    Verify: Games end correctly in these states

13.2 Optimization
[ ] Performance Profiling (2 hours)
    - Measure Nodes/Second
    - Memory usage check (especially TT)
    Verify: >100k NPS on desktop

PHASE 14: DEPLOYMENT

14.1 Production Build
[ ] Minify Assets (1 hour)
    - Ensure JS/CSS minification in Jekyll build
    Verify: Production build works locally

[ ] Final Push (30 min)
    - Push to main
    - Monitor Netlify Build
    Verify: Live site functional

SUCCESS METRICS
[ ] All unit tests pass (100% pass rate)
[ ] Bot move time < 10s (100% of moves)
[ ] Search speed > 100k NPS (desktop browsers)
[ ] Transposition table hit rate > 80% (depth 6+)
[ ] Level 7 bot Elo ~2000+ (measured via self-play)
[ ] Mobile playable (iOS Safari + Android Chrome)
[ ] Database: User stats successfully persist to GitHub via Netlify Functions
