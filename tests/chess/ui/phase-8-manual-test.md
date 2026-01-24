# Phase 8: UI & Interaction - Manual Testing Checklist

## Test Environment
- Browser: Chrome/Firefox/Safari
- URL: http://localhost:4000/chess/ (or deployed URL)
- Device: Desktop and Mobile

---

## Drag & Drop Tests

### Basic Drag & Drop
- [ ] Test 1: Drag white pawn e2 to e4 on first move - should move
- [ ] Test 2: Try to drag black piece on white's turn - should not drag
- [ ] Test 3: Drag piece to illegal square - should snap back
- [ ] Test 4: Drag piece to legal square - should move and update board
- [ ] Test 5: Last move squares (from/to) are highlighted in yellow

### Special Moves
- [ ] Test 6: Castle kingside (e1-g1) - rook should also move
- [ ] Test 7: Castle queenside (e1-c1) - rook should also move
- [ ] Test 8: En passant capture - captured pawn should disappear
- [ ] Test 9: Pawn to 8th rank - promotion dialog should appear
- [ ] Test 10: Promotion dialog - all 4 pieces (Q, R, B, N) clickable
- [ ] Test 11: Select Queen promotion - pawn becomes queen on board

---

## Move List Tests

### Display
- [ ] Test 12: Move "e4" appears as "e4" in move list
- [ ] Test 13: Castling appears as "O-O" or "O-O-O"
- [ ] Test 14: Capture shows "x" (e.g., "exd5", "Nxf6")
- [ ] Test 15: Check shows "+" symbol
- [ ] Test 16: Checkmate shows "#" symbol
- [ ] Test 17: Promotion shows "=Q" notation (e.g., "e8=Q")
- [ ] Test 18: Move numbers formatted as "1. 2. 3."

### Navigation
- [ ] Test 19: Click "1. e4" - board jumps to position after e4
- [ ] Test 20: Click "2. Nf3" - board shows position after move 2
- [ ] Test 21: Current move is highlighted in blue
- [ ] Test 22: Dragging disabled when viewing historical position
- [ ] Test 23: Scroll works for long games (20+ moves)

---

## Control Buttons Tests

### New Game
- [ ] Test 24: Click "New Game" with no moves - resets immediately
- [ ] Test 25: Click "New Game" with moves - shows confirmation dialog
- [ ] Test 26: Confirm new game - board resets to starting position
- [ ] Test 27: Move list clears after new game
- [ ] Test 28: Opening detector resets to "Starting Position"

### Flip Board
- [ ] Test 29: Click "Flip Board" - board rotates 180 degrees
- [ ] Test 30: Click again - board returns to original orientation
- [ ] Test 31: Flip works during game

### Undo
- [ ] Test 32: Undo button disabled at start (no moves)
- [ ] Test 33: Make move - undo button enabled
- [ ] Test 34: Click undo - last move removed from board and list
- [ ] Test 35: Click undo twice - two moves removed
- [ ] Test 36: Undo when viewing history - button disabled

### Resign
- [ ] Test 37: Resign button enabled during game
- [ ] Test 38: Click resign - shows confirmation dialog
- [ ] Test 39: Confirm resign - game ends, alert shows winner
- [ ] Test 40: After resign - resign/draw buttons disabled
- [ ] Test 41: Undo button disabled after game ends

### Offer Draw
- [ ] Test 42: Draw button enabled during game
- [ ] Test 43: Click draw - shows confirmation dialog
- [ ] Test 44: Confirm draw - game ends, alert shows "Draw"
- [ ] Test 45: After draw - resign/draw buttons disabled

---

## Settings Modal Tests

### TT Size Enhancement
- [ ] Test 46: Click "Engine Settings" - modal opens
- [ ] Test 47: TT Size dropdown includes "256 MB (Maximum)" option
- [ ] Test 48: Select 256MB - dropdown updates
- [ ] Test 49: Save settings - success alert appears
- [ ] Test 50: Close and reopen - 256MB still selected (persisted)

