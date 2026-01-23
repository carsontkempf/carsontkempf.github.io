You are a project manager working on adding a chess engine to your website. Follow the following todo items and only move them into the completed section once we have verified that they are complete by testing them. 

Maintain maximum organization by adding a chess/ directory in the assets/js/ directory and keep separate and modular files, folders, and functions to be able to complete the entire project. 

Continuously reorganize the files, folders, and functions to maintain modularization and extreme organization after completing every new item.

All tests should be placed in the tests/chess/ directory and absolutely no where else.

Completed:

"
PHASE 1: ENVIRONMENT & ARCHITECTURE - COMPLETED

1.1 Project Structure Setup
[X] Created dedicated chess directory structure
    - chess/index.html
    - assets/css/chess.css
    - assets/js/chess/engine/ (bitboard.js, movegen.js, search.js, eval.js, transposition.js)
    - assets/js/chess/ui/ (board.js, controls.js, analysis.js)
    - assets/js/chess/storage/ (storage-manager.js)
    - assets/js/chess/workers/ (engine-worker.js)
    - _data/chess/ (openings.json, games-history.json, user-profiles/)
    - tests/chess/ (engine/, ui/, integration/)
    Verified: All directories and placeholder files created

[X] Updated _config.yml
    - Added chess configuration section
    - Verified chess/ not in exclude list
    Verified: Configuration added successfully

[X] Created Chess Layout
    - Created _layouts/chess-game.html
    - Inherits from default.html
    - Loads chess-specific CSS/JS assets
    Verified: Layout structure complete with Auth0 integration checks

1.2 Dependencies Setup
[X] Added Chessboard.js
    - Downloaded chessboard-1.0.0.min.js and chessboard-1.0.0.min.css
    - Placed in assets/js/vendor/ and assets/css/vendor/
    - Configured to use CDN-hosted piece images
    Verified: Chessboard.js files in place

[X] Added jQuery
    - Added jQuery 3.6.0 via CDN to chess-game.html
    - Added fallback error checking
    Verified: jQuery loading configured

[X] Verified Auth0 SDK Availability
    - Auth0 SDK already loaded in head.html
    - authService available via auth.js
    - Added console verification checks in chess-game.html
    Verified: Auth0 integration checks in place

1.3 Netlify & GitHub Configuration
[X] GitHub PAT Configuration
    - GitHub PAT already stored in Netlify as GITHUB_DB_TOKEN
    Verified: Configuration already in place

[X] Auth0 Redirects Configuration
    - Auth0 already configured with Chess Player role
    - Callback URLs already configured
    Verified: Configuration already in place

PHASE 2: JSON DATABASE IMPLEMENTATION - COMPLETED

2.1 Database Functions (Server-Side)
[X] Created netlify/functions/db-get-user.js
    - Fetches user profiles from _data/chess/user-profiles/{auth0_id}.json via GitHub API
    - Returns default schema for new users (404 handling)
    - Implements Auth0 JWT verification with role checking
    - Sanitizes auth0_id to prevent path traversal
    Verified: Function created with proper error handling

[X] Created netlify/functions/db-save-user.js
    - Accepts JSON payload for user profile updates
    - Uses GITHUB_DB_TOKEN for GitHub API authentication
    - Implements SHA-based locking to prevent concurrent write conflicts
    - Validates profile data (ttSizePower, depthPriority, agePriority, elo ranges)
    - Commits to db-storage branch to prevent constant site rebuilds
    Verified: Function created with validation and conflict handling

[X] Created netlify/functions/db-save-game.js
    - Appends game data to _data/chess/games-history.json
    - Implements retry logic with exponential backoff for race conditions
    - Generates unique game IDs using uuid
    - Tags games with auth0_id for ownership
    Verified: Function created with retry mechanism

2.2 Client-Side Data Manager
[X] Implemented assets/js/chess/storage/storage-manager.js
    - loadUserProfile() with 5-minute caching
    - saveUserProfile() with 2-second debounce
    - saveUserProfileNow() for immediate saves
    - saveGame() with automatic stats updates
    - Error handling for 409 conflicts and auth failures
    - Development test helpers in window.chessStorageTest
    Verified: Full client-side bridge implemented

2.3 Infrastructure Setup
[X] Installed uuid dependency
    - Added uuid package to netlify/functions/package.json
    - Installed via npm install
    Verified: uuid@10.0.0 installed successfully

[X] Created db-storage branch
    - Created and pushed db-storage branch to GitHub
    - Initialized _data/chess/user-profiles/ directory with .gitkeep
    - Initialized _data/chess/games-history.json with empty array
    Verified: Branch created and data files initialized
"


----------------------------------------------------------

Todo:

"
CHESS ENGINE MASTER IMPLEMENTATION CHECKLIST
Target Project: carsontkempf.github.io
Stack: Jekyll, Netlify, Auth0, Vanilla JS, Netlify Functions (Node.js)
Database Strategy: JSON persistence via GitHub API (Netlify Functions)

