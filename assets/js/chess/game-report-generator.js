(function() {
  'use strict';

  function GameReportGenerator(engine, game, board) {
    this.engine = engine;
    this.game = game;
    this.board = board;
    this.analysisDepth = 15; // Balance between speed and accuracy
  }

  GameReportGenerator.prototype.generateReport = function(progressCallback, completeCallback) {
    var self = this;
    var history = this.game.history({ verbose: true });

    if (history.length === 0) {
      if (completeCallback) {
        completeCallback({ error: 'No moves to analyze' });
      }
      return;
    }

    // Build list of positions to analyze
    // Each entry includes: before FEN, after FEN, move details
    var positions = [];

    // Starting position (before first move)
    var startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    positions.push({
      fen: startFEN,
      move: null,
      moveNumber: 0,
      color: 'white',
      isStartPosition: true
    });

    // Each move's position (analyze position AFTER the move)
    history.forEach(function(move, index) {
      positions.push({
        fen: move.after,
        beforeFen: move.before,
        move: move,
        moveNumber: Math.floor(index / 2) + 1,
        color: move.color === 'w' ? 'white' : 'black',
        from: move.from,
        to: move.to,
        san: move.san,
        isStartPosition: false
      });
    });

    var results = [];
    var index = 0;

    function analyzeNext() {
      if (index >= positions.length) {
        self.finishReport(results, completeCallback);
        return;
      }

      var pos = positions[index];

      // Update progress
      if (progressCallback) {
        progressCallback(index, positions.length);
      }

      // Visual board update
      if (self.board) {
        if (pos.isStartPosition) {
          // Set to starting position
          self.board.position(startFEN);
        } else {
          // Set position BEFORE move, then animate the move
          self.board.position(pos.beforeFen);

          // Small delay before animating move
          setTimeout(function() {
            if (pos.from && pos.to) {
              self.board.move(pos.from + '-' + pos.to);
            }
          }, 100);
        }
      }

      // Analyze this position
      self.engine.analyzePositionOnce(pos.fen, self.analysisDepth, function(analysis) {
        results.push({
          fen: pos.fen,
          move: pos.move,
          moveNumber: pos.moveNumber,
          color: pos.color,
          scoreType: analysis.scoreType,
          scoreValue: analysis.scoreValue,
          depth: analysis.depth,
          san: pos.san
        });

        index++;
        // Delay for visual feedback (200ms for move animation + 300ms pause)
        setTimeout(analyzeNext, 500);
      });
    }

    // Reset board to start position before beginning
    if (this.board) {
      this.board.position(startFEN);
    }

    // Start analysis after brief delay
    setTimeout(analyzeNext, 500);
  };

  GameReportGenerator.prototype.finishReport = function(results, callback) {
    if (!window.GameReportScoring) {
      console.error('GameReportScoring not loaded');
      if (callback) callback({ error: 'GameReportScoring not loaded' });
      return;
    }

    var scoring = window.GameReportScoring;
    var whiteAccuracies = [];
    var blackAccuracies = [];
    var whiteMoves = { blunders: 0, mistakes: 0, dubious: 0, inaccuracies: 0 };
    var blackMoves = { blunders: 0, mistakes: 0, dubious: 0, inaccuracies: 0 };

    // Analyze each move by comparing position before and after
    for (var i = 0; i < results.length - 1; i++) {
      var beforePos = results[i];
      var afterPos = results[i + 1];

      if (!afterPos.move) continue;

      // Convert scores to centipawns
      var beforeCP = scoring.scoreToCentipawns(beforePos.scoreType, beforePos.scoreValue);
      var afterCP = scoring.scoreToCentipawns(afterPos.scoreType, afterPos.scoreValue);

      // Adjust scores for player perspective
      // If it was white's turn, positive is good for white
      // If it was black's turn, flip the signs so positive is good for black
      var isWhiteTurn = (afterPos.color === 'white');
      if (!isWhiteTurn) {
        beforeCP = -beforeCP;
        afterCP = -afterCP;
      }

      // Calculate win chances
      var winChanceBefore = scoring.getWinChance(beforeCP);
      var winChanceAfter = scoring.getWinChance(afterCP);
      var winChanceLoss = Math.max(0, winChanceBefore - winChanceAfter);

      // Calculate accuracy
      var accuracy = scoring.getAccuracy(winChanceLoss);

      // Classify move
      var classification = scoring.classifyMove(winChanceLoss);

      // Store per-player statistics
      if (isWhiteTurn) {
        whiteAccuracies.push(accuracy);
        if (classification.label === 'Blunder') whiteMoves.blunders++;
        else if (classification.label === 'Mistake') whiteMoves.mistakes++;
        else if (classification.label === 'Dubious') whiteMoves.dubious++;
        else if (classification.label === 'Inaccuracy') whiteMoves.inaccuracies++;
      } else {
        blackAccuracies.push(accuracy);
        if (classification.label === 'Blunder') blackMoves.blunders++;
        else if (classification.label === 'Mistake') blackMoves.mistakes++;
        else if (classification.label === 'Dubious') blackMoves.dubious++;
        else if (classification.label === 'Inaccuracy') blackMoves.inaccuracies++;
      }

      // Store detailed move data
      afterPos.winChanceLoss = winChanceLoss;
      afterPos.accuracy = accuracy;
      afterPos.classification = classification;
    }

    // Calculate averages
    var calculateAverage = function(arr) {
      if (arr.length === 0) return 0;
      var sum = arr.reduce(function(a, b) { return a + b; }, 0);
      return Math.round(sum / arr.length * 10) / 10;
    };

    var report = {
      white: {
        averageAccuracy: calculateAverage(whiteAccuracies),
        blunders: whiteMoves.blunders,
        mistakes: whiteMoves.mistakes,
        dubious: whiteMoves.dubious,
        inaccuracies: whiteMoves.inaccuracies,
        totalMoves: whiteAccuracies.length
      },
      black: {
        averageAccuracy: calculateAverage(blackAccuracies),
        blunders: blackMoves.blunders,
        mistakes: blackMoves.mistakes,
        dubious: blackMoves.dubious,
        inaccuracies: blackMoves.inaccuracies,
        totalMoves: blackAccuracies.length
      },
      moves: results
    };

    if (callback) {
      callback(report);
    }
  };

  // Export for use in other modules
  if (typeof window !== 'undefined') {
    window.GameReportGenerator = GameReportGenerator;
  }
})();
