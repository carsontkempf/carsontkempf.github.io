/**
 * Chess Analysis Controller
 * Extends ChessController with analysis mode capabilities
 */

(function(window) {
    'use strict';

    function ChessAnalysisController(options) {
        this.options = options || {};
        this.boardElement = this.options.boardElement || 'chess-board';
        this.statusElement = this.options.statusElement || 'game-status';
        this.evalBarElement = this.options.evalBarElement || 'eval-bar';
        this.analysisElement = this.options.analysisElement || 'analysis-panel';

        this.game = null;
        this.board = null;
        this.engine = null;
        this.evalBar = null;

        this.playerColor = this.options.playerColor || 'white';
        this.mode = this.options.mode || 'play';
        this.analysisLines = [];
        this.lastAnalysisScore = null;
        this.currentReport = null;
        this.selectedSquare = null;
        this.lastMove = null;

        // Live analysis tracking
        this.moveHistory = [];
        this.liveStats = {
            white: { totalMoves: 0, totalAccuracy: 0, blunders: 0, mistakes: 0, dubious: 0, inaccuracies: 0 },
            black: { totalMoves: 0, totalAccuracy: 0, blunders: 0, mistakes: 0, dubious: 0, inaccuracies: 0 }
        };
        this.beforeMoveScore = null;
        this.waitingForAnalysis = false;
    }

    ChessAnalysisController.prototype.init = function() {
        var self = this;

        this.game = new Chess();

        var boardConfig = {
            draggable: true,
            position: 'start',
            onDragStart: function(source, piece, position, orientation) {
                return self.onDragStart(source, piece, position, orientation);
            },
            onDrop: function(source, target) {
                return self.onDrop(source, target);
            },
            onSnapEnd: function() {
                // For special moves (castling, en passant), sync the board
                // Regular moves are already visually correct from drag-and-drop
                if (self.lastMove) {
                    var flags = self.lastMove.flags;
                    // k = kingside castle, q = queenside castle, e = en passant
                    if (flags.indexOf('k') !== -1 || flags.indexOf('q') !== -1 || flags.indexOf('e') !== -1) {
                        self.board.position(self.game.fen(), false);
                    }
                    self.lastMove = null;
                }
            },
            onSquareClick: function(square) {
                console.log('Square clicked:', square);
                self.onSquareClick(square);
            },
            pieceTheme: this.options.pieceTheme || '/assets/img/chesspieces/wikipedia/{piece}.png',
            snapSpeed: 100,
            moveSpeed: 200,
            appearSpeed: 200,
            sparePieces: false,
            dropOffBoard: 'snapback'
        };

        if (this.playerColor === 'black') {
            boardConfig.orientation = 'black';
        }

        // Use Chessboard.js for the main visual board
        console.log('Initializing Chessboard with element:', this.boardElement);
        if (typeof Chessboard === 'undefined') {
            console.error('[FATAL] Chessboard.js not loaded');
            return;
        }
        this.board = Chessboard(this.boardElement, boardConfig);
        console.log('Chessboard initialized:', this.board);

        // Note: Using onSquareClick config instead of manual event listeners

        this.evalBar = new EvalBar(this.evalBarElement, {
            orientation: this.playerColor
        });

        this.engine = new StockfishEngine({
            skillLevel: this.options.skillLevel || 10,
            depth: this.options.depth || 15
        });

        this.engine.onEngineError = function(error) {
            console.error('[CONTROLLER] Engine error detected:', error);
            var msg = 'The chess engine (Stockfish) failed to load. ';
            if (error && error.message && error.message.indexOf('unreachable') !== -1) {
                msg += 'This is likely due to WASM SIMD incompatibility or a memory limit in your browser. Try using the latest version of Chrome or Firefox.';
            } else {
                msg += 'This usually means your browser does not support WASM SIMD, or the engine file was blocked.';
            }
            self.updateStatus('Engine Error: ' + msg);
            if (self.evalBar) {
                self.evalBar.setScore(0);
            }
        };

        this.engine.init(function() {
            console.log('[ENGINE-DIAGNOSTIC] [ENGINE-INIT-CB] engine.init callback fired');
            console.log('[ENGINE-DIAGNOSTIC] [ENGINE-INIT-CB] engine.ready:', self.engine.ready);
            console.log('[ENGINE-DIAGNOSTIC] [ENGINE-INIT-CB] engine.error:', self.engine.error);
            console.log('[ENGINE-DIAGNOSTIC] [ENGINE-INIT-CB] engine.simdUnsupported:', self.engine.simdUnsupported);
            console.log('[ENGINE-DIAGNOSTIC] [ENGINE-INIT-CB] mode:', self.mode, 'playerColor:', self.playerColor, 'turn:', self.game.turn());
            self.updateStatus();

            if (self.mode === 'analysis') {
                self.startAnalysis();
            } else if (self.playerColor === 'black' && self.game.turn() === 'w') {
                self.makeEngineMove();
            }
        });

        this.setupControls();
    };

    ChessAnalysisController.prototype.setupBoardClickHandlers = function() {
        var self = this;
        var boardEl = document.getElementById(this.boardElement);

        if (!boardEl) return;

        boardEl.addEventListener('click', function(e) {
            var square = e.target;

            while (square && square !== boardEl) {
                var classes = square.className || '';
                if (typeof classes === 'string' && classes.indexOf('square-') !== -1) {
                    var squareMatch = classes.match(/square-([a-h][1-8])/);
                    if (squareMatch) {
                        self.onSquareClick(squareMatch[1]);
                        return;
                    }
                }
                square = square.parentNode;
            }
        });
    };

    ChessAnalysisController.prototype.onDragStart = function(source, piece, position, orientation) {
        if (this.game.game_over()) return false;

        if (this.mode === 'play') {
            if ((this.playerColor === 'white' && piece.search(/^b/) !== -1) ||
                (this.playerColor === 'black' && piece.search(/^w/) !== -1)) {
                return false;
            }
        }

        if ((this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }
    };

    ChessAnalysisController.prototype.onDrop = function(source, target) {
        // Clear any click-to-select state when dragging
        this.removeHighlights();
        this.selectedSquare = null;

        // Store evaluation before move
        if (this.lastAnalysisScore) {
            this.beforeMoveScore = {
                scoreType: this.lastAnalysisScore.scoreType,
                scoreValue: this.lastAnalysisScore.scoreValue
            };
        }

        var move = this.game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        // Snapback if illegal move
        if (move === null) return 'snapback';

        // Store last move to check for special cases in onSnapEnd
        this.lastMove = move;

        this.updateStatus();

        if (this.mode === 'analysis') {
            this.waitingForAnalysis = true;
            this.startAnalysis();
        } else if (!this.game.game_over()) {
            // In play mode, briefly analyze to capture move quality
            this.waitingForAnalysis = true;
            this.startAnalysis();

            var self = this;
            window.setTimeout(function() {
                self.makeEngineMove();
            }, 250);
        }
    };

    ChessAnalysisController.prototype.onSquareClick = function(square) {
        var self = this;

        if (this.game.game_over()) return;

        var piece = this.game.get(square);

        // First click: selecting a piece to move
        if (this.selectedSquare === null) {
            // Must click on a piece
            if (!piece) return;

            // In play mode, must be your color
            if (this.mode === 'play') {
                if ((this.playerColor === 'white' && piece.color === 'b') ||
                    (this.playerColor === 'black' && piece.color === 'w')) {
                    return;
                }
            }

            // Must be current player's turn
            if (piece.color !== this.game.turn()) return;

            // Select this piece
            this.selectedSquare = square;
            this.highlightValidMoves(square);
            return;
        }

        // Second click: attempting to move selected piece

        // Store evaluation before move
        if (this.lastAnalysisScore) {
            this.beforeMoveScore = {
                scoreType: this.lastAnalysisScore.scoreType,
                scoreValue: this.lastAnalysisScore.scoreValue
            };
        }

        var move = this.game.move({
            from: this.selectedSquare,
            to: square,
            promotion: 'q'
        });

        // If illegal move
        if (move === null) {
            // If clicked another of own pieces, switch selection
            if (piece && piece.color === this.game.turn()) {
                this.removeHighlights();
                this.selectedSquare = square;
                this.highlightValidMoves(square);
            } else {
                // Clicked invalid target, deselect
                this.removeHighlights();
                this.selectedSquare = null;
            }
            return;
        }

        // If legal move, animate the piece using move() method
        this.board.move(this.selectedSquare + '-' + square);

        // For special moves (castling, en passant), sync the full board state
        if (move.flags.indexOf('k') !== -1 || move.flags.indexOf('q') !== -1 || move.flags.indexOf('e') !== -1) {
            // Use setTimeout to sync after the move animation
            var self = this;
            setTimeout(function() {
                self.board.position(self.game.fen(), false);
            }, 250);
        }

        this.removeHighlights();
        this.selectedSquare = null;
        this.updateStatus();

        if (this.mode === 'analysis') {
            this.waitingForAnalysis = true;
            this.startAnalysis();
        } else if (!this.game.game_over()) {
            // In play mode, briefly analyze to capture move quality
            this.waitingForAnalysis = true;
            this.startAnalysis();

            window.setTimeout(function() {
                self.makeEngineMove();
            }, 250);
        }
    };

    ChessAnalysisController.prototype.highlightValidMoves = function(square) {
        this.removeHighlights();

        var moves = this.game.moves({
            square: square,
            verbose: true
        });

        if (moves.length === 0) return;

        var boardEl = document.getElementById(this.boardElement);
        if (!boardEl) return;

        var selectedSquareEl = boardEl.querySelector('.square-' + square);
        if (selectedSquareEl) {
            selectedSquareEl.classList.add('highlight-selected');
        }

        for (var i = 0; i < moves.length; i++) {
            var targetSquare = moves[i].to;
            var targetSquareEl = boardEl.querySelector('.square-' + targetSquare);
            if (targetSquareEl) {
                targetSquareEl.classList.add('highlight-valid-move');
            }
        }
    };

    ChessAnalysisController.prototype.removeHighlights = function() {
        var boardEl = document.getElementById(this.boardElement);
        if (!boardEl) return;

        var highlighted = boardEl.querySelectorAll('.highlight-selected, .highlight-valid-move');
        for (var i = 0; i < highlighted.length; i++) {
            highlighted[i].classList.remove('highlight-selected', 'highlight-valid-move');
        }
    };

    ChessAnalysisController.prototype.makeEngineMove = function() {
        var self = this;
        var fen = this.game.fen();

        var engineReady = !!(this.engine && this.engine.ready);
        var simdBlocked = !!(this.engine && this.engine.simdUnsupported);
        console.log('[ENGINE-DIAGNOSTIC] [MOVE-REQUEST] makeEngineMove() called');
        console.log('[ENGINE-DIAGNOSTIC] [MOVE-REQUEST] engine exists:', !!this.engine);
        console.log('[ENGINE-DIAGNOSTIC] [MOVE-REQUEST] engine.ready:', engineReady);
        console.log('[ENGINE-DIAGNOSTIC] [MOVE-REQUEST] engine.simdUnsupported:', simdBlocked);
        console.log('[ENGINE-DIAGNOSTIC] [MOVE-REQUEST] FEN:', fen);

        if (!engineReady || simdBlocked) {
            var msg = (this.engine && this.engine.simdErrorMessage) || 'Chess engine unavailable. Please update your browser.';
            console.warn('[ENGINE-DIAGNOSTIC] [MOVE-ROUTE] Stockfish unavailable:', msg);
            this.setStatus(msg);
            return;
        }

        console.log('[ENGINE-DIAGNOSTIC] [MOVE-ROUTE] Using local Stockfish engine');
        this.setStatus('Engine thinking...');

        this.engine.getBestMove(fen, function(bestMove) {
            console.log('[ENGINE-DIAGNOSTIC] [STOCKFISH-RESULT] bestMove:', bestMove);
            if (!bestMove) {
                console.warn('[ENGINE-DIAGNOSTIC] [STOCKFISH-NULL] Engine returned no move');
                self.updateStatus();
                return;
            }

            var from = bestMove.substring(0, 2);
            var to = bestMove.substring(2, 4);
            var promotion = bestMove.length > 4 ? bestMove.substring(4) : undefined;

            console.log('[ENGINE-DIAGNOSTIC] [STOCKFISH-APPLY] from:', from, 'to:', to, 'promotion:', promotion);
            var move = self.game.move({ from: from, to: to, promotion: promotion });
            console.log('[ENGINE-DIAGNOSTIC] [STOCKFISH-APPLIED] move:', move ? (from + to) : 'ILLEGAL');

            if (move) {
                self.board.position(self.game.fen());
                self.updateStatus();
                if (self.mode === 'play') {
                    window.setTimeout(function() { self.startAnalysis(); }, 100);
                }
            }
        });
    };

    ChessAnalysisController.prototype.startAnalysis = function() {
        var self = this;
        var currentFen = this.game.fen();

        console.log('[ENGINE-DIAGNOSTIC] [ANALYSIS-START] FEN:', currentFen);

        if (!self.engine || !self.engine.ready || self.engine.simdUnsupported) {
            console.warn('[ENGINE-DIAGNOSTIC] [ANALYSIS-LOCAL-UNAVAILABLE] Engine not ready or SIMD unsupported');
            self.showAnalysisUnavailable('No analysis available for this position');
            return;
        }

        if (self.engine.analyzing) {
            console.log('[ENGINE-DIAGNOSTIC] [ANALYSIS-LOCAL-RESTART] Stopping previous analysis');
            self.engine.stopContinuousAnalysis();
        }

        console.log('[ENGINE-DIAGNOSTIC] [ANALYSIS-LOCAL-START] Starting Stockfish search');
        self.analysisLines = [];
        var linesByMultiPV = {};

        self.engine.startContinuousAnalysis(currentFen, function(analysis) {
                if (analysis.scoreType) {
                    self.lastAnalysisScore = {
                        scoreType: analysis.scoreType,
                        scoreValue: analysis.scoreValue
                    };

                    if (analysis.scoreType === 'cp') {
                        self.evalBar.setScore(analysis.scoreValue, null);
                    } else if (analysis.scoreType === 'mate') {
                        self.evalBar.setScore(0, analysis.scoreValue);
                    }

                    // Analyze move quality if we just made a move
                    if (self.waitingForAnalysis && self.beforeMoveScore && (analysis.depth >= 12 || analysis.scoreType === 'mate')) {
                        self.analyzeMoveQuality(self.beforeMoveScore, self.lastAnalysisScore);
                        self.waitingForAnalysis = false;
                        self.beforeMoveScore = null;
                    }
                }

                var multipv = analysis.multipv || 1;
                if (analysis.pv && (analysis.depth >= 10 || analysis.scoreType === 'mate')) {
                    linesByMultiPV[multipv] = {
                        depth: analysis.depth,
                        score: analysis.score,
                        scoreType: analysis.scoreType,
                        scoreValue: analysis.scoreValue,
                        pv: analysis.pv,
                        nodes: analysis.nodes
                    };

                    self.displayAnalysisLines(linesByMultiPV);
                }
        }, 3);
    };

    ChessAnalysisController.prototype.updateAnalysisFromCloud = function(result) {
        var self = this;
        var linesByMultiPV = {};
        
        if (!result || !result.pvs) return;

        result.pvs.forEach(function(pv, index) {
            var multipv = index + 1;
            linesByMultiPV[multipv] = {
                depth: result.depth || 0,
                scoreType: pv.cp !== undefined ? 'cp' : 'mate',
                scoreValue: pv.cp !== undefined ? pv.cp : (pv.mate || 0),
                pv: pv.moves ? pv.moves.split(' ') : [],
                nodes: (result.knodes || 0) * 1000
            };
        });

        if (result.pvs[0]) {
            var firstLine = result.pvs[0];
            this.lastAnalysisScore = {
                scoreType: firstLine.cp !== undefined ? 'cp' : 'mate',
                scoreValue: firstLine.cp !== undefined ? firstLine.cp : firstLine.mate
            };

            if (this.evalBar) {
                if (firstLine.cp !== undefined) {
                    this.evalBar.setScore(firstLine.cp, null);
                } else {
                    this.evalBar.setScore(0, firstLine.mate);
                }
            }

            // If we're waiting to analyze a move's impact
            if (this.waitingForAnalysis && this.beforeMoveScore) {
                console.log('[ENGINE-DIAGNOSTIC] [ANALYSIS-QUALITY] Analyzing move quality from cloud data');
                this.analyzeMoveQuality(this.beforeMoveScore, this.lastAnalysisScore);
                this.waitingForAnalysis = false;
                this.beforeMoveScore = null;
            }
        }

        this.displayAnalysisLines(linesByMultiPV);
    };

    ChessAnalysisController.prototype.analyzeMoveQuality = function(beforeScore, afterScore) {
        if (!window.GameReportScoring) {
            console.warn('GameReportScoring not loaded');
            return;
        }

        var history = this.game.history({ verbose: true });
        if (history.length === 0) return;

        var lastMove = history[history.length - 1];
        var moveColor = lastMove.color === 'w' ? 'white' : 'black';

        // Convert scores to centipawns
        var beforeCp = window.GameReportScoring.scoreToCentipawns(beforeScore.scoreType, beforeScore.scoreValue);
        var afterCp = window.GameReportScoring.scoreToCentipawns(afterScore.scoreType, afterScore.scoreValue);

        // Flip sign for black's perspective
        if (moveColor === 'black') {
            beforeCp = -beforeCp;
            afterCp = -afterCp;
        }

        // Calculate win chances
        var beforeWinChance = window.GameReportScoring.getWinChance(beforeCp);
        var afterWinChance = window.GameReportScoring.getWinChance(afterCp);
        var winChanceLoss = beforeWinChance - afterWinChance;

        // Calculate accuracy
        var accuracy = window.GameReportScoring.getAccuracy(winChanceLoss);

        // Classify move
        var classification = window.GameReportScoring.classifyMove(winChanceLoss);

        // Update stats
        var stats = this.liveStats[moveColor];
        stats.totalMoves++;
        stats.totalAccuracy += accuracy;

        if (classification.class === 'blunder') stats.blunders++;
        else if (classification.class === 'mistake') stats.mistakes++;
        else if (classification.class === 'dubious') stats.dubious++;
        else if (classification.class === 'inaccuracy') stats.inaccuracies++;

        // Store move in history
        this.moveHistory.push({
            move: lastMove.san,
            color: moveColor,
            accuracy: accuracy,
            classification: classification,
            winChanceLoss: winChanceLoss
        });
    };

    ChessAnalysisController.prototype.showAnalysisUnavailable = function(msg) {
        var analysisPanel = document.getElementById(this.analysisElement);
        if (!analysisPanel) return;
        analysisPanel.innerHTML = '<div class="analysis-unavailable">' + msg + '</div>';
    };

    ChessAnalysisController.prototype.displayAnalysisLines = function(linesByMultiPV) {
        console.log('[ENGINE-DIAGNOSTIC] [DISPLAY-LINES] Updating panel with lines:', Object.keys(linesByMultiPV).length);
        var analysisPanel = document.getElementById(this.analysisElement);
        if (!analysisPanel) {
            console.error('[ENGINE-DIAGNOSTIC] [DISPLAY-ERROR] Analysis panel element not found:', this.analysisElement);
            return;
        }

        var html = '';

        // Live stats section (shown first and prominently)
        if (this.moveHistory.length > 0) {
            html += '<div class="live-stats-section">';

            // Summary stats at top
            html += '<div class="live-stats-summary">';
            html += '<div class="stat-column">';
            html += '<div class="stat-header">White</div>';
            if (this.liveStats.white.totalMoves > 0) {
                var whiteAvg = (this.liveStats.white.totalAccuracy / this.liveStats.white.totalMoves).toFixed(1);
                html += '<div class="stat-accuracy">' + whiteAvg + '%</div>';
                html += '<div class="stat-detail">Blunders: <span class="blunder-count">' +
                        this.liveStats.white.blunders + '</span></div>';
                html += '<div class="stat-detail">Mistakes: <span class="mistake-count">' +
                        this.liveStats.white.mistakes + '</span></div>';
                html += '<div class="stat-detail">Dubious: <span class="dubious-count">' +
                        this.liveStats.white.dubious + '</span></div>';
                html += '<div class="stat-detail">Inaccuracies: <span class="inaccuracy-count">' +
                        this.liveStats.white.inaccuracies + '</span></div>';
            } else {
                html += '<div class="stat-detail">No moves yet</div>';
            }
            html += '</div>';

            html += '<div class="stat-column">';
            html += '<div class="stat-header">Black</div>';
            if (this.liveStats.black.totalMoves > 0) {
                var blackAvg = (this.liveStats.black.totalAccuracy / this.liveStats.black.totalMoves).toFixed(1);
                html += '<div class="stat-accuracy">' + blackAvg + '%</div>';
                html += '<div class="stat-detail">Blunders: <span class="blunder-count">' +
                        this.liveStats.black.blunders + '</span></div>';
                html += '<div class="stat-detail">Mistakes: <span class="mistake-count">' +
                        this.liveStats.black.mistakes + '</span></div>';
                html += '<div class="stat-detail">Dubious: <span class="dubious-count">' +
                        this.liveStats.black.dubious + '</span></div>';
                html += '<div class="stat-detail">Inaccuracies: <span class="inaccuracy-count">' +
                        this.liveStats.black.inaccuracies + '</span></div>';
            } else {
                html += '<div class="stat-detail">No moves yet</div>';
            }
            html += '</div>';
            html += '</div>';

            // Recent moves
            html += '<div class="recent-moves-header">Recent Moves</div>';
            html += '<div class="recent-moves">';
            var recentMoves = this.moveHistory.slice(-10).reverse();
            for (var j = 0; j < recentMoves.length; j++) {
                var moveData = recentMoves[j];
                var colorIndicator = moveData.color === 'white' ? '⚪' : '⚫';
                var accuracyColor = moveData.accuracy >= 95 ? '#4a90e2' :
                                  moveData.accuracy >= 80 ? '#7cb342' :
                                  moveData.accuracy >= 60 ? '#fbc02d' : '#d32f2f';

                html += '<div class="recent-move">';
                html += '<span class="move-indicator">' + colorIndicator + '</span>';
                html += '<span class="move-notation">' + moveData.move + '</span>';
                html += '<span class="move-accuracy" style="color: ' + accuracyColor + '">' +
                        moveData.accuracy.toFixed(1) + '%</span>';
                if (moveData.classification) {
                    var symbol = moveData.classification.symbol || '';
                    var label = moveData.classification.label || '';
                    var displayText = symbol ? symbol + ' ' + label : label;
                    html += '<span class="move-classification ' + moveData.classification.class + '" title="' +
                            label + '">' + displayText + '</span>';
                }
                html += '</div>';
            }
            html += '</div>';

            html += '</div>';
        }

        // Engine lines (shown below stats, more compact)
        html += '<div class="analysis-lines">';
        var hasLines = false;
        for (var i = 1; i <= 3; i++) {
            if (linesByMultiPV[i]) {
                hasLines = true;
                var line = linesByMultiPV[i];
                var scoreText = '';

                if (line.scoreType === 'cp') {
                    scoreText = (line.scoreValue > 0 ? '+' : '') + (line.scoreValue / 100).toFixed(2);
                } else if (line.scoreType === 'mate') {
                    scoreText = 'M' + Math.abs(line.scoreValue);
                }

                var moves = this.formatPVMoves(line.pv);

                html += '<div class="analysis-line">';
                html += '<span class="analysis-score">' + scoreText + '</span>';
                html += '<span class="analysis-moves">' + moves + '</span>';
                html += '</div>';
            }
        }

        if (!hasLines && this.moveHistory.length === 0) {
            html += '<div class="no-analysis">Make a move to start analysis</div>';
        }

        html += '</div>';

        analysisPanel.innerHTML = html;
    };

    ChessAnalysisController.prototype.formatPVMoves = function(pv) {
        if (!pv || pv.length === 0) return '';

        var tempGame = new Chess(this.game.fen());
        var moves = [];

        for (var i = 0; i < Math.min(pv.length, 10); i++) {
            var move = pv[i];
            var from = move.substring(0, 2);
            var to = move.substring(2, 4);
            var promotion = move.length > 4 ? move.substring(4) : undefined;

            var moveObj = tempGame.move({
                from: from,
                to: to,
                promotion: promotion
            });

            if (moveObj) {
                moves.push(moveObj.san);
            } else {
                break;
            }
        }

        return moves.join(' ');
    };

    ChessAnalysisController.prototype.updateStatus = function() {
        var status = '';
        var moveColor = this.game.turn() === 'w' ? 'White' : 'Black';

        if (this.game.in_checkmate()) {
            status = 'Game over, ' + moveColor + ' is in checkmate.';
        } else if (this.game.in_draw()) {
            status = 'Game over, drawn position';
        } else {
            status = moveColor + ' to move';
            if (this.game.in_check()) {
                status += ', ' + moveColor + ' is in check';
            }
        }

        if (this.mode === 'analysis') {
            status = 'Live Analysis - ' + status;
        }

        this.setStatus(status);
    };

    ChessAnalysisController.prototype.setStatus = function(text) {
        var statusEl = document.getElementById(this.statusElement);
        if (statusEl) {
            statusEl.textContent = text;
        }
    };

    ChessAnalysisController.prototype.setupControls = function() {
        var self = this;

        var newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', function() {
                self.newGame();
            });
        }

        var flipBoardBtn = document.getElementById('flip-board-btn');
        if (flipBoardBtn) {
            flipBoardBtn.addEventListener('click', function() {
                self.board.flip();
                self.evalBar.setOrientation(
                    self.evalBar.orientation === 'white' ? 'black' : 'white'
                );
            });
        }

        var undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', function() {
                self.undoMove();
            });
        }

        var generateReportBtn = document.getElementById('generate-report-btn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', function() {
                self.generateReport();
            });
        }
    };

    ChessAnalysisController.prototype.newGame = function() {
        if (this.engine && this.engine.analyzing) {
            this.engine.stopContinuousAnalysis();
        }

        this.game.reset();
        this.board.start();
        this.evalBar.setScore(0, null);

        // Reset live stats
        this.moveHistory = [];
        this.liveStats = {
            white: { totalMoves: 0, totalAccuracy: 0, blunders: 0, mistakes: 0, dubious: 0, inaccuracies: 0 },
            black: { totalMoves: 0, totalAccuracy: 0, blunders: 0, mistakes: 0, dubious: 0, inaccuracies: 0 }
        };
        this.beforeMoveScore = null;
        this.waitingForAnalysis = false;

        this.updateStatus();

        if (this.engine) {
            this.engine.newGame();

            if (this.mode === 'analysis') {
                this.startAnalysis();
            } else if (this.playerColor === 'black') {
                this.makeEngineMove();
            }
        }
    };

    ChessAnalysisController.prototype.undoMove = function() {
        this.game.undo();

        if (this.mode === 'play' && this.game.history().length > 0) {
            this.game.undo();
        }

        this.board.position(this.game.fen());
        this.updateStatus();

        if (this.mode === 'analysis') {
            this.startAnalysis();
        }
    };

    ChessAnalysisController.prototype.toggleMode = function() {
        var container = document.getElementById('main-container');
        var toggle = document.getElementById('analysis-toggle');

        if (this.mode === 'play') {
            this.mode = 'analysis';
            if (container) container.classList.add('analysis-enabled');
            if (toggle) toggle.checked = true;
            this.startAnalysis();
        } else {
            this.mode = 'play';
            if (container) container.classList.remove('analysis-enabled');
            if (toggle) toggle.checked = false;
            if (this.engine && this.engine.analyzing) {
                this.engine.stopContinuousAnalysis();
            }
        }

        this.updateStatus();
    };

    ChessAnalysisController.prototype.setPlayerColor = function(color) {
        this.playerColor = color;
        this.board.orientation(color);
        this.evalBar.setOrientation(color);
        this.newGame();
    };

    ChessAnalysisController.prototype.setSkillLevel = function(level) {
        if (this.engine) {
            this.engine.setSkillLevel(level);
        }
    };

    ChessAnalysisController.prototype.generateReport = function() {
        var self = this;
        var history = this.game.history();

        if (history.length === 0) {
            this.setStatus('No moves to analyze. Play some moves first.');
            return;
        }

        if (!window.GameReportGenerator) {
            console.error('GameReportGenerator not loaded');
            this.setStatus('Error: Game report module not loaded');
            return;
        }

        // Show report panel and progress
        var reportPanel = document.getElementById('report-panel');
        var reportContent = document.getElementById('report-content');

        if (reportPanel) reportPanel.style.display = 'block';
        if (reportContent) reportContent.innerHTML = '<p>Generating game report...</p>';

        // Stop continuous analysis
        if (this.engine && this.engine.analyzing) {
            this.engine.stopContinuousAnalysis();
        }

        this.setStatus('Generating game report...');

        // Create generator and start analysis
        var generator = new window.GameReportGenerator(this.engine, this.game, this.board);

        generator.generateReport(
            function(current, total) {
                if (reportContent) {
                    reportContent.innerHTML = '<p>Analyzing move ' + current + ' of ' + total + '...</p>';
                }
            },
            function(report) {
                // Complete callback
                if (report.error) {
                    self.setStatus('Error: ' + report.error);
                    return;
                }

                self.currentReport = report;
                self.displayReport(report);
                self.setStatus('Game report complete');

                // Restart analysis if in analysis mode
                if (self.mode === 'analysis') {
                    self.startAnalysis();
                }
            }
        );
    };

    ChessAnalysisController.prototype.displayReport = function(report) {
        var reportContent = document.getElementById('report-content');
        if (!reportContent) return;

        var html = '<div class="report-stats">';

        // White statistics
        html += '<div class="player-stats-card white">';
        html += '<h3>White</h3>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Average Accuracy:</span>';
        html += '<span class="stat-value accuracy-value">' + report.white.averageAccuracy + '%</span>';
        html += '</div>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Total Moves:</span>';
        html += '<span class="stat-value">' + report.white.totalMoves + '</span>';
        html += '</div>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Blunders:</span>';
        html += '<span class="stat-value blunder-count">' + report.white.blunders + '</span>';
        html += '</div>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Mistakes:</span>';
        html += '<span class="stat-value mistake-count">' + report.white.mistakes + '</span>';
        html += '</div>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Dubious:</span>';
        html += '<span class="stat-value dubious-count">' + report.white.dubious + '</span>';
        html += '</div>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Inaccuracies:</span>';
        html += '<span class="stat-value inaccuracy-count">' + report.white.inaccuracies + '</span>';
        html += '</div>';
        html += '</div>';

        // Black statistics
        html += '<div class="player-stats-card black">';
        html += '<h3>Black</h3>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Average Accuracy:</span>';
        html += '<span class="stat-value accuracy-value">' + report.black.averageAccuracy + '%</span>';
        html += '</div>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Total Moves:</span>';
        html += '<span class="stat-value">' + report.black.totalMoves + '</span>';
        html += '</div>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Blunders:</span>';
        html += '<span class="stat-value blunder-count">' + report.black.blunders + '</span>';
        html += '</div>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Mistakes:</span>';
        html += '<span class="stat-value mistake-count">' + report.black.mistakes + '</span>';
        html += '</div>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Dubious:</span>';
        html += '<span class="stat-value dubious-count">' + report.black.dubious + '</span>';
        html += '</div>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Inaccuracies:</span>';
        html += '<span class="stat-value inaccuracy-count">' + report.black.inaccuracies + '</span>';
        html += '</div>';
        html += '</div>';

        html += '</div>';

        reportContent.innerHTML = html;
    };

    window.ChessAnalysisController = ChessAnalysisController;

})(window);
