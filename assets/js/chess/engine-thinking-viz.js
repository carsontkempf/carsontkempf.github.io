(function(window) {
    'use strict';

    var _bestDepth = 0;
    var _currentFen = null;
    var _depthHistory = [];
    var _containerEl = null;
    var _cssInjected = false;

    var PIECE_PATH = '/assets/img/chesspieces/wikipedia/';

    function injectCss() {
        if (_cssInjected) return;
        _cssInjected = true;
        var s = document.createElement('style');
        s.textContent = [
            '#engine-thinking-viz{display:flex;gap:16px;padding:12px 14px;',
            'background:#0d0d0d;border-radius:4px;margin:10px auto;',
            'max-width:1400px;box-sizing:border-box;min-height:44px;',
            'flex-wrap:wrap;}',
            '.viz-board-col{flex:0 0 240px;}',
            '.viz-board-label{font-family:monospace;font-size:10px;color:#555;',
            'margin-bottom:3px;text-transform:uppercase;letter-spacing:0.5px;}',
            '.viz-mini-grid{display:grid;',
            'grid-template-columns:repeat(8,30px);',
            'grid-template-rows:repeat(8,30px);',
            'border:1px solid #333;}',
            '.viz-mini-cell{width:30px;height:30px;position:relative;}',
            '.viz-mini-cell.light{background:#f0d9b5;}',
            '.viz-mini-cell.dark{background:#b58863;}',
            '.viz-mini-cell.check{background:#c0392b !important;}',
            '.viz-mini-cell img{display:block !important;width:30px !important;',
            'height:30px !important;margin:0 !important;padding:0 !important;',
            'border-radius:0 !important;border:none !important;box-shadow:none !important;}',
            '.viz-info-col{flex:1;min-width:180px;display:flex;flex-direction:column;gap:8px;}',
            '.viz-header-row{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;}',
            '.viz-score-big{font-family:monospace;font-size:22px;font-weight:700;}',
            '.viz-score-big.pos{color:#5a9fd4;}.viz-score-big.neg{color:#c0392b;}',
            '.viz-score-big.even{color:#aaa;}',
            '.viz-depth-label{font-family:monospace;font-size:12px;color:#666;}',
            '.viz-stats{font-family:monospace;font-size:11px;color:#555;}',
            '.viz-line-text{font-family:monospace;font-size:11px;color:#999;',
            'word-break:break-word;line-height:1.4;}',
            '.viz-chart-wrap{margin-top:4px;}',
            '.viz-chart-title{font-family:monospace;font-size:10px;color:#444;',
            'text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;}',
            '.viz-chart{display:flex;gap:2px;align-items:flex-end;height:52px;}',
            '.viz-bar{width:8px;border-radius:1px 1px 0 0;min-height:3px;',
            'transition:height 0.15s ease;}',
            '.viz-idle{font-family:monospace;font-size:12px;color:#444;padding:12px 0;}'
        ].join('');
        document.head.appendChild(s);
    }

    function getContainer() {
        if (!_containerEl) _containerEl = document.getElementById('engine-thinking-viz');
        return _containerEl;
    }

    function parseFenPieces(fen) {
        var board = [];
        var rows = fen.split(' ')[0].split('/');
        for (var r = 0; r < 8; r++) {
            board[r] = [];
            var col = 0;
            for (var i = 0; i < rows[r].length; i++) {
                var ch = rows[r][i];
                if (ch >= '1' && ch <= '8') {
                    col += parseInt(ch, 10);
                } else {
                    board[r][col] = ch;
                    col++;
                }
            }
        }
        return board;
    }

    function pieceFile(ch) {
        var map = {
            'K': 'wK', 'Q': 'wQ', 'R': 'wR', 'B': 'wB', 'N': 'wN', 'P': 'wP',
            'k': 'bK', 'q': 'bQ', 'r': 'bR', 'b': 'bB', 'n': 'bN', 'p': 'bP'
        };
        return map[ch] || null;
    }

    function findKingSquare(board, kingChar) {
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                if (board[r][c] === kingChar) return { r: r, c: c };
            }
        }
        return null;
    }

    function computePvFen(uciMoves, fen) {
        if (!window.Chess) return fen;
        var game;
        try { game = new Chess(fen); } catch (e) { return fen; }
        for (var i = 0; i < uciMoves.length; i++) {
            var mv = uciMoves[i];
            var result = game.move({
                from: mv.substring(0, 2),
                to: mv.substring(2, 4),
                promotion: mv.length > 4 ? mv[4] : undefined
            });
            if (!result) break;
        }
        return { fen: game.fen(), inCheck: game.in_check(), sideToMove: game.turn() };
    }

    function renderMiniBoard(pvFen, inCheck, sideToMove) {
        var board = parseFenPieces(pvFen);
        var kingChar = sideToMove === 'b' ? 'k' : 'K';
        var kingSquare = inCheck ? findKingSquare(board, kingChar) : null;

        var html = '<div class="viz-mini-grid">';
        for (var r = 0; r < 8; r++) {
            for (var c = 0; c < 8; c++) {
                var isLight = (r + c) % 2 === 0;
                var cls = 'viz-mini-cell ' + (isLight ? 'light' : 'dark');
                if (kingSquare && kingSquare.r === r && kingSquare.c === c) cls += ' check';
                html += '<div class="' + cls + '">';
                var piece = board[r] && board[r][c];
                if (piece) {
                    var pf = pieceFile(piece);
                    if (pf) html += '<img src="' + PIECE_PATH + pf + '.png" alt="">';
                }
                html += '</div>';
            }
        }
        html += '</div>';
        return html;
    }

    function uciToSan(uciMoves, fen) {
        if (!window.Chess) return uciMoves.slice(0, 12).join(' ');
        var game;
        try { game = new Chess(fen); } catch (e) { return uciMoves.slice(0, 12).join(' '); }
        var sans = [];
        for (var i = 0; i < Math.min(uciMoves.length, 12); i++) {
            var mv = uciMoves[i];
            var result = game.move({
                from: mv.substring(0, 2),
                to: mv.substring(2, 4),
                promotion: mv.length > 4 ? mv[4] : undefined
            });
            if (!result) break;
            sans.push(result.san);
        }
        return sans.join(' ');
    }

    function formatScore(analysis) {
        if (!analysis.scoreType) return { str: '0.00', cls: 'even' };
        if (analysis.scoreType === 'mate') {
            var m = analysis.scoreValue;
            return { str: (m > 0 ? '+' : '') + 'M' + Math.abs(m), cls: m > 0 ? 'pos' : 'neg' };
        }
        var cp = analysis.scoreValue;
        return {
            str: (cp >= 0 ? '+' : '') + (cp / 100).toFixed(2),
            cls: cp > 20 ? 'pos' : cp < -20 ? 'neg' : 'even'
        };
    }

    function renderDepthChart() {
        if (_depthHistory.length === 0) return '';
        var maxCp = 0;
        for (var i = 0; i < _depthHistory.length; i++) {
            var abs = Math.abs(_depthHistory[i].cp);
            if (abs > maxCp) maxCp = abs;
        }
        var scale = maxCp > 0 ? Math.min(maxCp, 500) : 100;
        var bars = '';
        for (var j = 0; j < _depthHistory.length; j++) {
            var cp = _depthHistory[j].cp;
            var h = Math.round(Math.min(48, Math.abs(cp) / scale * 44 + 4));
            var color = cp > 20 ? '#5a9fd4' : cp < -20 ? '#c0392b' : '#666';
            bars += '<div class="viz-bar" title="D' + _depthHistory[j].depth + ': ' + (cp / 100).toFixed(2) + '" style="height:' + h + 'px;background:' + color + ';"></div>';
        }
        return '<div class="viz-chart-wrap">' +
            '<div class="viz-chart-title">Iterative deepening — eval per depth</div>' +
            '<div class="viz-chart">' + bars + '</div>' +
            '</div>';
    }

    function renderAll(analysis) {
        var el = getContainer();
        if (!el) return;
        injectCss();

        var pvResult = (analysis.pv && analysis.pv.length) ? computePvFen(analysis.pv, _currentFen) : null;
        var pvFen = pvResult ? pvResult.fen : _currentFen;
        var inCheck = pvResult ? pvResult.inCheck : false;
        var sideToMove = pvResult ? pvResult.sideToMove : 'w';

        var miniBoard = renderMiniBoard(pvFen, inCheck, sideToMove);

        var score = formatScore(analysis);
        var depth = analysis.depth || 0;
        var seldepth = analysis.seldepth ? '/' + analysis.seldepth : '';
        var nodes = analysis.nodes ? analysis.nodes.toLocaleString() : '—';
        var nps = analysis.nps ? Math.round(analysis.nps / 1000) + 'k nps' : '';
        var sanLine = (analysis.pv && analysis.pv.length) ? uciToSan(analysis.pv, _currentFen) : '';

        el.innerHTML =
            '<div class="viz-board-col">' +
                '<div class="viz-board-label">Engine thinking</div>' +
                miniBoard +
            '</div>' +
            '<div class="viz-info-col">' +
                '<div class="viz-header-row">' +
                    '<span class="viz-score-big ' + score.cls + '">' + score.str + '</span>' +
                    '<span class="viz-depth-label">Depth ' + depth + seldepth + '</span>' +
                '</div>' +
                '<div class="viz-stats">' + nodes + ' nodes' + (nps ? '  |  ' + nps : '') + '</div>' +
                (sanLine ? '<div class="viz-line-text">' + sanLine + '</div>' : '') +
                renderDepthChart() +
            '</div>';
    }

    function update(analysis, fen) {
        if (!analysis || !analysis.pv || !analysis.pv.length) return;

        if (fen && fen !== _currentFen) {
            _currentFen = fen;
            _bestDepth = 0;
            _depthHistory = [];
        }

        var depth = analysis.depth || 0;
        if (depth <= _bestDepth) return;
        _bestDepth = depth;

        var cp = analysis.scoreType === 'cp'
            ? analysis.scoreValue
            : (analysis.scoreValue > 0 ? 9999 : -9999);
        _depthHistory.push({ depth: depth, cp: cp });

        renderAll(analysis);
    }

    function clear() {
        _bestDepth = 0;
        _currentFen = null;
        _depthHistory = [];
        var el = getContainer();
        if (!el) return;
        injectCss();
        el.innerHTML = '<span class="viz-idle">waiting for engine...</span>';
    }

    window.engineViz = { update: update, clear: clear };

})(window);
