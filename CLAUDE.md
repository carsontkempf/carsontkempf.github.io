## CDN Script Event Listener Rule

When integrating any CDN library that fires an initialization event (e.g. `musickitloaded` for MusicKit, `onYouTubeIframeAPIReady`, etc.):

* ALWAYS place the event listener in an **inline (non-deferred) script** BEFORE the CDN `<script defer>` tag
* NEVER rely on a deferred or module script to catch events fired by a deferred CDN script — they execute in order and the CDN fires its event during its own execution, so subsequent deferred listeners miss it
* Use a **flag + queue pattern**: set a `window._xxxReady` flag and flush a `window._xxxWaiters[]` array when the event fires; deferred code checks the flag on load
* Add a polling fallback (e.g. `setInterval` every 250ms) in case the CDN loads after the listener was registered but before the flag check runs

Example layout:
```html
<!-- INLINE: registers listener during HTML parsing, before any defer runs -->
<script>
window._xxxReady = false;
window._xxxWaiters = [];
document.addEventListener('xxxloaded', function() {
    window._xxxReady = true;
    window._xxxWaiters.forEach(function(fn) { fn(); });
    window._xxxWaiters = [];
}, { once: true });
</script>
<script src="https://cdn.example.com/library.js" defer></script>
```

---

## Version Management

* Version is tracked in `_config.yml` under the `version` key
* Displayed in the site footer as `v1.1.z`
* MUST increment z by 1 on every git push, no exceptions
* Current version as of last update: 1.1.70

---

You are a project manager working on adding a chess engine to your website. Follow the following todo items and only move them into the completed section once we have verified that they are complete by testing them. 

Maintain maximum organization by adding a chess/ directory in the assets/js/ directory and keep separate and modular files, folders, and functions to be able to complete the entire project 

Completed:

"
* Set up chess/ directory structure in assets/js/
* Copied Stockfish 17.1 lite single-threaded engine to assets/js/chess/vendor/
* Created stockfish-engine.js wrapper for UCI protocol with continuous analysis support
* Created chess-analysis-controller.js integrating chess.js, chessboard.js, eval bar, and engine
* Created eval-bar.js component for real-time position evaluation display
* Created chess-analysis.css with modern, responsive styling
* Updated chess.html page at /chess/ with analysis mode and play mode
* Copied chess piece images to assets/img/chesspieces/wikipedia/
* Integrated loadEngine.js and chess.min.js libraries
* Built and verified site generation

Full chess analysis board implementation complete with:

ANALYSIS MODE:
- Real-time Stockfish 17 engine evaluation
- Visual evaluation bar showing position score
- Multi-PV analysis (3 lines) with move variations
- Continuous analysis updates as you move pieces
- Board orientation toggle
- Depth 20 analysis for strong play

PLAY MODE:
- Play against Stockfish 17 engine
- Adjustable engine strength (0-20 skill levels)
- Choose white or black
- Game controls: new game, undo moves, flip board
- Move validation and legal move highlighting

Technical features:
- Single-threaded Stockfish (GitHub Pages compatible, no CORS needed)
- Modular architecture with separate eval bar, engine, and controller components
- Responsive design with side-by-side analysis panel
- UCI protocol implementation with MultiPV support

GAME REPORT ANALYSIS (En Croissant-style):
- Move-by-move Stockfish analysis at depth 15
- Win chance calculation using Lichess formula: 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
- Accuracy calculation: 103.1668 * exp(-0.04354 * winChanceDiff) - 3.1669 + 1
- Move classification: Blunders (>20% loss), Mistakes (>10%), Dubious (>5%), Inaccuracies (>2%)
- Per-player statistics: average accuracy, counts by category
- Progress bar with real-time updates
- Color-coded stat cards for White and Black
- Modular scoring and generator components

Implementation files:
- game-report-scoring.js: mathematical functions for analysis
- game-report-generator.js: async analysis iteration engine
- Extended stockfish-engine.js with analyzePositionOnce method
- Extended chess-analysis-controller.js with report generation
- Report UI panel with progress tracking in chess.html
- Complete styling in chess-analysis.css
"


----------------------------------------------------------

Todo:

"
* Deploy and test chess page in production at /chess/
* Optional: Add Lichess OAuth integration for game import/export using LICHESS_KEY
* Optional: Add PGN import/export functionality
* Optional: Add opening book support
"