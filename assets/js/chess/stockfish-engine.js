/**
 * Stockfish Engine Wrapper
 * Provides a clean interface to the Stockfish chess engine using UCI protocol
 */

(function(window) {
    'use strict';

    function StockfishEngine(options) {
        if (window.__stockfishInstance) {
            console.log('Returning existing Stockfish instance');
            return window.__stockfishInstance;
        }

        this.options = options || {};
        this.engine = null;
        this.ready = false;
        this.analyzing = false;
        this.callbacks = {};
        this.skillLevel = this.options.skillLevel || 10;
        this.depth = this.options.depth || 15;

        window.__stockfishInstance = this;
    }

    StockfishEngine.prototype.init = function(callback) {
        var self = this;

        if (this.ready && this.engine) {
            console.log('Engine already initialized');
            if (callback) callback();
            return;
        }

        if (this.engine && !this.ready) {
            console.log('Engine initialization in progress, waiting...');
            setTimeout(function() {
                self.init(callback);
            }, 100);
            return;
        }

        var enginePath = this.options.enginePath || '/assets/js/chess/vendor/stockfish-17.1-lite-single-03e3232.js';
        console.log('[DEBUG] Loading Stockfish engine from:', enginePath);
        console.log('[DEBUG] Expected WASM file:', enginePath.replace('.js', '.wasm'));

        if (typeof loadEngine !== 'function') {
            console.error('[ERROR] loadEngine function not found. Make sure loadEngine.js is loaded first.');
            return;
        }

        console.log('[DEBUG] Initializing Stockfish engine...');

        try {
            this.engine = loadEngine(enginePath);
            console.log('[DEBUG] Engine object created:', this.engine);

            // Add error handler for Worker
            if (this.engine && this.engine.worker) {
                console.log('[DEBUG] Adding error handler to Worker');
                this.engine.worker.onerror = function(error) {
                    console.error('[ERROR] Stockfish Worker error:', error);
                    console.error('[ERROR] Error message:', error.message);
                    console.error('[ERROR] Error filename:', error.filename);
                    console.error('[ERROR] Error line:', error.lineno);
                };
            }
        } catch (e) {
            console.error('[ERROR] Failed to create engine:', e);
            return;
        }

        this.engine.send('uci', function() {
            console.log('[DEBUG] Engine UCI ready - engine is communicating');
            self.ready = true;
            self.engine.send('setoption name Skill Level value ' + self.skillLevel);
            console.log('[DEBUG] Set skill level to:', self.skillLevel);
            self.engine.send('isready', function() {
                console.log('[DEBUG] Engine fully ready and initialized');
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

        this.ensureStopped().then(function() {
            self.analyzing = true;

            self.engine.send('position fen ' + fen);
            self.engine.send('go depth ' + self.depth, function(result) {
                self.analyzing = false;
                var match = result.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
                if (match && callback) {
                    callback(match[1]);
                }
            });
        });
    };

    StockfishEngine.prototype.analyze = function(fen, callback, streamCallback) {
        var self = this;
        if (!this.ready) {
            console.error('Engine not ready');
            return;
        }

        this.ensureStopped().then(function() {
            self.analyzing = true;

            self.engine.stream = function(line) {
                if (streamCallback && line.indexOf('info') === 0) {
                    var analysis = self.parseInfo(line);
                    if (analysis) {
                        streamCallback(analysis);
                    }
                }
            };

            self.engine.send('position fen ' + fen);
            self.engine.send('go depth ' + self.depth, function(result) {
                self.analyzing = false;
                self.engine.stream = null;

                var match = result.match(/bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
                if (match && callback) {
                    callback(match[1]);
                }
            });
        });
    };

    StockfishEngine.prototype.analyzePositionOnce = function(fen, depth, callback) {
        var self = this;
        if (!this.ready) {
            console.error('Engine not ready');
            return;
        }

        this.ensureStopped().then(function() {
            self.analyzing = true;
            var lastAnalysis = null;

            self.engine.stream = function(line) {
                if (line.indexOf('info') === 0) {
                    var analysis = self.parseInfo(line);
                    if (analysis && analysis.scoreType) {
                        lastAnalysis = analysis;
                    }
                }
            };

            self.engine.send('position fen ' + fen);
            self.engine.send('go depth ' + depth, function(result) {
                self.analyzing = false;
                self.engine.stream = null;

                if (callback && lastAnalysis) {
                    callback(lastAnalysis);
                } else if (callback) {
                    callback({ scoreType: 'cp', scoreValue: 0, depth: depth });
                }
            });
        });
    };

    StockfishEngine.prototype.startContinuousAnalysis = function(fen, streamCallback, multipv) {
        var self = this;
        if (!this.ready) {
            console.error('Engine not ready');
            return;
        }

        this.ensureStopped().then(function() {
            self.analyzing = true;
            multipv = multipv || 3;

            self.engine.stream = function(line) {
                if (streamCallback && line.indexOf('info') === 0) {
                    var analysis = self.parseInfo(line);
                    if (analysis) {
                        streamCallback(analysis);
                    }
                }
            };

            self.engine.send('setoption name MultiPV value ' + multipv);
            self.engine.send('position fen ' + fen);
            self.engine.send('go infinite');
        });
    };

    StockfishEngine.prototype.stopContinuousAnalysis = function() {
        if (this.analyzing && this.engine) {
            this.engine.send('stop');
            this.analyzing = false;
            this.engine.stream = null;
        }
    };

    StockfishEngine.prototype.ensureStopped = function() {
        var self = this;
        return new Promise(function(resolve) {
            if (!self.analyzing) {
                resolve();
                return;
            }

            self.engine.send('stop');
            self.analyzing = false;
            self.engine.stream = null;

            setTimeout(function() {
                resolve();
            }, 50);
        });
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
            this.stop();
            this.engine.quit();
            this.engine = null;
            this.ready = false;
            this.analyzing = false;
            window.__stockfishInstance = null;
        }
    };

    window.StockfishEngine = StockfishEngine;

})(window);