PHASE 3: AUTHENTICATION INTEGRATION 

(Week 2)3.1 Leverage Existing Auth[ ] Integrate with assets/js/auth.js.liquid (1 hour)Use the existing auth0 client instance.Add listener for isAuthenticated.On login: Trigger storageManager.loadUserProfile().Verify: User stats load upon login.[ ] User Profile UI (1 hour)Update chess/index.html to display "Welcome, {User}" and "Elo: {Rating}".Verify: Updates dynamically after auth.

PHASE 4: CHESS ENGINE CORE 

(Week 3-4)4.1 Bitboard & Board State[ ] Implement bitboard data structure (3 hours)12 BigUint64Array for pieces, 3 for occupancy (White, Black, All).Helper functions: setBit(), clearBit(), getBit(), popCount().Verify: Unit test - set/clear bits correctly, popCount accurate.[ ] Implement Square Mapping (1 hour)Functions: squareToIndex(), indexToSquare(), fileRank().Verify: a1=0, h8=63, conversions bidirectional.[ ] FEN Parser & Generator (4 hours)parseFEN(fenString): Populate bitboards from standard FEN.generateFEN(): Convert current bitboards to FEN string.Verify: Round trip FEN -> Board -> FEN matches exactly.[ ] Mailbox Board fallback (1 hour)64-element Uint8Array for fast piece lookup (O(1) access).Sync with bitboards on make/unmake.Verify: Piece-on-square queries are accurate.4.2 Move Generation (The Heavy Lifting)[ ] Zobrist Hashing (2 hours)Generate 781 random 64-bit numbers (Polyglot compatible if possible).Hash function for position (incremental updates).Verify: Same position = same hash, different = different.[ ] Magic Bitboards (Sliding Pieces) (4 hours)Implement/Import Magic Bitboard logic for Rooks and Bishops.Store in lookup tables for O(1) attack generation.Verify: Correct attacks on empty board vs blocked board.[ ] Standard Move Generation (5 hours)generateMoves(side):- Pawns: Single/Double push, Captures, En-Passant, Promotion.- Knights: Lookup table jumps.- Kings: Lookup table + Castling logic.- Sliding: Magic lookup.Verify: Perft (Performance Test) results match known standards.[ ] Legal Move Filtering (2 hours)isSquareAttacked() function.Check if move leaves king in check.Verify: Pinned pieces cannot move off pin line.4.3 Make/Unmake Moves[ ] Implement makeMove() (3 hours)Update bitboards, mailbox, hash, game state (castling rights, EP square).Verify: 100 random moves make/unmake correctly.[ ] Implement unmakeMove() (2 hours)Restore previous position from saved state/history stack.Verify: makeMove + unmakeMove returns to exact original state.

PHASE 5: EVALUATION & SEARCH 

(Week 4)5.1 Evaluation Function[ ] Material Counting (1 hour)Sum piece values from bitboards.Verify: Start pos = 0 (balanced).[ ] Piece-Square Tables (PeSTO) (2 hours)Define tables for Opening and Endgame phases.Verify: Tables defined, values in reasonable range.[ ] Tapered Evaluation (2 hours)Calculate game phase based on remaining material.Interpolate between Opening and Endgame PST scores.Verify: Opening favors center, Endgame favors king activity.5.2 Search Algorithm[ ] Negamax Skeleton (2 hours)Recursive function with depth parameter.Verify: Finds simple Mate-in-1.[ ] Alpha-Beta Pruning (2 hours)Track alpha/beta bounds to prune branches.Verify: Same result as Negamax but <50% nodes searched.[ ] Quiescence Search (3 hours)Extend search for captures/checks to avoid "horizon effect".Verify: Does not miss simple tactical sequences (e.g., recapture).[ ] Iterative Deepening (2 hours)Loop depth 1 to Max, returning best move found within time limit.Verify: Returns move within time limit.

PHASE 6: TRANSPOSITION TABLE & CONFIGURATION 

(Week 5)6.1 TT Implementation[ ] TT Data Structure (3 hours)Map with hash keys or large ArrayBuffer.Entry: {hash, depth, score, flag, bestMove, age}.Verify: Store/Retrieve 10,000 entries correctly.[ ] Exponential Replacement Strategy (User Config) (2 hours)Implement the specific math from request:depthWeight = (entry.depth ^ depthExponent) / (maxDepth ^ depthExponent)ageWeight = (currentAge - entry.age) ^ ageExponentVerify: Higher depth entries survive longer based on config.[ ] Integration with Search (2 hours)Probe TT before search; Store TT after search.Use TT move for sorting (Principal Variation).Verify: 80%+ hit rate at depth 6.6.2 Advanced Pruning & Ordering[ ] MVV-LVA Ordering (2 hours)Most Valuable Victim - Least Valuable Attacker.Verify: QxP searched before PxP.[ ] Killer Moves & History Heuristic (4 hours)Store moves that caused cutoffs.Verify: Branching factor reduces.[ ] Null Move Pruning (2 hours)Skip turn to see if position is so good beta is still exceeded.Verify: Speedup in quiet positions.

