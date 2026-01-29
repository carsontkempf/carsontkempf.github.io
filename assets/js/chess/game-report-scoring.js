(function() {
  'use strict';

  var GameReportScoring = {
    // Calculate win chance percentage from centipawn evaluation
    // Formula from En Croissant / Lichess analysis
    // Returns value between 0-100
    getWinChance: function(centipawns) {
      return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);
    },

    // Calculate accuracy from win chance differential
    // winChanceDiff: difference in win % before and after move (positive = worse position)
    // Returns value between 0-100
    getAccuracy: function(winChanceDiff) {
      if (winChanceDiff < 0) winChanceDiff = 0;
      var accuracy = 103.1668 * Math.exp(-0.04354 * winChanceDiff) - 3.1669 + 1;
      return Math.min(100, Math.max(0, accuracy));
    },

    // Classify move based on win chance loss
    // Returns object with symbol, label, and css class
    classifyMove: function(winChanceLoss) {
      if (winChanceLoss > 20) {
        return { symbol: '??', label: 'Blunder', class: 'blunder' };
      }
      if (winChanceLoss > 10) {
        return { symbol: '?', label: 'Mistake', class: 'mistake' };
      }
      if (winChanceLoss > 5) {
        return { symbol: '?!', label: 'Dubious', class: 'dubious' };
      }
      if (winChanceLoss > 2) {
        return { symbol: '?!', label: 'Inaccuracy', class: 'inaccuracy' };
      }
      // Good moves
      if (winChanceLoss < 0.5) {
        return { symbol: '', label: 'Best', class: 'best' };
      }
      return { symbol: '', label: 'Good', class: 'good' };
    },

    // Convert score to centipawns for win chance calculation
    // Handles both cp and mate scores
    scoreToCentipawns: function(scoreType, scoreValue) {
      if (scoreType === 'cp') {
        return scoreValue;
      }
      if (scoreType === 'mate') {
        // Treat mate as very high centipawn value
        // Positive mate = winning, negative = losing
        return scoreValue > 0 ? 2000 : -2000;
      }
      return 0;
    },

    // Format score for display
    formatScore: function(scoreType, scoreValue) {
      if (scoreType === 'mate') {
        return 'M' + Math.abs(scoreValue);
      }
      if (scoreType === 'cp') {
        var pawns = (scoreValue / 100).toFixed(2);
        return (scoreValue > 0 ? '+' : '') + pawns;
      }
      return '0.00';
    }
  };

  // Export for use in other modules
  if (typeof window !== 'undefined') {
    window.GameReportScoring = GameReportScoring;
  }
})();
