/**
 * Stockfish Engine Wrapper
 * Provides a clean interface to the Stockfish chess engine using UCI protocol
 */

(function(window) {
    'use strict';

    function StockfishEngine(options) {
        this.options = options || {};
        this.engine = null;
        this.ready = false;
        this.analyzing = false;
        this.callbacks = {};
        this.skillLevel = this.options.skillLevel || 10;
        this.depth = this.options.depth || 15;
    }

    StockfishEngine.prototype.init = function(callback) {
        var self = this;
        var enginePath = this.options.enginePath || '/assets/js/chess/vendor/stockfish-17.1-lite-single-03e3232.js';

        if (typeof loadEngine !== 'function') {
            console.error('loadEngine function not found. Make sure loadEngine.js is loaded first.');
            return;
        }

        this.engine = loadEngine(enginePath);

        this.engine.send('uci', function() {
            self.ready = true;
            self.engine.send('setoption name Skill Level value ' + self.skillLevel);
            self.engine.send('isready', function() {
                if (callback) callback();
            });
        });
    };

    StockfishEngine.prototype.setSkillLevel = function(level) {
        this.skillLevel = Math.max(0, Math.min(20, level));
        if (this.engine && this.ready) {
            this.engine.send('setoption name Skill Level value ' + this.skillLevel);
        }
    };

    StockfishEngine.prototype.getBestMove = function(fen, callback) {
        var self = this;
        if (!this.ready) {
            console.error('Engine not ready');
            return;
        }

        this.analyzing = true;

        this.engine.send('position fen ' + fen);
        this.engine.send('go depth ' + this.depth, function(result) {
            self.analyzing = false;
            var match = result.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
            if (match && callback) {
                callback(match[1]);
            }
        });
    };

    StockfishEngine.prototype.analyze = function(fen, callback, streamCallback) {
        var self = this;
        if (!this.ready) {
            console.error('Engine not ready');
            return;
        }

        this.analyzing = true;

        this.engine.stream = function(line) {
            if (streamCallback && line.indexOf('info') === 0) {
                var analysis = self.parseInfo(line);
                if (analysis) {
                    streamCallback(analysis);
                }
            }
        };

        this.engine.send('position fen ' + fen);
        this.engine.send('go depth ' + this.depth, function(result) {
            self.analyzing = false;
            self.engine.stream = null;

            var match = result.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
            if (match && callback) {
                callback(match[1]);
            }
        });
    };

    StockfishEngine.prototype.startContinuousAnalysis = function(fen, streamCallback, multipv) {
        var self = this;
        if (!this.ready) {
            console.error('Engine not ready');
            return;
        }

        this.analyzing = true;
        multipv = multipv || 3;

        this.engine.stream = function(line) {
            if (streamCallback && line.indexOf('info') === 0) {
                var analysis = self.parseInfo(line);
                if (analysis) {
                    streamCallback(analysis);
                }
            }
        };

        this.engine.send('setoption name MultiPV value ' + multipv);
        this.engine.send('position fen ' + fen);
        this.engine.send('go infinite');
    };

    StockfishEngine.prototype.stopContinuousAnalysis = function() {
        if (this.analyzing && this.engine) {
            this.engine.send('stop');
            this.analyzing = false;
            this.engine.stream = null;
        }
    };

    StockfishEngine.prototype.parseInfo = function(line) {
        var analysis = {multipv: 1};

        var multipvMatch = line.match(/multipv (\d+)/);
        if (multipvMatch) analysis.multipv = parseInt(multipvMatch[1], 10);

        var depthMatch = line.match(/depth (\d+)/);
        if (depthMatch) analysis.depth = parseInt(depthMatch[1], 10);

        var scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
        if (scoreMatch) {
            analysis.scoreType = scoreMatch[1];
            analysis.scoreValue = parseInt(scoreMatch[2], 10);

            if (scoreMatch[1] === 'cp') {
                analysis.score = scoreMatch[2] / 100.0;
            } else {
                analysis.score = 'Mate in ' + Math.abs(scoreMatch[2]);
            }
        }

        var pvMatch = line.match(/pv (.+)/);
        if (pvMatch) analysis.pv = pvMatch[1].split(' ');

        var nodesMatch = line.match(/nodes (\d+)/);
        if (nodesMatch) analysis.nodes = parseInt(nodesMatch[1], 10);

        return Object.keys(analysis).length > 1 ? analysis : null;
    };

    StockfishEngine.prototype.stop = function() {
        if (this.analyzing && this.engine) {
            this.engine.send('stop');
            this.analyzing = false;
        }
    };

    StockfishEngine.prototype.newGame = function() {
        if (this.engine && this.ready) {
            this.engine.send('ucinewgame');
            this.engine.send('isready');
        }
    };

    StockfishEngine.prototype.quit = function() {
        if (this.engine) {
            this.engine.quit();
            this.engine = null;
            this.ready = false;
        }
    };

    window.StockfishEngine = StockfishEngine;

})(window);
