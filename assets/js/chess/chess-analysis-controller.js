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
                self.board.position(self.game.fen());
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

        this.board = Chessboard(this.boardElement, boardConfig);

        this.evalBar = new EvalBar(this.evalBarElement, {
            orientation: this.playerColor
        });

        this.engine = new StockfishEngine({
            skillLevel: this.options.skillLevel || 10,
            depth: this.options.depth || 15
        });

        this.engine.init(function() {
            self.updateStatus();

            if (self.mode === 'analysis') {
                self.startAnalysis();
            } else if (self.playerColor === 'black') {
                self.makeEngineMove();
            }
        });

        this.setupControls();
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
        var move = this.game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        if (move === null) return 'snapback';

        this.updateStatus();

        if (this.mode === 'analysis') {
            this.startAnalysis();
        } else if (!this.game.game_over()) {
            var self = this;
            window.setTimeout(function() {
                self.makeEngineMove();
            }, 250);
        }
    };

    ChessAnalysisController.prototype.makeEngineMove = function() {
        var self = this;
        if (!this.engine || !this.engine.ready) return;

        this.setStatus('Engine thinking...');

        this.engine.getBestMove(this.game.fen(), function(bestMove) {
            if (!bestMove) {
                self.updateStatus();
                return;
            }

            var from = bestMove.substring(0, 2);
            var to = bestMove.substring(2, 4);
            var promotion = bestMove.length > 4 ? bestMove.substring(4) : undefined;

            var move = self.game.move({
                from: from,
                to: to,
                promotion: promotion
            });

            if (move) {
                self.board.position(self.game.fen());
                self.updateStatus();
            }
        });
    };

    ChessAnalysisController.prototype.startAnalysis = function() {
        var self = this;

        if (!this.engine || !this.engine.ready) {
            console.log('Engine not ready, waiting to start analysis...');
            setTimeout(function() {
                self.startAnalysis();
            }, 500);
            return;
        }

        if (this.engine.analyzing) {
            this.engine.stopContinuousAnalysis();
        }

        this.analysisLines = [];
        var linesByMultiPV = {};

        this.engine.startContinuousAnalysis(this.game.fen(), function(analysis) {
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
            }

            var multipv = analysis.multipv || 1;
            if (analysis.pv && analysis.depth >= 10) {
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

    ChessAnalysisController.prototype.parseInfo = function(line) {
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
                analysis.score = 'M' + Math.abs(scoreMatch[2]);
            }
        }

        var pvMatch = line.match(/pv (.+)/);
        if (pvMatch) analysis.pv = pvMatch[1].split(' ');

        var nodesMatch = line.match(/nodes (\d+)/);
        if (nodesMatch) analysis.nodes = parseInt(nodesMatch[1], 10);

        return Object.keys(analysis).length > 1 ? analysis : null;
    };

    ChessAnalysisController.prototype.displayAnalysisLines = function(linesByMultiPV) {
        var analysisPanel = document.getElementById(this.analysisElement);
        if (!analysisPanel) return;

        var html = '<div class="analysis-lines">';

        for (var i = 1; i <= 3; i++) {
            if (linesByMultiPV[i]) {
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
            status = 'Analysis Mode - ' + status;
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

        var toggleModeBtn = document.getElementById('toggle-mode-btn');
        if (toggleModeBtn) {
            toggleModeBtn.addEventListener('click', function() {
                self.toggleMode();
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
        if (this.mode === 'play') {
            this.mode = 'analysis';
            this.startAnalysis();
        } else {
            this.mode = 'play';
            if (this.engine && this.engine.analyzing) {
                this.engine.stopContinuousAnalysis();
            }
        }

        this.updateStatus();

        var toggleBtn = document.getElementById('toggle-mode-btn');
        if (toggleBtn) {
            toggleBtn.textContent = this.mode === 'play' ? 'Analysis Mode' : 'Play Mode';
        }
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
        var reportProgress = document.getElementById('report-progress');
        var progressBar = document.getElementById('progress-bar');
        var progressText = document.getElementById('progress-text');

        if (reportPanel) reportPanel.style.display = 'block';
        if (reportContent) reportContent.innerHTML = '';
        if (reportProgress) reportProgress.style.display = 'block';
        if (progressBar) progressBar.style.width = '0%';

        // Stop continuous analysis
        if (this.engine && this.engine.analyzing) {
            this.engine.stopContinuousAnalysis();
        }

        this.setStatus('Generating game report...');

        // Create generator and start analysis
        var generator = new window.GameReportGenerator(this.engine, this.game);

        generator.generateReport(
            function(current, total) {
                // Progress callback
                var percent = Math.round((current / total) * 100);
                if (progressBar) progressBar.style.width = percent + '%';
                if (progressText) {
                    progressText.textContent = 'Analyzing move ' + current + ' of ' + total + '...';
                }
            },
            function(report) {
                // Complete callback
                if (report.error) {
                    self.setStatus('Error: ' + report.error);
                    if (reportProgress) reportProgress.style.display = 'none';
                    return;
                }

                self.currentReport = report;
                self.displayReport(report);
                self.setStatus('Game report complete');

                if (reportProgress) reportProgress.style.display = 'none';

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
