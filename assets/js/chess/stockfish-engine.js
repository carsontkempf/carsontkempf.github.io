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
        this._sessionMaxSeldepth = 0;
        this._activeGoDepth = 0;
        this._stdoutCircBuf = [];
        this._analysisHistory = [];

        window.__stockfishInstance = this;
    }

    StockfishEngine.prototype.init = function(callback) {
        var self = this;
        console.log('[ENGINE-DIAGNOSTIC] [INIT-START] StockfishEngine Setup');

        // Verify WASM file availability and headers
        // Use versioned filename to avoid 404s
        var wasmPath = '/assets/js/chess/vendor/stockfish-17.1-lite-single-03e3232.wasm';
        
        fetch(wasmPath, { method: 'HEAD' })
            .then(function(response) {
                if (!response.ok) {
                    console.warn('[ENGINE-DIAGNOSTIC] [NETWORK-WARN] Versioned WASM 404, trying fallback...');
                    wasmPath = '/assets/js/chess/vendor/stockfish.wasm';
                    return fetch(wasmPath, { method: 'HEAD' });
                }
                return response;
            })
            .then(function(response) {
                console.log('[ENGINE-DIAGNOSTIC] [NETWORK-CHECK] WASM File:', wasmPath);
                console.log('[ENGINE-DIAGNOSTIC]   - Status:', response.status, response.statusText);
                console.log('[ENGINE-DIAGNOSTIC]   - Content-Type:', response.headers.get('Content-Type'));
                var size = response.headers.get('Content-Length');
                if (size) {
                    console.log('[ENGINE-DIAGNOSTIC]   - Content-Length:', (parseInt(size) / 1048576).toFixed(2) + ' MB');
                }
            })
            .catch(function(err) {
                console.warn('[ENGINE-DIAGNOSTIC] [NETWORK-CHECK] Could not probe WASM headers:', err.message);
            });

        if (this.ready && this.engine) {
            console.log('[ENGINE-DIAGNOSTIC] [INIT-SKIP] Engine already initialized and ready');
            if (callback) callback();
            return;
        }

        // Detection for WASM SIMD support
        var hasSimd = (function() {
            try {
                if (typeof WebAssembly !== 'object' || typeof WebAssembly.validate !== 'function') return false;
                // SIMD-specific instruction: v128.load
                var result = WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 23, 1, 21, 0, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 26, 11]));
                console.log('[ENGINE-DIAGNOSTIC] [FEATURE-CHECK] WASM SIMD Support:', result);
                return result;
            } catch (e) {
                console.error('[ENGINE-DIAGNOSTIC] [FEATURE-CHECK] Error checking SIMD:', e);
                return false;
            }
        })();

        if (!hasSimd) {
            console.warn('[ENGINE-DIAGNOSTIC] [WARN] Browser WASM SIMD not supported. Stockfish requires a modern browser (Chrome 91+, Firefox 89+, Safari 16.4+).');
            self.error = true;
            self.simdUnsupported = true;
            self.simdErrorMessage = 'Chess engine requires a modern browser. Please update your browser to use the AI opponent.';
            if (callback) callback();
            return;
        }

        if (this.engine && !this.ready) {
            console.log('[ENGINE-DIAGNOSTIC] [INIT-WAIT] Engine initialization in progress, waiting...');
            setTimeout(function() {
                self.init(callback);
            }, 100);
            return;
        }

        var enginePath = this.options.enginePath || '/assets/js/chess/vendor/stockfish-17.1-lite-single-03e3232.js';
        console.log('[ENGINE-DIAGNOSTIC] [LOAD] Loading Stockfish engine from:', enginePath);

        if (typeof loadEngine !== 'function') {
            console.error('[ENGINE-DIAGNOSTIC] [FATAL] loadEngine function not found. Verify loadEngine.js is loaded before stockfish-engine.js.');
            return;
        }

        try {
            console.log('[ENGINE-DIAGNOSTIC] [CREATING] Calling loadEngine()...');
            this.engine = loadEngine(enginePath);
            console.log('[ENGINE-DIAGNOSTIC] [CREATED] Engine instance created successfully');

            this.engine.onerror = function(error) {
                self._crashCount = (self._crashCount || 0) + 1;
                var crashedAtDepth = self._maxDepthReached || 0;
                var targetDepth = self._analysisMaxDepth || 12;
                var crashedMultiPV = self._analysisMultiPV || 3;

                console.error('[ENGINE-DIAGNOSTIC] [CRASH #' + self._crashCount + '] Stockfish failure');
                console.error('[ENGINE-DIAGNOSTIC]   - crash #:', self._crashCount);
                console.error('[ENGINE-DIAGNOSTIC]   - phase:', self._enginePhase || 'unknown');
                console.error('[ENGINE-DIAGNOSTIC]   - depth at crash: reached=' + crashedAtDepth + ' / target=' + targetDepth);
                console.error('[ENGINE-DIAGNOSTIC]   - seldepth this search:', self._maxSeldepthReached || 0, '(resets each search)');
                console.error('[ENGINE-DIAGNOSTIC]   - seldepth session max:', self._sessionMaxSeldepth || 0, '(never resets)');
                console.error('[ENGINE-DIAGNOSTIC]   - activeGoDepth:', self._activeGoDepth || 0);
                console.error('[ENGINE-DIAGNOSTIC]   - MultiPV at crash:', crashedMultiPV);
                console.error('[ENGINE-DIAGNOSTIC]   - FEN:', self._lastFen || 'none');
                console.error('[ENGINE-DIAGNOSTIC]   - SIMD gate:', window.__diagSimdCheck);
                console.error('[ENGINE-DIAGNOSTIC]   - error:', error && error.message);
                try {
                    var mem = window.performance && window.performance.memory;
                    if (mem) console.error('[ENGINE-DIAGNOSTIC]   - heap used/limit (MB):', Math.round(mem.usedJSHeapSize/1048576), '/', Math.round(mem.jsHeapSizeLimit/1048576));
                } catch (_) {}
                console.error('[ENGINE-DIAGNOSTIC]   - analysisHistory:', JSON.stringify(self._analysisHistory || []));
                console.error('[ENGINE-DIAGNOSTIC]   - stdoutCircBuf:', JSON.stringify(self._stdoutCircBuf || []));

                // Adaptive recovery strategy
                if (self._crashCount === 1) {
                    self._analysisMaxDepth = Math.max(6, crashedAtDepth > 0 ? crashedAtDepth - 2 : 10);
                    self._analysisMultiPV = 1;
                    self._recovering = true;
                    console.log('[ENGINE-DIAGNOSTIC] [RECOVERY #1] Reducing depth to ' + self._analysisMaxDepth + ', MultiPV to 1, re-init...');
                } else if (self._crashCount === 2) {
                    self._analysisMaxDepth = Math.max(4, (self._analysisMaxDepth || 8) - 3);
                    self._analysisMultiPV = 1;
                    self._recovering = true;
                    console.log('[ENGINE-DIAGNOSTIC] [RECOVERY #2] Reducing depth to ' + self._analysisMaxDepth + ', re-init...');
                } else {
                    console.error('[ENGINE-DIAGNOSTIC] [RECOVERY-FAILED] 3 crashes — disabling analysis engine');
                    self.ready = false;
                    self.error = true;
                    self.simdUnsupported = true;
                    if (self.onEngineError) self.onEngineError(error);
                    return;
                }

                // Tear down crashed engine cleanly
                var oldEngine = self.engine;
                self.engine = null;
                self.ready = false;
                self.error = false;
                self.analyzing = false;
                try { if (oldEngine && oldEngine.quit) oldEngine.quit(); } catch (_) {}

                // Capture recovery targets before async
                var recoveryFen = self._analysisFen;
                var recoveryCallback = self._analysisCallback;
                var recoveryMultiPV = self._analysisMultiPV;

                setTimeout(function() {
                    console.log('[ENGINE-DIAGNOSTIC] [RECOVERY] Re-initializing engine (depth=' + self._analysisMaxDepth + ' multipv=' + recoveryMultiPV + ')...');
                    self.init(function() {
                        console.log('[ENGINE-DIAGNOSTIC] [RECOVERY] Engine ready, restarting analysis');
                        if (recoveryFen && recoveryCallback) {
                            self.startContinuousAnalysis(recoveryFen, recoveryCallback, recoveryMultiPV);
                        }
                    });
                }, 1000);

                if (self.onEngineError) self.onEngineError(error);
            };
        } catch (e) {
            console.error('[ENGINE-DIAGNOSTIC] [FATAL] Exception during engine creation:', e);
            return;
        }

        self._setPhase = function(p) {
            console.log('[ENGINE-DIAGNOSTIC] [PHASE] ' + (self._enginePhase || 'none') + ' → ' + p);
            self._enginePhase = p;
        };
        self._setPhase('uci-init');
        console.log('[ENGINE-DIAGNOSTIC] [UCI-INIT] Sending "uci" command');
        this.engine.send('uci', function() {
            console.log('[ENGINE-DIAGNOSTIC] [UCI-READY] Engine responded to "uci"');
            self._setPhase('ready');
            self.ready = true;

            console.log('[ENGINE-DIAGNOSTIC] [CONFIG] Applying memory-safe defaults (Hash=16, Threads=1)');
            self.engine.send('setoption name Hash value 16');
            self.engine.send('setoption name Threads value 1');
            self.engine.send('setoption name Skill Level value ' + self.skillLevel);

            self.engine.send('isready', function() {
                console.log('[ENGINE-DIAGNOSTIC] [READY] Engine fully initialized and ready');
                self._recovering = false;
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
            self._lastFen = fen;
            self._maxDepthReached = 0;
            self._maxSeldepthReached = 0;
            if (self._setPhase) self._setPhase('analyzing-bestmove');
            console.log('[ENGINE-DIAGNOSTIC] [BESTMOVE-START] depth=' + self.depth + ' FEN:', fen);

            var safeDepth = Math.min(self.depth, 12);
            console.warn('[ENGINE-DIAGNOSTIC] [BESTMOVE-GO] depth=' + safeDepth + (self.depth > 12 ? ' (capped from ' + self.depth + ')' : ''));
            self.engine.send('position fen ' + fen);
            self.engine.send('go depth ' + safeDepth, function(result) {
                console.log('[ENGINE-DIAGNOSTIC] [BESTMOVE-COMPLETE] maxDepth=' + self._maxDepthReached + ' maxSeldepth=' + self._maxSeldepthReached);
                self.analyzing = false;
                if (self._setPhase) self._setPhase('ready');
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
        if (!this.ready || this.error) {
            console.error('Engine not ready or in error state');
            if (callback) {
                callback({ scoreType: 'error', scoreValue: 0, depth: 0, error: 'Engine unavailable' });
            }
            return;
        }

        this.ensureStopped().then(function() {
            self.analyzing = true;
            var lastAnalysis = null;
            var timeoutId = setTimeout(function() {
                if (self.analyzing) {
                    console.warn('[WARN] Analysis timeout for FEN:', fen);
                    self.analyzing = false;
                    if (callback) callback({ scoreType: 'error', scoreValue: 0, depth: depth, error: 'Timeout' });
                }
            }, 10000); // 10s timeout

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
                clearTimeout(timeoutId);
                if (!self.analyzing) return; // Already timed out

                self.analyzing = false;
                self.engine.stream = null;

                if (callback && lastAnalysis) {
                    callback(lastAnalysis);
                } else if (callback) {
                    callback({ scoreType: 'error', scoreValue: 0, depth: depth, error: 'No analysis returned' });
                }
            });
        });
    };

    StockfishEngine.prototype.startContinuousAnalysis = function(fen, streamCallback, multipv) {
        var self = this;
        if (!this.ready) {
            console.error('[ENGINE-DIAGNOSTIC] startContinuousAnalysis: engine not ready');
            return;
        }

        // Initialize adaptive depth on first call only — preserved across recovery re-inits
        if (self._analysisMaxDepth === undefined) self._analysisMaxDepth = 4;
        if (self._analysisMaxDepth > 8) self._analysisMaxDepth = 8; // ceiling: seldepth stays ~12-16 at depth 8, safe below WASM crash threshold
        multipv = multipv || 1;

        // Store for crash recovery
        self._analysisFen = fen;
        self._analysisCallback = streamCallback;
        self._analysisMultiPV = multipv;

        this.ensureStopped().then(function() {
            if (!self.ready) return; // crashed during ensureStopped

            self.analyzing = true;
            self._lastFen = fen;
            if (self._setPhase) self._setPhase('analyzing-continuous');
            self._maxDepthReached = 0;
            self._maxSeldepthReached = 0;

            var targetDepth = self._analysisMaxDepth;
            var thisMPV = self._analysisMultiPV;

            console.log('[ENGINE-DIAGNOSTIC] [ANALYSIS-LOOP] search start: depth=' + targetDepth + ' multipv=' + thisMPV);

            self.engine.stream = function(line) {
                self._stdoutCircBuf.push(line);
                if (self._stdoutCircBuf.length > 20) self._stdoutCircBuf.shift();

                if (line.indexOf('info') === 0) {
                    var analysis = self.parseInfo(line);
                    if (analysis) {
                        if (analysis.depth && analysis.depth > (self._maxDepthReached || 0)) {
                            self._maxDepthReached = analysis.depth;
                        }
                        if (analysis.seldepth && analysis.seldepth > (self._maxSeldepthReached || 0)) {
                            self._maxSeldepthReached = analysis.seldepth;
                        }
                        if (analysis.seldepth && analysis.seldepth > (self._sessionMaxSeldepth || 0)) {
                            self._sessionMaxSeldepth = analysis.seldepth;
                        }
                        if (analysis.depth && analysis.seldepth) {
                            self._analysisHistory.push({ depth: analysis.depth, seldepth: analysis.seldepth, ms: Date.now() });
                            if (self._analysisHistory.length > 10) self._analysisHistory.shift();
                        }
                        if (streamCallback) streamCallback(analysis);
                    }
                }
            };

            self.engine.send('setoption name MultiPV value ' + thisMPV);
            self.engine.send('position fen ' + fen);
            self._activeGoDepth = targetDepth;
            self.engine.send('go depth ' + targetDepth, function() {
                if (!self.analyzing) return; // stopped externally

                // Depth completed cleanly — ratchet up
                var prev = self._analysisMaxDepth;
                self._analysisMaxDepth = Math.min(8, prev + 1);
                console.log('[ENGINE-DIAGNOSTIC] [ANALYSIS-LOOP] depth ' + prev + ' seldepth=' + (self._maxSeldepthReached || 0) + ' complete, next: ' + self._analysisMaxDepth);
                self._maxSeldepthReached = 0;

                // Loop: restart at same FEN with incremented depth
                if (self._analysisFen === fen) {
                    self.startContinuousAnalysis(fen, streamCallback, thisMPV);
                }
            });
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

        var seldepthMatch = line.match(/seldepth (\d+)/);
        if (seldepthMatch) analysis.seldepth = parseInt(seldepthMatch[1], 10);

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

        var npsMatch = line.match(/nps (\d+)/);
        if (npsMatch) analysis.nps = parseInt(npsMatch[1], 10);

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
