/**
 * Chessground Wrapper
 * Adapts Chessground API to match Chessboard.js interface for compatibility
 */

(function(window) {
    'use strict';

    function ChessgroundBoard(elementId, config) {
        this.elementId = elementId;
        this.element = document.getElementById(elementId);
        this.config = config || {};
        this.ground = null;
        this.currentOrientation = this.config.orientation || 'white';

        if (!this.element) {
            console.error('Chessground element not found:', elementId);
            return;
        }

        this.init();
    }

    ChessgroundBoard.prototype.init = function() {
        var self = this;

        // Parse initial position
        var initialFen = this.config.position === 'start' ?
            'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' :
            this.config.position;

        // Initialize Chessground
        this.ground = Chessground(this.element, {
            fen: initialFen,
            orientation: this.currentOrientation,
            turnColor: this.getTurnColor(initialFen),
            movable: {
                free: false,
                color: 'both',
                events: {
                    after: function(orig, dest, metadata) {
                        if (self.config.onDrop) {
                            self.config.onDrop(orig, dest);
                        }
                    }
                }
            },
            draggable: {
                enabled: true,
                showGhost: true
            },
            events: {
                move: function(orig, dest) {
                    if (self.config.onSnapEnd) {
                        self.config.onSnapEnd();
                    }
                }
            },
            drawable: {
                enabled: true,
                visible: true,
                eraseOnClick: false,
                shapes: []
            },
            highlight: {
                lastMove: true,
                check: true
            },
            animation: {
                enabled: true,
                duration: 200
            }
        });

        // Setup drag start handler
        if (this.config.onDragStart) {
            var originalMovable = this.ground.state.movable;
            this.ground.set({
                movable: {
                    events: {
                        after: originalMovable.events.after,
                        afterNewPiece: originalMovable.events.afterNewPiece
                    },
                    color: 'both',
                    free: false
                },
                draggable: {
                    enabled: true
                }
            });
        }
    };

    ChessgroundBoard.prototype.position = function(positionOrFen) {
        if (!this.ground) return;

        var fen;
        if (typeof positionOrFen === 'string') {
            if (positionOrFen === 'start') {
                fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            } else {
                fen = positionOrFen;
            }
        } else if (typeof positionOrFen === 'object') {
            // Convert position object to FEN (simplified)
            fen = this.positionObjToFen(positionOrFen);
        } else {
            return this.ground.getFen();
        }

        this.ground.set({
            fen: fen,
            turnColor: this.getTurnColor(fen),
            lastMove: null
        });
    };

    ChessgroundBoard.prototype.move = function(moveString) {
        if (!this.ground) return;

        // Parse move string (e.g., "e2-e4" or "e2-e4,d7-d5")
        var moves = moveString.split(',').map(function(m) { return m.trim(); });

        for (var i = 0; i < moves.length; i++) {
            var parts = moves[i].split('-');
            if (parts.length === 2) {
                var from = parts[0];
                var to = parts[1];

                // Animate the move
                this.ground.move(from, to);
                this.ground.set({
                    lastMove: [from, to]
                });
            }
        }
    };

    ChessgroundBoard.prototype.start = function() {
        this.position('start');
    };

    ChessgroundBoard.prototype.flip = function() {
        if (!this.ground) return;

        this.currentOrientation = this.currentOrientation === 'white' ? 'black' : 'white';
        this.ground.toggleOrientation();
    };

    ChessgroundBoard.prototype.orientation = function(color) {
        if (!this.ground) return this.currentOrientation;

        if (color) {
            this.currentOrientation = color;
            this.ground.set({
                orientation: color
            });
        }
        return this.currentOrientation;
    };

    ChessgroundBoard.prototype.setShapes = function(shapes) {
        if (!this.ground) return;

        // Convert shapes array to Chessground format
        // Expected format: [{ brush: 'green', orig: 'e2', dest: 'e4' }, ...]
        this.ground.setShapes(shapes);
    };

    ChessgroundBoard.prototype.clearShapes = function() {
        if (!this.ground) return;
        this.ground.setShapes([]);
    };

    ChessgroundBoard.prototype.getTurnColor = function(fen) {
        if (!fen) return 'white';
        var parts = fen.split(' ');
        return parts[1] === 'w' ? 'white' : 'black';
    };

    ChessgroundBoard.prototype.positionObjToFen = function(posObj) {
        // Simplified position object to FEN conversion
        // This is a basic implementation - extend as needed
        var ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        var files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        var fenParts = [];
        for (var r = 0; r < ranks.length; r++) {
            var rank = ranks[r];
            var fenRank = '';
            var emptyCount = 0;

            for (var f = 0; f < files.length; f++) {
                var square = files[f] + rank;
                var piece = posObj[square];

                if (piece) {
                    if (emptyCount > 0) {
                        fenRank += emptyCount;
                        emptyCount = 0;
                    }
                    fenRank += piece;
                } else {
                    emptyCount++;
                }
            }

            if (emptyCount > 0) {
                fenRank += emptyCount;
            }

            fenParts.push(fenRank);
        }

        return fenParts.join('/') + ' w KQkq - 0 1';
    };

    ChessgroundBoard.prototype.resize = function() {
        // Chessground handles resize automatically
    };

    ChessgroundBoard.prototype.destroy = function() {
        if (this.ground) {
            this.ground.destroy();
            this.ground = null;
        }
    };

    window.ChessgroundBoard = ChessgroundBoard;

})(window);
