(function(window) {
    'use strict';

    var _bestDepth = 0;
    var _currentFen = null;
    var _containerEl = null;
    var _cssInjected = false;

    function injectCss() {
        if (_cssInjected) return;
        _cssInjected = true;
        var s = document.createElement('style');
        s.textContent = [
            '#engine-thinking-viz{width:100%;background:#0d0d0d;border-radius:4px;',
            'margin:10px auto;max-width:1400px;box-sizing:border-box;',
            'padding:10px 14px;min-height:44px;font-family:monospace;}',
            '.viz-idle{font-size:12px;color:#444;}',
            '.viz-line{display:flex;gap:12px;align-items:baseline;flex-wrap:wrap;}',
            '.viz-depth{font-size:12px;color:#777;white-space:nowrap;}',
            '.viz-score{font-size:13px;font-weight:700;white-space:nowrap;min-width:52px;}',
            '.viz-score.pos{color:#5a9fd4;}.viz-score.neg{color:#c0392b;}.viz-score.even{color:#888;}',
            '.viz-moves{font-size:12px;color:#ccc;word-break:break-word;}'
        ].join('');
        document.head.appendChild(s);
    }

    function getContainer() {
        if (!_containerEl) _containerEl = document.getElementById('engine-thinking-viz');
        return _containerEl;
    }

    function uciToSan(uciMoves, fen) {
        if (!window.Chess) return uciMoves.join(' ');
        var game;
        try { game = new Chess(fen); } catch (e) { return uciMoves.join(' '); }
        var sans = [];
        for (var i = 0; i < Math.min(uciMoves.length, 12); i++) {
            var mv = uciMoves[i];
            var result = game.move({ from: mv.substring(0, 2), to: mv.substring(2, 4), promotion: mv.length > 4 ? mv[4] : undefined });
            if (!result) break;
            sans.push(result.san);
        }
        return sans.join(' ');
    }

    function formatScore(analysis) {
        if (!analysis.scoreType) return '';
        if (analysis.scoreType === 'mate') {
            var m = analysis.scoreValue;
            return (m > 0 ? '+' : '') + 'M' + Math.abs(m);
        }
        var cp = analysis.scoreValue;
        return (cp >= 0 ? '+' : '') + (cp / 100).toFixed(2);
    }

    function render(analysis) {
        var el = getContainer();
        if (!el) return;
        injectCss();

        var scoreStr = formatScore(analysis);
        var scoreClass = !analysis.scoreType ? 'even' : (analysis.scoreValue > 20 ? 'pos' : analysis.scoreValue < -20 ? 'neg' : 'even');
        var sanLine = uciToSan(analysis.pv, _currentFen);
        var depth = analysis.depth || 0;
        var seldepth = analysis.seldepth ? '/' + analysis.seldepth : '';

        el.innerHTML = '<div class="viz-line">' +
            '<span class="viz-depth">Depth ' + depth + seldepth + '</span>' +
            (scoreStr ? '<span class="viz-score ' + scoreClass + '">' + scoreStr + '</span>' : '') +
            '<span class="viz-moves">' + sanLine + '</span>' +
            '</div>';
    }

    function update(analysis, fen) {
        if (!analysis || !analysis.pv || !analysis.pv.length) return;

        if (fen && fen !== _currentFen) {
            _currentFen = fen;
            _bestDepth = 0;
        }

        var depth = analysis.depth || 0;
        if (depth < _bestDepth) return;
        _bestDepth = depth;

        render(analysis);
    }

    function clear() {
        _bestDepth = 0;
        _currentFen = null;
        var el = getContainer();
        if (!el) return;
        injectCss();
        el.innerHTML = '<span class="viz-idle">waiting for engine...</span>';
    }

    window.engineViz = { update: update, clear: clear };

})(window);
