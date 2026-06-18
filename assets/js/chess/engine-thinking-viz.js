(function(window) {
    'use strict';

    var _trie = null;
    var _bestPath = [];
    var _bestDepth = 0;
    var _currentFen = null;
    var _svg = null;
    var _g = null;
    var _zoom = null;
    var _cssInjected = false;
    var _containerEl = null;

    var W = 0, H = 320;
    var NODE_R = 7;
    var NODE_W = 80; // horizontal spacing per depth level
    var NODE_H = 22; // vertical spacing between siblings

    function injectCss() {
        if (_cssInjected) return;
        _cssInjected = true;
        var s = document.createElement('style');
        s.textContent = [
            '#engine-thinking-viz{width:100%;height:' + H + 'px;background:#0d0d0d;border-radius:4px;',
            'margin:10px auto;max-width:1400px;overflow:hidden;position:relative;box-sizing:border-box;}',
            '#engine-thinking-viz svg{display:block;}'
        ].join('');
        document.head.appendChild(s);
    }

    function getContainer() {
        if (!_containerEl) _containerEl = document.getElementById('engine-thinking-viz');
        return _containerEl;
    }

    function makeTrieRoot() {
        return { name: '', children: {}, count: 0, onBestPath: false, depth: 0 };
    }

    function pvToSan(uciPv, fen) {
        if (!uciPv || !uciPv.length || typeof Chess === 'undefined') return [];
        try {
            var tmp = new Chess(fen);
            var sans = [];
            for (var i = 0; i < uciPv.length; i++) {
                var uci = uciPv[i];
                var m = tmp.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || undefined });
                if (!m) break;
                sans.push(m.san);
            }
            return sans;
        } catch (e) { return []; }
    }

    function insertPath(sans, isBest) {
        var node = _trie;
        if (isBest) {
            node.onBestPath = true;
        }
        for (var i = 0; i < sans.length; i++) {
            var mv = sans[i];
            if (!node.children[mv]) {
                node.children[mv] = { name: mv, children: {}, count: 0, onBestPath: false, depth: i + 1 };
            }
            node.children[mv].count++;
            if (isBest) node.children[mv].onBestPath = true;
            node = node.children[mv];
        }
    }

    function clearBestPath(node) {
        node.onBestPath = false;
        Object.values(node.children).forEach(clearBestPath);
    }

    function markBestPath(sans) {
        var node = _trie;
        node.onBestPath = true;
        for (var i = 0; i < sans.length; i++) {
            var mv = sans[i];
            if (!node.children[mv]) break;
            node.children[mv].onBestPath = true;
            node = node.children[mv];
        }
    }

    function trieToD3(node) {
        var kids = Object.values(node.children).map(trieToD3);
        return {
            name: node.name,
            count: node.count,
            onBestPath: node.onBestPath,
            trieDepth: node.depth,
            children: kids.length ? kids : null
        };
    }

    function initSvg() {
        var el = getContainer();
        if (!el) return;
        injectCss();

        W = el.clientWidth || 700;

        if (_svg) {
            el.innerHTML = '';
            _svg = null;
            _g = null;
        }

        _svg = d3.select(el).append('svg')
            .attr('width', W)
            .attr('height', H)
            .style('background', '#0d0d0d');

        _g = _svg.append('g').attr('transform', 'translate(60,' + (H / 2) + ')');

        _zoom = d3.zoom()
            .scaleExtent([0.3, 3])
            .on('zoom', function(event) {
                _g.attr('transform', event.transform);
            });

        _svg.call(_zoom);
    }

    function render() {
        if (!_svg || !_g || !_trie) return;

        var d3Root = trieToD3(_trie);
        if (!d3Root.children) {
            _g.selectAll('*').remove();
            _g.append('text')
                .attr('fill', '#333')
                .attr('font-size', '12px')
                .attr('font-family', 'monospace')
                .text('searching...');
            return;
        }

        var hierarchy = d3.hierarchy(d3Root);
        var treeLayout = d3.tree().nodeSize([NODE_H, NODE_W]);
        treeLayout(hierarchy);

        _g.selectAll('*').remove();

        // Links
        _g.selectAll('.link')
            .data(hierarchy.links())
            .enter().append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', function(d) {
                return (d.source.data.onBestPath && d.target.data.onBestPath) ? '#ffd700' : '#333';
            })
            .attr('stroke-width', function(d) {
                return (d.source.data.onBestPath && d.target.data.onBestPath) ? 2 : 1;
            })
            .attr('d', d3.linkHorizontal()
                .x(function(d) { return d.y; })
                .y(function(d) { return d.x; })
            );

        // Nodes
        var nodeGroups = _g.selectAll('.node')
            .data(hierarchy.descendants().filter(function(d) { return d.data.name !== ''; }))
            .enter().append('g')
            .attr('class', 'node')
            .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; });

        // Determine if white or black is to move at each ply based on FEN
        var whiteToMove = _currentFen && _currentFen.split(' ')[1] === 'w';

        nodeGroups.append('circle')
            .attr('r', NODE_R)
            .attr('fill', function(d) {
                var ply = d.data.trieDepth;
                var engineIsWhite = whiteToMove;
                // ply 1 = engine's first move, alternates from there
                var isEnginePly = (ply % 2 === 1);
                if (d.data.onBestPath) {
                    return isEnginePly
                        ? (engineIsWhite ? '#2a5a8c' : '#8c2a2a')
                        : (engineIsWhite ? '#5a2a2a' : '#2a5a5a');
                }
                return isEnginePly ? '#1a3050' : '#301a1a';
            })
            .attr('stroke', function(d) { return d.data.onBestPath ? '#ffd700' : '#555'; })
            .attr('stroke-width', function(d) { return d.data.onBestPath ? 1.5 : 0.5; });

        nodeGroups.append('text')
            .attr('dy', NODE_R + 11)
            .attr('text-anchor', 'middle')
            .attr('fill', function(d) { return d.data.onBestPath ? '#eee' : '#666'; })
            .attr('font-size', '9px')
            .attr('font-family', 'monospace')
            .text(function(d) { return d.data.name; });
    }

    function update(analysis, fen) {
        if (!analysis || !analysis.pv || !analysis.pv.length) return;

        if (fen && fen !== _currentFen) {
            _trie = makeTrieRoot();
            _bestPath = [];
            _bestDepth = 0;
            _currentFen = fen;
            initSvg();
        }

        if (!_trie) {
            _trie = makeTrieRoot();
            initSvg();
        }

        var sans = pvToSan(analysis.pv, _currentFen || fen);
        if (!sans.length) return;

        var depth = analysis.depth || 0;
        insertPath(sans, false);

        if (depth > _bestDepth) {
            _bestDepth = depth;
            _bestPath = sans;
            clearBestPath(_trie);
            markBestPath(sans);
        }

        render();
    }

    function clear() {
        _trie = makeTrieRoot();
        _bestPath = [];
        _bestDepth = 0;
        _currentFen = null;

        var el = getContainer();
        if (!el) return;
        injectCss();

        if (!_svg) {
            initSvg();
        } else {
            _g.selectAll('*').remove();
            _g.append('text')
                .attr('fill', '#333')
                .attr('font-size', '12px')
                .attr('font-family', 'monospace')
                .text('waiting for engine...');
        }
    }

    window.engineViz = { update: update, clear: clear };

})(window);
