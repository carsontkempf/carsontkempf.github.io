# PHASE 8: USER INTERFACE & INTERACTION - IMPLEMENTATION PLAN

## Overview

Phase 8 focuses on making the chess board interactive, adding move list functionality, and implementing all control buttons. This phase builds on the completed Phases 1-7 (architecture, database, auth, engine core, eval/search, transposition table, and opening book).

## Prerequisites Verified

- Chessboard.js library loaded and available
- Chess engine modules complete (bitboard, board, game, movegen, search, eval, transposition-table, opening-book)
- UI placeholder files exist (board.js, controls.js)
- Opening detector functional
- Settings modal complete (Phase 6)
- HTML structure in chess/index.html ready

---

## TASK BREAKDOWN

### 8.1 BOARD & CONTROLS

#### Task 8.1.1: Drag-and-Drop Implementation (2 hours)

**Files to modify:**
- `/Users/ctk/Programming/Published/carsontkempf.github.io/assets/js/chess/ui/board.js`
- `/Users/ctk/Programming/Published/carsontkempf.github.io/chess/index.html`

**Implementation steps:**

1. **Create BoardManager class in board.js**
   - Import engine modules: Board, generateLegalMoves, makeMove, unmakeMove from game.js
   - Import opening-detector.js for opening updates
   - Import squareToAlgebraic from bitboard.js
   - Initialize Chessboard.js with draggable: true
   - Store current engine Board state
   - Store move history array (for navigation)

2. **Implement move validation function**
   - onDragStart callback: return false if not player's turn
   - onDrop callback:
     - Get from/to squares in algebraic notation
     - Convert to square indices using algebraicToSquare
     - Generate legal moves for current position
     - Check if move is in legal moves list
     - If legal: make move on engine board, update UI, return 'snapback' for invalid
     - Handle promotion: show promotion dialog if pawn reaches back rank

3. **Implement promotion dialog**
   - Create modal/dialog in HTML (hidden by default)
   - Show when pawn move to rank 1/8 detected
   - Buttons for Queen, Rook, Bishop, Knight
   - Return promotion piece type to complete move
   - Update Chessboard.js with promoted piece

4. **Integrate with engine board state**
   - Keep engine Board instance in sync
   - Call makeMove() when valid move made
   - Update opening detector after each move
   - Update move history array
   - Generate FEN and update board.generateFEN()

5. **Add visual feedback**
   - Highlight last move (from/to squares)
   - CSS classes for highlighted squares
   - Clear highlights on new move

**Verification steps:**
- Drag pieces only when it's their turn
- Illegal moves snap back
- Legal moves update board and engine state
- Pawn promotion shows dialog and completes correctly
- Last move highlighted visually
- Opening detector updates after moves

**Integration points:**
- game.js: generateLegalMoves(), makeMove(), unmakeMove()
- board.js (engine): parseFEN(), generateFEN()
- opening-detector.js: update()
- bitboard.js: algebraicToSquare(), squareToAlgebraic()

---

#### Task 8.1.2: Move List & Highlighting (2 hours)

**Files to modify:**
- `/Users/ctk/Programming/Published/carsontkempf.github.io/assets/js/chess/ui/board.js`
- `/Users/ctk/Programming/Published/carsontkempf.github.io/chess/index.html`
- `/Users/ctk/Programming/Published/carsontkempf.github.io/assets/css/chess.css`

**Implementation steps:**

1. **Add move list HTML structure**
   - Create div in chess/index.html (in controls section or new section)
   - Container: `<div id="move-list" class="move-list"></div>`
   - Move pairs: `<div class="move-pair"><span class="move-number">1.</span><span class="white-move">e4</span><span class="black-move">e5</span></div>`

