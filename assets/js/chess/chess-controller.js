/**
 * Chess Controller
 * Integrates chess.js, chessboard.js, and Stockfish engine
 */

(function(window) {
    'use strict';

    function ChessController(options) {
        this.options = options || {};
        this.boardElement = this.options.boardElement || 'chess-board';
        this.statusElement = this.options.statusElement || 'game-status';
        this.game = null;
        this.board = null;
        this.engine = null;
        this.playerColor = this.options.playerColor || 'white';
        this.engineEnabled = this.options.engineEnabled !== false;
    }

    ChessController.prototype.init = function() {
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
            pieceTheme: this.options.pieceTheme || '/assets/images/chesspieces/wikipedia/{piece}.png'
        };

        if (this.playerColor === 'black') {
            boardConfig.orientation = 'black';
        }

        this.board = Chessboard(this.boardElement, boardConfig);

        if (this.engineEnabled) {
            this.engine = new StockfishEngine({
                skillLevel: this.options.skillLevel || 10,
                depth: this.options.depth || 15
            });

            this.engine.init(function() {
                self.updateStatus();
                if (self.playerColor === 'black') {
                    self.makeEngineMove();
                }
            });
        } else {
            this.updateStatus();
        }

        this.setupControls();
    };

    ChessController.prototype.onDragStart = function(source, piece, position, orientation) {
        if (this.game.game_over()) return false;

        if (this.engineEnabled) {
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

    ChessController.prototype.onDrop = function(source, target) {
        var move = this.game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        if (move === null) return 'snapback';

        this.updateStatus();

        if (this.engineEnabled && !this.game.game_over()) {
            var self = this;
            window.setTimeout(function() {
                self.makeEngineMove();
            }, 250);
        }
    };

    ChessController.prototype.makeEngineMove = function() {
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

    ChessController.prototype.updateStatus = function() {
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

        this.setStatus(status);
    };

    ChessController.prototype.setStatus = function(text) {
        var statusEl = document.getElementById(this.statusElement);
        if (statusEl) {
            statusEl.textContent = text;
        }
    };

    ChessController.prototype.setupControls = function() {
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
            });
        }

        var undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', function() {
                self.undoMove();
            });
        }
    };

    ChessController.prototype.newGame = function() {
        this.game.reset();
        this.board.start();
        this.updateStatus();

        if (this.engine) {
            this.engine.newGame();
            if (this.playerColor === 'black') {
                this.makeEngineMove();
            }
        }
    };

    ChessController.prototype.undoMove = function() {
        this.game.undo();

        if (this.engineEnabled && this.game.history().length > 0) {
            this.game.undo();
        }

        this.board.position(this.game.fen());
        this.updateStatus();
    };

    ChessController.prototype.setPlayerColor = function(color) {
        this.playerColor = color;
        this.board.orientation(color);
        this.newGame();
    };

    ChessController.prototype.setSkillLevel = function(level) {
        if (this.engine) {
            this.engine.setSkillLevel(level);
        }
    };

    window.ChessController = ChessController;

})(window);
