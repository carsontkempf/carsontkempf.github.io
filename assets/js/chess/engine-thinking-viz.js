(function(window) {
    'use strict';

    var _history = [];
    var _currentFen = null;
    var _el = null;
    var _cssInjected = false;

    function injectCss() {
        if (_cssInjected) return;
        _cssInjected = true;
        var s = document.createElement('style');
        s.textContent = [
            '#engine-thinking-viz{max-width:1400px;margin:10px auto;padding:12px;background:#111;color:#ccc;font-family:monospace;font-size:12px;border-radius:4px;box-sizing:border-box;}',
            '.viz-header{display:flex;gap:16px;align-items:center;margin-bottom:10px;border-bottom:1px solid #2a2a2a;padding-bottom:8px;flex-wrap:wrap;}',
            '.viz-label{color:#555;font-size:11px;letter-spacing:1px;flex:1;text-transform:uppercase;}',
            '.viz-stat{color:#7af;font-weight:bold;white-space:nowrap;}',
            '.viz-best-line{margin-bottom:10px;line-height:2;min-height:24px;}',
            '.viz-move-pill{display:inline-block;padding:2px 7px;border-radius:3px;margin:2px 1px;font-weight:bold;font-size:11px;}',
            '.viz-move-engine{background:#1a3a5c;color:#7cf;}',
            '.viz-move-opp{background:#2e1a1a;color:#f88;}',
            '.viz-arrow{color:#444;margin:0 2px;}',
            '.viz-history{border-top:1px solid #1e1e1e;padding-top:8px;}',
            '.viz-hist-row{display:flex;gap:6px;padding:2px 0;color:#555;font-size:11px;}',
            '.viz-hist-current{color:#ddd;}',
            '.viz-hist-depth{color:#444;min-width:28px;flex-shrink:0;}',
            '.viz-hist-moves{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
            '.viz-hist-score{color:#8d8;min-width:54px;text-align:right;flex-shrink:0;}',
            '.viz-hist-marker{color:#7cf;flex-shrink:0;}',
            '.viz-empty{color:#333;}'
        ].join('');
        document.head.appendChild(s);
    }

    function getEl() {
        if (!_el) _el = document.getElementById('engine-thinking-viz');
        return _el;
    }

    function pvToSan(pv, fen) {
        if (!pv || !fen || typeof Chess === 'undefined') return [];
        try {
            var tmp = new Chess(fen);
            var sans = [];
            for (var i = 0; i < Math.min(pv.length, 8); i++) {
                var uci = pv[i];
                var m = tmp.move({ from: uci.substring(0, 2), to: uci.substring(2, 4), promotion: uci[4] || undefined });
                if (!m) break;
                sans.push(m.san);
            }
            return sans;
        } catch (e) { return []; }
    }

    function formatNodes(n) {
        if (!n) return '?';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
        return String(n);
    }

    function formatScore(a) {
        if (!a || !a.scoreType) return '?';
        if (a.scoreType === 'mate') return 'M' + Math.abs(a.scoreValue);
        return (a.scoreValue > 0 ? '+' : '') + (a.scoreValue / 100).toFixed(2);
    }

    function render(latest) {
        var el = getEl();
        if (!el) return;
        injectCss();

        var sans = pvToSan(latest.pv, _currentFen);
        var isWhiteTurn = _currentFen && _currentFen.split(' ')[1] === 'w';

        var linePills = '';
        for (var i = 0; i < sans.length; i++) {
            var isEngine = (i % 2 === 0);
            var label = isEngine ? (isWhiteTurn ? 'W' : 'B') : (isWhiteTurn ? 'B' : 'W');
            var cls = isEngine ? 'viz-move-engine' : 'viz-move-opp';
            linePills += '<span class="viz-move-pill ' + cls + '">[' + label + '] ' + sans[i] + '</span>';
            if (i < sans.length - 1) linePills += '<span class="viz-arrow">→</span>';
        }

        var histHtml = '';
        for (var j = _history.length - 1; j >= 0; j--) {
            var h = _history[j];
            var isCurrent = (j === _history.length - 1);
            histHtml += '<div class="viz-hist-row' + (isCurrent ? ' viz-hist-current' : '') + '">';
            histHtml += '<span class="viz-hist-depth">D' + (h.depth < 10 ? ' ' + h.depth : h.depth) + '</span>';
            histHtml += '<span class="viz-hist-moves">' + h.sans.join(' ') + '</span>';
            histHtml += '<span class="viz-hist-score">' + h.score + '</span>';
            histHtml += (isCurrent ? '<span class="viz-hist-marker">&#8592;</span>' : '<span class="viz-hist-marker"> </span>');
            histHtml += '</div>';
        }

        el.innerHTML =
            '<div class="viz-header">' +
                '<span class="viz-label">Engine Thinking</span>' +
                '<span class="viz-stat">DEPTH ' + (latest.depth || '?') + '</span>' +
                '<span class="viz-stat">NODES ' + formatNodes(latest.nodes) + '</span>' +
                '<span class="viz-stat">SCORE ' + formatScore(latest) + '</span>' +
            '</div>' +
            '<div class="viz-best-line">' + (linePills || '<span class="viz-empty">searching...</span>') + '</div>' +
            '<div class="viz-history">' + (histHtml || '') + '</div>';
    }

    window.engineViz = {
        update: function(analysis, fen) {
            if (!analysis) return;
            if (fen) _currentFen = fen;

            if (analysis.pv && analysis.depth && analysis.scoreType) {
                var sans = pvToSan(analysis.pv, _currentFen);
                var last = _history[_history.length - 1];
                if (!last || last.depth !== analysis.depth) {
                    _history.push({ depth: analysis.depth, sans: sans, score: formatScore(analysis) });
                    if (_history.length > 5) _history.shift();
                }
            }

            render(analysis);
        },
        clear: function() {
            _history = [];
            _currentFen = null;
            var el = getEl();
            if (el) {
                injectCss();
                el.innerHTML = '<span class="viz-empty">waiting for engine...</span>';
            }
        }
    };

})(window);