2. **Implement move list update function in BoardManager**
   - addMoveToList(move, moveNumber, color)
   - Convert move object to algebraic notation (e.g., "e4", "Nf3", "O-O")
   - Add check (+) and checkmate (#) symbols
   - Handle castling notation (O-O, O-O-O)
   - Handle captures (exd5, Nxf6)
   - Update HTML move list container

3. **Implement move notation generator**
   - Helper function: moveToAlgebraic(move, board)
   - Generate standard algebraic notation (SAN)
   - Disambiguate piece moves when necessary (Nbd2 vs Nfd2)
   - Add capture symbol (x) when applicable
   - Add promotion notation (e8=Q)

4. **Add clickable navigation**
   - Make each move in list clickable
   - onClick: jump to that position in game
   - Store board state at each move (or replay from start)
   - Update Chessboard.js position
   - Highlight selected move in list

5. **Implement position navigation**
   - Track currentMoveIndex
   - loadPositionAtIndex(index)
   - Rebuild board state from move history
   - Update Chessboard.js visual board
   - Disable dragging when viewing historical position

6. **Style move list**
   - CSS for move-list container
   - Scrollable container (max-height with overflow)
   - Hover effects for moves
   - Highlight current/selected move
   - Alternating row colors for readability

**Verification steps:**
- Each move appears in list with correct notation
- Castling shown as O-O / O-O-O
- Captures show 'x' symbol
- Check shows '+', checkmate shows '#'
- Clicking move jumps to that position
- Current move highlighted in list
- Historical positions prevent dragging

**Integration points:**
- game.js: Board state for notation generation
- movegen.js: Move flags for special moves (castling, EP, promotion)
- search.js: isInCheck() for check detection

---

#### Task 8.1.3: Control Panel Buttons (1 hour)

**Files to modify:**
- `/Users/ctk/Programming/Published/carsontkempf.github.io/assets/js/chess/ui/controls.js`
- `/Users/ctk/Programming/Published/carsontkempf.github.io/chess/index.html`

**Implementation steps:**

1. **Create ControlsManager class in controls.js**
   - Export singleton instance
   - Initialize button event listeners
   - Store reference to BoardManager

2. **Implement New Game button**
   - Reset engine board to starting position
   - Clear move history
   - Reset Chessboard.js to start position
   - Reset opening detector
   - Clear move list
   - Enable dragging
   - Confirmation dialog if game in progress

3. **Implement Flip Board button**
   - Call Chessboard.js flip() method
   - Update orientation state
   - Re-render board
   - Keep functionality available during game

4. **Implement Undo button**
   - Remove last move from history
   - Call unmakeMove() on engine board
   - Update Chessboard.js position
   - Update move list (remove last move)
   - Update opening detector
   - Disable when no moves to undo

5. **Implement Resign button**
   - Show confirmation dialog
   - Mark game as resigned
   - Disable further moves
   - Update game result
   - Offer to save game (if authenticated)

6. **Implement Offer Draw button**
   - Show draw offer dialog
   - Mark game as drawn (if accepted)
   - Disable further moves
   - Offer to save game (if authenticated)

7. **Button state management**
   - Enable/disable buttons based on game state
   - New Game: always enabled
   - Flip Board: always enabled
   - Undo: enabled only when moves exist
   - Resign: enabled only during active game
   - Offer Draw: enabled only during active game

**Verification steps:**
- New Game resets everything to starting position
- Flip Board changes board orientation
- Undo removes last move and updates state
- Resign ends game with confirmation
- Offer Draw shows dialog and ends game
- Buttons enabled/disabled appropriately
- Confirmation dialogs prevent accidental actions

**Integration points:**
- board.js (UI): BoardManager for board state
- game.js: unmakeMove(), generateFEN()
- opening-detector.js: reset()
- storage-manager.js: saveGame() for resigned/drawn games

---

### 8.2 SETTINGS INTERFACE

#### Task 8.2.1: Settings Modal Enhancement (1 hour)

**Note:** Settings modal was implemented in Phase 6. This task adds minor enhancements for Phase 8 integration.

**Files to modify:**
- `/Users/ctk/Programming/Published/carsontkempf.github.io/chess/index.html` (modal already exists)
- `/Users/ctk/Programming/Published/carsontkempf.github.io/assets/css/chess.css` (styles already exist)

**Implementation steps:**

1. **Verify existing modal functionality**
   - TT Size selector (1MB - 64MB) - COMPLETE
   - Depth Priority slider (1.0 - 3.0) - COMPLETE
   - Age Priority slider (1.0 - 2.5) - COMPLETE
   - Save to profile/localStorage - COMPLETE

2. **Add settings change notification**
   - Display message when settings saved
   - Show "Settings will apply to next game" notice
   - Add visual feedback on save success

3. **Add setting ranges validation**
   - Ensure TT Size options expanded to 16MB-256MB range (update from Phase 6's 1MB-64MB)
   - Current values: 20 (1MB), 22 (4MB), 24 (16MB), 26 (64MB)
   - Add options: 28 (256MB)
   - Keep default at 22 (4MB)

4. **Test settings persistence**
   - Verify settings load on page refresh
   - Verify ttConfigChanged event fires
   - Verify settings saved to server (authenticated)
   - Verify settings saved to localStorage (guest)

**Verification steps:**
- Settings modal opens and closes correctly
- Slider values update display in real-time
- Save button persists settings
- Settings load from storage on page load
- Visual feedback on save success
- TT Size range includes up to 256MB

**Integration points:**
- storage-manager.js: loadUserProfile(), saveUserProfile()
- Future Phase 9: ttConfigChanged event for engine reinitialization

---

## FILE STRUCTURE SUMMARY

### New/Modified Files:

**UI Modules:**
- `assets/js/chess/ui/board.js` - BoardManager class with drag-drop and move list
- `assets/js/chess/ui/controls.js` - ControlsManager class with button handlers

**HTML:**
- `chess/index.html` - Add move list container, promotion dialog, update buttons

**CSS:**
- `assets/css/chess.css` - Move list styles, promotion dialog, highlighted squares

**Tests:**
- `tests/chess/ui/board-test.js` - NEW: Tests for drag-drop and move list
- `tests/chess/ui/controls-test.js` - NEW: Tests for control buttons
- `tests/chess/ui/phase-8-test.html` - NEW: Browser test runner

---

## TESTING PLAN

### Unit Tests (tests/chess/ui/board-test.js)

**Test suite structure:**
```javascript
export async function runBoardUITests() {
  // Tests:
  // 1. BoardManager initialization
  // 2. Legal move validation
  // 3. Illegal move rejection (snapback)
  // 4. Pawn promotion dialog
  // 5. Move list generation
  // 6. Move notation (SAN) accuracy
  // 7. Clickable move navigation
  // 8. Last move highlighting
  // 9. Opening detector integration
  // 10. Position jump accuracy
}
```

### Integration Tests (tests/chess/ui/controls-test.js)

**Test suite structure:**
```javascript
export async function runControlsTests() {
  // Tests:
  // 1. New Game reset
  // 2. Flip Board orientation change
  // 3. Undo move functionality
  // 4. Resign game flow
  // 5. Draw offer flow
  // 6. Button state management
  // 7. Confirmation dialogs
}
```

### Manual Testing Checklist

**Drag & Drop:**
- [ ] Drag white piece on white's turn - moves
- [ ] Drag black piece on white's turn - no drag
- [ ] Drag to illegal square - snaps back
- [ ] Drag to legal square - moves and updates
- [ ] Pawn to 8th rank - shows promotion dialog
- [ ] Promotion dialog - all pieces selectable
- [ ] Castling via drag king - rook moves too
- [ ] En passant capture - captured pawn removed

**Move List:**
- [ ] 1. e4 appears as "e4" in move list
- [ ] Castling appears as "O-O" or "O-O-O"
- [ ] Captures show "x" (e.g., "exd5")
- [ ] Checks show "+" symbol
- [ ] Checkmate shows "#" symbol
- [ ] Click "1. e4" - jumps to position after e4
- [ ] Current move highlighted in list
- [ ] Scroll works for long games (>20 moves)

**Controls:**
- [ ] New Game - confirms and resets
- [ ] Flip Board - changes orientation
- [ ] Undo - removes last move
- [ ] Undo disabled when no moves
- [ ] Resign - confirms and ends game
- [ ] Draw offer - shows dialog
- [ ] Buttons disabled when viewing history

**Settings Modal:**
- [ ] Settings button opens modal
- [ ] TT Size selector has 16MB-256MB range
- [ ] Sliders update value display
- [ ] Save button persists settings
- [ ] Settings load on page refresh
- [ ] Close button works
- [ ] Overlay click closes modal

---

## IMPLEMENTATION ORDER

**Recommended sequence:**

1. **Task 8.1.1** (Drag-and-Drop) - Core functionality first
2. **Task 8.1.2** (Move List) - Depends on drag-drop working
3. **Task 8.1.3** (Control Buttons) - Depends on board state
4. **Task 8.2.1** (Settings Enhancement) - Independent, minor updates
5. **Testing** - Write and run all tests after implementation

---

## INTEGRATION CHECKLIST

**Before starting Phase 8:**
- [x] Phase 7 complete (opening book functional)
- [x] Engine modules export necessary functions
- [x] Chessboard.js loaded and available
- [x] HTML structure in place
- [x] CSS base styles ready

**After Phase 8:**
- [ ] All drag-drop moves validated by engine
- [ ] Move list shows correct SAN notation
- [ ] All control buttons functional
- [ ] Settings modal enhanced with new range
- [ ] Unit tests passing (100% target)
- [ ] Manual test checklist complete
- [ ] No console errors during gameplay
- [ ] Game state synced between UI and engine

---

## SUCCESS METRICS

**Phase 8 completion requires:**

1. **Drag & Drop:**
   - Illegal moves rejected 100% of time
   - Legal moves execute correctly 100% of time
   - Promotion dialog appears for all pawn promotions
   - No desync between UI board and engine board

2. **Move List:**
   - SAN notation accuracy: 100%
   - Castling notation correct: 100%
   - Check/checkmate symbols correct: 100%
   - Position navigation works: 100% of moves

3. **Controls:**
   - All 5 buttons functional
   - State management correct (no invalid states)
   - Confirmations prevent accidental actions
   - Undo restores exact previous position

4. **Settings:**
   - TT Size range: 16MB - 256MB
   - Settings persist across page loads
   - No console errors on save

5. **Testing:**
   - Unit test pass rate: 100%
   - Integration test pass rate: 100%
   - Manual test checklist: All items passed
   - Performance: <100ms move validation

---

## RISK MITIGATION

**Potential issues and solutions:**

1. **Issue:** Chessboard.js position desyncs from engine board
   - **Solution:** Always use engine board as source of truth, update Chessboard.js from FEN

2. **Issue:** SAN notation ambiguity (multiple pieces can move to same square)
   - **Solution:** Implement full disambiguation logic (check file, rank, both)

3. **Issue:** Move list too long causes layout issues
   - **Solution:** Scrollable container with max-height, sticky move numbers

4. **Issue:** Promotion dialog blocks UI
   - **Solution:** Modal overlay, force selection before continuing

5. **Issue:** Undo during computer thinking breaks state
   - **Solution:** Disable undo when engine is thinking (Phase 9 consideration)

6. **Issue:** Browser back button breaks game state
   - **Solution:** Use history.pushState to save state (future enhancement)

---

## DEPENDENCIES FOR FUTURE PHASES

**Phase 9 will need:**
- BoardManager.getBoardState() - returns current engine Board
- BoardManager.isPlayerTurn() - returns true if player can move
- BoardManager.makeEngineMove(move) - applies computer move to UI
- ControlsManager.disableControls() - during engine thinking
- ControlsManager.enableControls() - after engine completes

**Phase 10 will need:**
- BoardManager.exportPGN() - generate PGN string
- BoardManager.importFEN(fen) - load position from FEN
- BoardManager.getMoveHistory() - returns array of moves

---

## NOTES

- Keep UI responsive (no blocking operations in UI thread)
- All engine calls should be synchronous for now (Phase 9 adds worker)
- Store minimal state in UI, derive from engine board when possible
- Use events for cross-module communication
- Follow existing code style (ES6 modules, JSDoc comments)
- Maintain extreme organization (separate concerns into modules)

---

## COMPLETION CHECKLIST

**Phase 8 is complete when:**

- [ ] User can drag and drop pieces to make moves
- [ ] Illegal moves are prevented (snap back)
- [ ] Promotion dialog appears and works correctly
- [ ] Move list displays all moves in SAN notation
- [ ] Clicking moves navigates to that position
- [ ] New Game button resets everything
- [ ] Flip Board changes orientation
- [ ] Undo removes moves correctly
- [ ] Resign and Draw offer work with confirmations
- [ ] Settings modal has 16MB-256MB TT range
- [ ] All unit tests pass (100%)
- [ ] All integration tests pass (100%)
- [ ] Manual test checklist complete
- [ ] No console errors
- [ ] Code follows project style guidelines
- [ ] Files organized in correct directories
- [ ] Documentation updated (if needed)