### Existing Settings
- [ ] Test 51: Depth Priority slider (1.0 - 3.0) works
- [ ] Test 52: Age Priority slider (1.0 - 2.5) works
- [ ] Test 53: Slider values update display in real-time
- [ ] Test 54: Cancel button closes without saving
- [ ] Test 55: X button closes modal

---

## Integration Tests

### Opening Detector
- [ ] Test 56: Play 1.e4 - opening shows "Starting Position" or opening name
- [ ] Test 57: Play 1.e4 e5 2.Nf3 Nc6 3.Bc4 - shows "Italian Game" (if in book)
- [ ] Test 58: ECO code displays (e.g., "C50")
- [ ] Test 59: Opening persists after undo

### Game State
- [ ] Test 60: Make 3 moves, undo 1 - board state correct
- [ ] Test 61: Navigate to move 2, then move 4 - board updates correctly
- [ ] Test 62: Start new game - all state cleared
- [ ] Test 63: Resign game, start new game - buttons re-enabled

---

## Responsive Design Tests

### Desktop (1200px+)
- [ ] Test 64: Three column layout (controls | board | moves/analysis)
- [ ] Test 65: Move list visible on right side
- [ ] Test 66: All buttons visible and functional

### Tablet (768px - 1200px)
- [ ] Test 67: Single column layout
- [ ] Test 68: Sections stack vertically
- [ ] Test 69: Move list appears below board
- [ ] Test 70: Controls accessible

### Mobile (<768px)
- [ ] Test 71: Board scales to screen width
- [ ] Test 72: All sections stack vertically
- [ ] Test 73: Buttons stack/wrap appropriately
- [ ] Test 74: Promotion dialog centered and scaled
- [ ] Test 75: Move list scrollable with reduced height

---

## Dark Mode Tests

### Visual Consistency
- [ ] Test 76: Dark mode auto-activates (if system preference set)
- [ ] Test 77: Move list readable in dark mode
- [ ] Test 78: Promotion dialog readable in dark mode
- [ ] Test 79: All buttons visible in dark mode
- [ ] Test 80: Highlighted moves readable in dark mode

---

## Error Handling

### Edge Cases
- [ ] Test 81: Rapidly click undo multiple times - no crashes
- [ ] Test 82: Navigate history while promotion dialog open - handled gracefully
- [ ] Test 83: Resize window during game - layout adjusts
- [ ] Test 84: Click move in list that doesn't exist - no error
- [ ] Test 85: Make 50+ moves - move list scrolls correctly

---

## Console Checks

### No Errors
- [ ] Test 86: Open browser console - no JavaScript errors
- [ ] Test 87: Make several moves - no errors logged
- [ ] Test 88: Navigate history - no errors
- [ ] Test 89: Resign/draw - no errors
- [ ] Test 90: Open/close settings - no errors

### Logging Verification
- [ ] Test 91: "[BoardManager] Board initialized" appears
- [ ] Test 92: "[ControlsManager] Buttons initialized" appears
- [ ] Test 93: "[BoardManager] Move executed: e4" appears after move
- [ ] Test 94: No unexpected warnings or errors

---

## Performance Tests

### Responsiveness
- [ ] Test 95: Drag piece - animation smooth (no lag)
- [ ] Test 96: Click move in list - instant jump (<100ms)
- [ ] Test 97: Open promotion dialog - appears immediately
- [ ] Test 98: Scroll move list - smooth scrolling
- [ ] Test 99: 100+ move game - UI remains responsive

---

## Success Criteria

**Phase 8 passes when:**
- All 99 tests pass (100% pass rate)
- No console errors during normal gameplay
- All buttons functional and state-managed correctly
- Move list displays accurate SAN notation
- Drag-and-drop validates all moves via engine
- Promotion dialog works for all piece types
- Layout responsive on desktop, tablet, and mobile
- Dark mode fully supported

---

## Known Issues

Document any issues found during testing:

1.
2.
3.

---

## Testing Notes

- Date tested: _________________
- Tester: _________________
- Browser/Version: _________________
- Pass rate: _____ / 99 tests
