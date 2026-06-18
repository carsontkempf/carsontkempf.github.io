(function(window) {
    'use strict';

    var FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    var DRAG_THRESHOLD = 5;

    var FEN_PIECE_MAP = {
        'K': 'wK', 'Q': 'wQ', 'R': 'wR', 'B': 'wB', 'N': 'wN', 'P': 'wP',
        'k': 'bK', 'q': 'bQ', 'r': 'bR', 'b': 'bB', 'n': 'bN', 'p': 'bP'
    };

    function fenToPosition(fen) {
        if (!fen || fen === 'start') fen = START_FEN;
        var rows = fen.split(' ')[0].split('/');
        var pos = {};
        for (var rank = 0; rank < 8; rank++) {
            var row = rows[rank];
            var file = 0;
            for (var i = 0; i < row.length; i++) {
                var ch = row[i];
                if (ch >= '1' && ch <= '8') {
                    file += parseInt(ch, 10);
                } else if (FEN_PIECE_MAP[ch]) {
                    pos[FILES[file] + (8 - rank)] = FEN_PIECE_MAP[ch];
                    file++;
                }
            }
        }
        return pos;
    }

    function pieceUrl(theme, piece) {
        return (theme || '/assets/img/chesspieces/wikipedia/{piece}.png').replace('{piece}', piece);
    }

    function isLight(fileIdx, rank) {
        return (fileIdx + rank) % 2 === 0;
    }

    function ChessBoard(elementId, config) {
        config = config || {};
        this._cfg = config;
        this._orientation = config.orientation || 'white';
        this._pos = {};
        this._cells = {};
        this._grid = null;
        this._ghost = null;
        this._potSrc = null;
        this._potPiece = null;
        this._dragSrc = null;
        this._dragging = false;
        this._dragX = 0;
        this._dragY = 0;

        var el = document.getElementById(elementId);
        if (!el) return;
        this._el = el;

        this._buildDOM();
        this._createGhost();
        this._bindEvents();

        var initPos = config.position;
        if (!initPos || initPos === 'start') {
            this.position('start');
        } else if (typeof initPos === 'string') {
            this.position(initPos);
        } else {
            this.position(initPos);
        }
    }

    ChessBoard.prototype._buildDOM = function() {
        this._el.innerHTML = '';
        var grid = document.createElement('div');
        grid.className = 'cb-grid';
        this._el.appendChild(grid);
        this._grid = grid;
        this._renderCells();
    };

    ChessBoard.prototype._renderCells = function() {
        this._grid.innerHTML = '';
        this._cells = {};

        var ranks, files;
        if (this._orientation === 'white') {
            ranks = [8, 7, 6, 5, 4, 3, 2, 1];
            files = [0, 1, 2, 3, 4, 5, 6, 7];
        } else {
            ranks = [1, 2, 3, 4, 5, 6, 7, 8];
            files = [7, 6, 5, 4, 3, 2, 1, 0];
        }

        for (var ri = 0; ri < 8; ri++) {
            for (var fi = 0; fi < 8; fi++) {
                var rank = ranks[ri];
                var fileIdx = files[fi];
                var sq = FILES[fileIdx] + rank;

                var cell = document.createElement('div');
                cell.className = 'cb-cell ' + (isLight(fileIdx, rank) ? 'light' : 'dark') + ' square-' + sq;
                cell.dataset.square = sq;

                if (fi === 0) {
                    var rankLbl = document.createElement('span');
                    rankLbl.className = 'cb-notation rank';
                    rankLbl.textContent = rank;
                    cell.appendChild(rankLbl);
                }
                if (ri === 7) {
                    var fileLbl = document.createElement('span');
                    fileLbl.className = 'cb-notation file';
                    fileLbl.textContent = FILES[fileIdx];
                    cell.appendChild(fileLbl);
                }

                this._grid.appendChild(cell);
                this._cells[sq] = cell;
            }
        }
    };

    ChessBoard.prototype._createGhost = function() {
        var old = document.getElementById('cb-drag-ghost');
        if (old) old.parentNode.removeChild(old);
        var g = document.createElement('img');
        g.id = 'cb-drag-ghost';
        g.style.display = 'none';
        document.body.appendChild(g);
        this._ghost = g;
    };

    ChessBoard.prototype._setCell = function(sq, piece) {
        var cell = this._cells[sq];
        if (!cell) return;
        var old = cell.querySelector('.cb-piece');
        if (old) cell.removeChild(old);
        if (!piece) return;
        var img = document.createElement('img');
        img.className = 'cb-piece';
        img.src = pieceUrl(this._cfg.pieceTheme, piece);
        img.alt = piece;
        img.dataset.piece = piece;
        img.draggable = false;
        cell.appendChild(img);
    };

    ChessBoard.prototype._renderPos = function() {
        var cells = this._grid.querySelectorAll('.cb-cell');
        for (var i = 0; i < cells.length; i++) {
            var img = cells[i].querySelector('.cb-piece');
            if (img) cells[i].removeChild(img);
        }
        for (var sq in this._pos) {
            if (Object.prototype.hasOwnProperty.call(this._pos, sq)) {
                this._setCell(sq, this._pos[sq]);
            }
        }
    };

    ChessBoard.prototype._findCell = function(el) {
        while (el && el !== this._grid) {
            if (el.classList && el.classList.contains('cb-cell')) return el;
            el = el.parentNode;
        }
        return null;
    };

    ChessBoard.prototype._bindEvents = function() {
        var self = this;

        this._grid.addEventListener('mouseover', function(e) {
            var cell = self._findCell(e.target);
            if (!cell) return;
            var sq = cell.dataset.square;
            var img = cell.querySelector('.cb-piece');
            if (self._cfg.onMouseoverSquare) self._cfg.onMouseoverSquare(sq, img ? img.dataset.piece : false);
        });

        this._grid.addEventListener('mouseout', function(e) {
            var cell = self._findCell(e.target);
            if (!cell) return;
            var toCell = e.relatedTarget ? self._findCell(e.relatedTarget) : null;
            if (toCell === cell) return;
            var sq = cell.dataset.square;
            var img = cell.querySelector('.cb-piece');
            if (self._cfg.onMouseoutSquare) self._cfg.onMouseoutSquare(sq, img ? img.dataset.piece : false);
        });

        this._grid.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            var cell = self._findCell(e.target);
            if (!cell) return;
            var sq = cell.dataset.square;
            var img = cell.querySelector('.cb-piece');
            self._potSrc = sq;
            self._potPiece = img ? img.dataset.piece : null;
            self._dragX = e.clientX;
            self._dragY = e.clientY;
            self._dragging = false;
            self._dragSrc = null;
            e.preventDefault();
        });

        this._onMouseMove = function(e) {
            if (!self._potSrc) return;
            var dx = e.clientX - self._dragX;
            var dy = e.clientY - self._dragY;
            if (!self._dragging && self._potPiece && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
                var cancel = self._cfg.onDragStart && self._cfg.onDragStart(self._potSrc, self._potPiece) === false;
                if (cancel) { self._potSrc = null; return; }
                self._dragging = true;
                self._dragSrc = self._potSrc;
                var srcCell = self._cells[self._dragSrc];
                if (srcCell) srcCell.classList.add('cb-source-cell');
                self._ghost.src = pieceUrl(self._cfg.pieceTheme, self._potPiece);
                self._ghost.style.left = e.clientX + 'px';
                self._ghost.style.top = e.clientY + 'px';
                self._ghost.style.display = 'block';
            }
            if (self._dragging) {
                self._ghost.style.left = e.clientX + 'px';
                self._ghost.style.top = e.clientY + 'px';
            }
        };

        this._onMouseUp = function(e) {
            if (!self._potSrc) return;
            var wasSrc = self._potSrc;
            var wasDragging = self._dragging;
            self._potSrc = null;
            self._potPiece = null;
            self._dragging = false;

            if (wasDragging) {
                var src = self._dragSrc;
                self._dragSrc = null;
                self._ghost.style.display = 'none';

                var el = document.elementFromPoint(e.clientX, e.clientY);
                var tgtCell = el ? self._findCell(el) : null;
                var tgt = tgtCell ? tgtCell.dataset.square : null;

                var srcCell = self._cells[src];
                if (srcCell) srcCell.classList.remove('cb-source-cell');

                var result = self._cfg.onDrop ? self._cfg.onDrop(src, tgt || 'offboard') : null;

                if (result === 'snapback' || !tgt || tgt === src) {
                    self._renderPos();
                } else {
                    // Move piece visually
                    var piece = self._pos[src];
                    if (piece) {
                        delete self._pos[src];
                        self._pos[tgt] = piece;
                        self._setCell(src, null);
                        self._setCell(tgt, piece);
                    }
                }

                if (self._cfg.onSnapEnd) self._cfg.onSnapEnd();
            } else {
                // Click
                if (self._cfg.onSquareClick) self._cfg.onSquareClick(wasSrc);
            }
        };

        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('mouseup', this._onMouseUp);
    };

    // Public API

    ChessBoard.prototype.position = function(fen, _animate) {
        if (fen === undefined) return this._pos;
        if (typeof fen === 'object') {
            this._pos = fen;
        } else {
            this._pos = fenToPosition(fen);
        }
        this._renderPos();
        return this;
    };

    ChessBoard.prototype.move = function(moveStr) {
        var parts = moveStr.split('-');
        var src = parts[0], tgt = parts[1];
        var piece = this._pos[src];
        if (!piece) return this;
        delete this._pos[src];
        this._pos[tgt] = piece;
        this._setCell(src, null);
        this._setCell(tgt, piece);
        if (this._cfg.onSnapEnd) this._cfg.onSnapEnd();
        return this;
    };

    ChessBoard.prototype.start = function() {
        return this.position('start');
    };

    ChessBoard.prototype.flip = function() {
        this._orientation = this._orientation === 'white' ? 'black' : 'white';
        this._renderCells();
        this._renderPos();
        return this;
    };

    ChessBoard.prototype.orientation = function(color) {
        if (color === 'flip') return this.flip();
        if (color === 'white' || color === 'black') {
            if (color !== this._orientation) {
                this._orientation = color;
                this._renderCells();
                this._renderPos();
            }
        }
        return this._orientation;
    };

    ChessBoard.prototype.destroy = function() {
        if (this._ghost && this._ghost.parentNode) this._ghost.parentNode.removeChild(this._ghost);
        if (this._onMouseMove) document.removeEventListener('mousemove', this._onMouseMove);
        if (this._onMouseUp) document.removeEventListener('mouseup', this._onMouseUp);
        if (this._el) this._el.innerHTML = '';
    };

    window.Chessboard = function(elementId, config) {
        return new ChessBoard(elementId, config);
    };

})(window);