PHASE 7: OPENING BOOK & GAME PHASES 

(Week 5)7.1 Book Data[ ] Download & Convert Book (2 hours)Source: Polyglot or Lichess DB.Convert to _data/chess/openings.json.Verify: Jekyll builds, data accessible.[ ] Book Lookup Function (2 hours)Hash position -> Binary search in book.Verify: Finds "French Defense" moves from start pos.7.2 Detection[ ] Opening Name Detector (2 hours)Match current moves/hash to ECO codes.Verify: UI displays "Italian Game".

PHASE 8: USER INTERFACE & INTERACTION 

(Week 6)8.1 Board & Controls[ ] Drag-and-Drop Implementation (2 hours)Configure Chessboard.js draggable: true.Validate moves via engine.generateMoves().Verify: Illegal moves snap back.[ ] Move List & Highlighting (2 hours)List container with clickable moves (Jump to position).Highlight current move in list.Verify: Clicking "1. e4" resets board to that state.[ ] Control Panel Buttons (1 hour)New Game, Resign, Offer Draw, Undo, Flip Board.Verify: Buttons functional.8.2 Settings Interface[ ] Configuration Modal (3 hours)TT Size: Selector (16MB - 256MB).Depth Priority: Slider (1.0 - 3.0).Age Priority: Slider (1.0 - 2.0).Verify: Changes update TT_CONFIG object immediately.

PHASE 9: REAL-TIME ANALYSIS & WEB WORKERS 

(Week 6)9.1 Web Worker[ ] Create engineWorker.js (2 hours)Move search, movegen, eval into worker.Message protocol: {type: 'analyze', fen: '...', depth: 10}.Verify: UI remains responsive during 5s search.9.2 Analysis UI[ ] Analysis Panel (2 hours)Divs for: Eval (+0.35), Depth (8/12), Nodes/Sec, PV (Best Line).Verify: Updates ~4-10 times/sec via postMessage.[ ] Visual Feedback (1 hour)SVG Arrow overlay for Best Move on board.Verify: Arrow updates as calculation deepens.

PHASE 10: GAME MANAGEMENT 

(Week 7)10.1 Save/Load[ ] Game Save Logic (2 hours)Serialize state to JSON.Call storageManager.saveGame().Verify: Data appears in GitHub repo.[ ] Import/Export (2 hours)FEN Import input.PGN Export button (generate string).Verify: PGN valid in external tools.

PHASE 11: MATCH REVIEW 

(Week 7)11.1 Review Features[ ] Move Quality Analysis (2 hours)Compare played move eval vs best move eval.Categorize: !! (Brilliant), ? (Mistake), ?? (Blunder).Verify: Blunders identified correctly.[ ] Evaluation Graph (3 hours)Implement Chart.js line graph.X-Axis: Move Number, Y-Axis: Centipawn Eval.Verify: Graph reflects game swings.

PHASE 12: BOT PERSONALITIES 

(Week 8)12.1 Levels[ ] Define Bot Levels (1 hour)Array of configs: { name: "Novice", depth: 2, randomness: 0.2 }.Verify: Level 1 makes mistakes; Level 10 does not.[ ] Intentional Error Logic (2 hours)For low levels, pick 2nd/3rd best move occasionally using randomness factor.Verify: Bot is beatable.

PHASE 13: TESTING, POLISH & OPTIMIZATION 

(Week 8)13.1 Edge Case Testing[ ] Rules Verification (2 hours)Stalemate detection.Threefold repetition.50-move rule.Insufficient material.Verify: Games end correctly in these states.13.2 Optimization[ ] Performance Profiling (2 hours)Measure Nodes/Second.Memory usage check (especially TT).Verify: >100k NPS on desktop.

PHASE 14: DEPLOYMENT 

(Week 9)14.1 Production Build[ ] Minify Assets (1 hour)Ensure JS/CSS minification in Jekyll build.Verify: Production build works locally.[ ] Final Push (30 min)Push to main.Monitor Netlify Build.Verify: Live site functional.SUCCESS METRICS[ ] All unit tests pass (100% pass rate).[ ] Bot move time < 10s (100% of moves).[ ] Search speed > 100k NPS (desktop browsers).[ ] Transposition table hit rate > 80% (depth 6+).[ ] Level 7 bot Elo ~2000+ (measured via self-play).[ ] Mobile playable (iOS Safari + Android Chrome).[ ] Database: User stats successfully persist to GitHub via Netlify Functions.
"

@agent-Plan begin to make an actual plan of phase 9 based on @CLAUDE.md 's description of phase 9 and the completed phase 8. move phase 8 to the completed section of CLAUDE.md

@agent-Plan begin to make an actual plan of phase 14 based on @CLAUDE.md 's description of phase 14 and the completed phase 13. move phase 13 to the completed section of CLAUDE.md