/**
 * Skins3D - 4-directional pixel-art characters with rotation.
 * Each character has front/back/left/right 16x16 sprites.
 * Character facing direction updates based on movement angle.
 * Each pixel rendered as a tiny 3D block (top highlight, bottom shadow).
 */

// Polyfill roundRect
if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        var r = typeof radii === "number" ? radii : (radii && radii[0] || 0);
        this.moveTo(x + r, y); this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r); this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h); this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r); this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y); this.closePath();
    };
}

const SKINS_3D = {
    droplet: { name: "Droplet", price: 0 },
    bunny: { name: "Bunny", price: 150 },
    penguin: { name: "Penguin", price: 200 },
    fox: { name: "Fox", price: 250 },
    panda: { name: "Panda", price: 300 },
    owl: { name: "Owl", price: 350 },
    frog: { name: "Frog", price: 200 },
    chick: { name: "Chick", price: 150 },
    skateboard: { name: "Skater", price: 400 },
    skis: { name: "Skier", price: 450 },
    hoverboard: { name: "Hoverboard", price: 500 },
    astronaut: { name: "Astronaut", price: 600 },
    ninja: { name: "Ninja", price: 500 },
};

// Color palettes shared across sprites
// c/C = player color (mapped at render time)
// Common: w=white, k=black, h=skin, p=pink, o=orange, g=green, b=blue, r=red, y=yellow

// Each sprite has: colors{}, front[], back[], left[], right[] (16x16 grids)
// "0" = transparent

const SPRITES = {
bunny: {
    colors: { w:"#ffffff", W:"#e0e0e0", p:"#ffaacc", P:"#ff77aa", k:"#111111", n:"#ff8899" },
    front: [
        "0000ww0000ww0000",
        "0000ww0000ww0000",
        "0000wp0000pw0000",
        "0000ww0000ww0000",
        "000wwwwwwwwww000",
        "00wwwwwwwwwwww00",
        "00wwkwwwwwkwww00",
        "00wwwwwnwwwwww00",
        "00wwwwwwwwwwww00",
        "000WWWWWWWWWW000",
        "00WWWWWWWWWWWW00",
        "00WWWWWWWWWWWW00",
        "00WW00WWWW00WW00",
        "00WW00WWWW00WW00",
        "00pp00pppp00pp00",
        "0000000000000000",
    ],
    back: [
        "0000ww0000ww0000",
        "0000ww0000ww0000",
        "0000ww0000ww0000",
        "0000ww0000ww0000",
        "000wwwwwwwwww000",
        "00wwwwwwwwwwww00",
        "00wwwwwwwwwwww00",
        "00wwwwwwwwwwww00",
        "00wwwwwwwwwwww00",
        "000WWWWWWWWWW000",
        "00WWWWWWWWWWWW00",
        "00WWWWWWWWWWWW00",
        "00WW00WWWW00WW00",
        "00WW00WWWW00WW00",
        "00pp00pppp00pp00",
        "0000000000000000",
    ],
    left: [
        "00ww000000000000",
        "00ww000000000000",
        "00pw000000000000",
        "00ww000000000000",
        "00wwwwwwww000000",
        "0wwwwwwwwww00000",
        "0wkwwwwwwwww0000",
        "0wwwnwwwwwww0000",
        "0wwwwwwwwwww0000",
        "00WWWWWWWWW00000",
        "0WWWWWWWWWWW0000",
        "0WWWWWWWWWWW0000",
        "0WW00WWWW0000000",
        "0WW00WWWW0000000",
        "0pp00pppp0000000",
        "0000000000000000",
    ],
    right: [
        "00000000000ww000",
        "00000000000ww000",
        "00000000000wp000",
        "00000000000ww000",
        "000000wwwwwwww00",
        "00000wwwwwwwww00",
        "0000wwwwwwwwkw00",
        "0000wwwwwwwnww00",
        "0000wwwwwwwwww00",
        "00000WWWWWWWW000",
        "0000WWWWWWWWWW00",
        "0000WWWWWWWWWW00",
        "0000000WWWW00WW0",
        "0000000WWWW00WW0",
        "0000000pppp00pp0",
        "0000000000000000",
    ],
},
penguin: {
    colors: { k:"#1a1a2e", K:"#333344", w:"#f5f5f5", o:"#ff8c00", e:"#ffffff", p:"#111111" },
    front: [
        "0000kkkkkk000000",
        "000kkkkkkkkkk000",
        "00kkekkkkkekk000",
        "00kkpkkkkkpkk000",
        "00kkkkkokkkkkk00",
        "00kkkkkkkkkkkk00",
        "0Kkkkwwwwwwkkk00",
        "0Kkkkwwwwwwkkk00",
        "0KKkkwwwwwwkKK00",
        "00KKkwwwwwwKK000",
        "000kkwwwwwwkk000",
        "0000kkwwwwkk0000",
        "0000kkkkkkkk0000",
        "000oo00000oo0000",
        "00oooo000oooo000",
        "0000000000000000",
    ],
    back: [
        "0000kkkkkk000000",
        "000kkkkkkkkkk000",
        "00kkkkkkkkkkkk00",
        "00kkkkkkkkkkkk00",
        "00kkkkkkkkkkkk00",
        "00kkkkkkkkkkkk00",
        "0KkkkkkkkkkkkK00",
        "0KkkkkkkkkkkkK00",
        "0KKkkkkkkkkKKK00",
        "00KKkkkkkkKKK000",
        "000kkkkkkkkkk000",
        "0000kkkkkkkk0000",
        "0000kkkkkkkk0000",
        "000oo00000oo0000",
        "00oooo000oooo000",
        "0000000000000000",
    ],
    left: [
        "000kkkkk00000000",
        "00kkkkkkkk000000",
        "0kkekkkkkk000000",
        "0kkpkkokkkk00000",
        "0kkkkkkkkkk00000",
        "0kkkwwwwkkk00000",
        "Kkkkwwwwkkk00000",
        "KKkkwwwwkKK00000",
        "0KKkwwwwKKK00000",
        "00kkwwwwkkk00000",
        "000kkwwkk0000000",
        "000kkkkkk0000000",
        "00oo00oo00000000",
        "0oooo0oooo000000",
        "0000000000000000",
        "0000000000000000",
    ],
    right: [
        "00000000kkkkk000",
        "000000kkkkkkkk00",
        "000000kkkkkekk00",
        "00000kkkkokpkk00",
        "00000kkkkkkkkkk0",
        "00000kkkwwwwkkk0",
        "00000kkkwwwwkkKK",
        "00000KKkwwwwkkKK",
        "00000KKKwwwwkKK0",
        "00000kkkwwwwkk00",
        "0000000kkwwkk000",
        "0000000kkkkkk000",
        "00000000oo00oo00",
        "000000oooo0oooo0",
        "0000000000000000",
        "0000000000000000",
    ],
},
fox: {
    colors: { o:"#f07020", O:"#cc5500", w:"#ffffff", k:"#111111", t:"#ff9040", b:"#884400" },
    front: [
        "0o0000000000o000",
        "0oo00000000oo000",
        "00oooooooooo0000",
        "00ookooookoo0000",
        "00oooowwoooo0000",
        "00oowwwwwooo0000",
        "000ooknkooo00000",
        "0000ooooooo00000",
        "000OOOoOOOOO0000",
        "00OOwwwwwwOO0000",
        "00OOwwwwwwOO0000",
        "000OOOOOOOO00000",
        "000OO000OOO00000",
        "000bb000bbb00000",
        "0000000000ttttt0",
        "00000000000twwt0",
    ],
    back: [
        "0o0000000000o000",
        "0oo00000000oo000",
        "00oooooooooo0000",
        "00oooooooooo0000",
        "00oooooooooo0000",
        "00oooooooooo0000",
        "000ooooooooo0000",
        "0000ooooooo00000",
        "000OOOOOOOOOO000",
        "00OOOOOOOOOOOO00",
        "00OOOOOOOOOOOO00",
        "000OOOOOOOOOO000",
        "000OO0000OOO0000",
        "000bb0000bbb0000",
        "00000000ttttt000",
        "000000000twwt000",
    ],
    left: [
        "0o00000000000000",
        "0ooo0000000000t0",
        "00ooooooo00000t0",
        "00okoooooo000tt0",
        "00oowwooo000tww0",
        "00ooknoo00000000",
        "000ooooo00000000",
        "00OOOoOO00000000",
        "0OOwwwOOO0000000",
        "0OOwwwOOO0000000",
        "00OOOOOOO0000000",
        "00OO00OO00000000",
        "00bb00bb00000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    right: [
        "000000000000o000",
        "t000000000ooo000",
        "t00000ooooooo000",
        "tt000ooooookoo00",
        "wwt000ooowwoo000",
        "00000000onkoo000",
        "0000000oooooo000",
        "00000000OOoOO000",
        "0000000OOOwwwO00",
        "0000000OOOwwwO00",
        "0000000OOOOOOO00",
        "000000000OO00OO0",
        "000000000bb00bb0",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
},
panda: {
    colors: { w:"#ffffff", W:"#e8e8e8", k:"#222222", K:"#444444", p:"#111111", e:"#ffffff" },
    front: [
        "00kk00000000kk00",
        "00kkk000000kkk00",
        "00wwwwwwwwwwww00",
        "0wwwkkwwwwkkwww0",
        "0wwkpkwwwwkpkww0",
        "0wwwkkwwwwkkwww0",
        "0wwwwwwkkwwwwww0",
        "00wwwwwwwwwwww00",
        "0kWWWWWWWWWWWWk0",
        "0kWWWWWWWWWWWWk0",
        "00kWWWwwwwWWWk00",
        "00kWWWwwwwWWWk00",
        "000kWWWWWWWWk000",
        "000kk0000kkk0000",
        "000kk0000kkk0000",
        "0000000000000000",
    ],
    back: [
        "00kk00000000kk00",
        "00kkk000000kkk00",
        "00wwwwwwwwwwww00",
        "0wwwwwwwwwwwwww0",
        "0wwwwwwwwwwwwww0",
        "0wwwwwwwwwwwwww0",
        "0wwwwwwwwwwwwww0",
        "00wwwwwwwwwwww00",
        "0kWWWWWWWWWWWWk0",
        "0kWWWWWWWWWWWWk0",
        "00kWWWWWWWWWWk00",
        "00kWWWWWWWWWWk00",
        "000kWWWWWWWWk000",
        "000kk0000kkk0000",
        "000kk0000kkk0000",
        "0000000000000000",
    ],
    left: [
        "0kk0000000000000",
        "0kkk0000000000k0",
        "0wwwwwwwwww0000k",
        "wwkkwwwwwwww000k",
        "wkpkwwwwwwwW00k0",
        "wwkkwwwwwWWW00k0",
        "wwwwwkkwWWWW0k00",
        "0wwwwwwWWWWWWk00",
        "00wwwWWWWWWWk000",
        "000WWWWWWWWW0000",
        "0000WWwwWWW00000",
        "0000kk00kk000000",
        "0000kk00kk000000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
    right: [
        "00000000000kk000",
        "k0000000000kkk00",
        "k0000wwwwwwwwww0",
        "k000wwwwwwwwkkww",
        "0k00Wwwwwwwwkpkw",
        "0k00WWWWwwwwkkww",
        "00k0WWWWwkkwwwww",
        "00kWWWWWWwwwwww0",
        "000kWWWWWWWwww00",
        "0000WWWWWWWWW000",
        "00000WWwwWWW0000",
        "000000kk00kk0000",
        "000000kk00kk0000",
        "0000000000000000",
        "0000000000000000",
        "0000000000000000",
    ],
},
};

// Simpler sprites share front for all directions
SPRITES.droplet = {
    colors: { c:"#00d2ff", C:"#0099bb", w:"#ffffff", k:"#111111" },
    front: [
        "0000000cc0000000",
        "000000cccc000000",
        "00000cccccc00000",
        "0000ccwccccc0000",
        "000cccwccccccc00",
        "00cccccccccccc00",
        "0cccccccccccccc0",
        "0ccccckcckccccc0",
        "0cccccccccccccc0",
        "00cccccccccccc00",
        "00cccccccccccc00",
        "000CcccccccCC000",
        "0000CCccccCC0000",
        "00000CCCCCC00000",
        "0000000CC0000000",
        "0000000000000000",
    ],
};

SPRITES.owl = {
    colors: { b:"#8B5E3C", B:"#6B3E1C", t:"#d4a574", o:"#ff8c00", w:"#f0dcc0", k:"#111111", y:"#ff9800" },
    front: [
        "00Bb000000bB0000",
        "000bbbbbbbbbb000",
        "00bbbbbbbbbbb000",
        "0bbbwwbbbwwbbb00",
        "0bbwowbbwowbbb00",
        "0bbbwwbbbwwbbb00",
        "0bbbbbbybbbbb000",
        "00bbbbbbbbbb0000",
        "00BBbbttttbbBB00",
        "000Bbbttttbbb000",
        "000Bbbttttbbb000",
        "0000Bbbbbbbbb000",
        "0000BBbbbbBB0000",
        "00000yy00yy00000",
        "00000yy00yy00000",
        "0000000000000000",
    ],
};
SPRITES.frog = {
    colors: { g:"#2ecc71", G:"#27ae60", l:"#a8e6cf", w:"#ffffff", k:"#111111", d:"#1a7a40" },
    front: [
        "00ww00000ww00000",
        "0wkww000wkww0000",
        "00ww00000ww00000",
        "00ggggggggg00000",
        "0ggggggggggg0000",
        "0ggggggggggggg00",
        "0gggggddddggg000",
        "00ggggggggggg000",
        "000GGGGGGGGGG000",
        "00GGGllllGGGG000",
        "00GGGllllGGGGG00",
        "00GGGllllGGGGG00",
        "000GGGGGGGGGG000",
        "000GG0000GG00000",
        "00ggg000ggg00000",
        "0000000000000000",
    ],
};
SPRITES.chick = {
    colors: { y:"#ffd700", Y:"#f0c000", o:"#ff6600", k:"#111111", w:"#ffffff" },
    front: [
        "000000YY00000000",
        "00000YYY00000000",
        "0000yyyyyy000000",
        "000yyyyyyyy00000",
        "000yykyyyyky0000",
        "000yyyyyyyyy0000",
        "0000yyooyyyy0000",
        "0000yyyyyyyy0000",
        "000YYyyyyyYY0000",
        "00YYYYyyyyYYY000",
        "00YYYYyyyyYYY000",
        "000YYYyyyyYYY000",
        "0000YYyyyyYY0000",
        "00000oo00oo00000",
        "0000ooo0ooo00000",
        "0000000000000000",
    ],
};
SPRITES.skateboard = {
    colors: { h:"#fdd9b5", c:"#333333", s:"#00d2ff", S:"#0099bb", b:"#8B4513", k:"#444444", j:"#3366cc" },
    front: [
        "0000ccccc0000000",
        "000hhcccchh00000",
        "000hhhhhhhh00000",
        "000hhkhhkhh00000",
        "000hhhhhhhh00000",
        "000ssssssss00000",
        "00ssssssssss0000",
        "00Ssssssssss0000",
        "000sssssssss0000",
        "000jjjjjjjjj0000",
        "000jjjjjjjjj0000",
        "000jj000jjjj0000",
        "000kk000kkk00000",
        "00bbbbbbbbbbb000",
        "00k00k000k00k000",
        "0000000000000000",
    ],
};
SPRITES.skis = {
    colors: { r:"#e74c3c", h:"#fdd9b5", o:"#ffa500", w:"#ffffff", k:"#222222", B:"#1e90ff", g:"#888888" },
    front: [
        "000000ww00000000",
        "0000rrrrrr000000",
        "000rrooorr000000",
        "000hhhhhhhh00000",
        "000rrrrrrrr00000",
        "00rrrrrrrrrr0000",
        "0grrrrrrrrrrg000",
        "0g0rrrrrrrr0g000",
        "000kkkkkkkk00000",
        "000kk000kkk00000",
        "000kk000kkk00000",
        "00BBB00BBBB00000",
        "00BBB00BBBB00000",
        "00BBB00BBBB00000",
        "00BBB00BBBB00000",
        "0000000000000000",
    ],
};
SPRITES.hoverboard = {
    colors: { d:"#2c3e50", D:"#1a252f", c:"#00d2ff", C:"#0099bb", p:"#7b2ff7", g:"#00ff88", k:"#111111" },
    front: [
        "0000DDDDDDdd0000",
        "000DDcccccDDd000",
        "000DDDDDDDDDd000",
        "000DDDDDDDDDD000",
        "000DDkDDkDDDD000",
        "0000DDDDDDDD0000",
        "000ddddddddddd00",
        "00dddddcdddddd00",
        "000ddddddddddd00",
        "000dd00000dd0000",
        "000kk00000kk0000",
        "0000kk000kk00000",
        "0pppccccccccpp00",
        "0pCCccccccccCp00",
        "00gggg00gggggg00",
        "0000000000000000",
    ],
};
SPRITES.astronaut = {
    colors: { w:"#eeeeee", W:"#cccccc", g:"#888888", G:"#666666", b:"#2a4a8a", B:"#1a1a4e", v:"#4a90d9", s:"#aaaaaa" },
    front: [
        "0000wwwwww000000",
        "000wwwwwwwww0000",
        "000wBBBBBBwww000",
        "000wBvvvvBwww000",
        "000wBvvvvBwww000",
        "000wwBBBBwwww000",
        "0000wwwwwwww0000",
        "00gwwwwwwwwwwg00",
        "00gwwwwwwwwwwg00",
        "00sswwwwwwwwss00",
        "000WWWWWWWWWW000",
        "000WWWWWWWWWW000",
        "000WW000WWWWW000",
        "000gg000ggggg000",
        "000ggg00ggggg000",
        "0000000000000000",
    ],
};
SPRITES.ninja = {
    colors: { d:"#2f3542", D:"#1a1a2e", r:"#ff4757", w:"#ffffff", s:"#999999", k:"#111111", g:"#c0a000" },
    front: [
        "00000000s0000000",
        "000000s0s0000000",
        "0000ddddddd00000",
        "000ddrrrrrdd0000",
        "000ddwddwddd0000",
        "000dddddddddrrr0",
        "0000ddddddddd000",
        "000DDDDsDDDDD000",
        "00DDDDDDDDDDD000",
        "00DDgggggggDD000",
        "000DDDDDDDDD0000",
        "000DDDDDDDDD0000",
        "000DD000DD000000",
        "000DD000DD000000",
        "000kk000kk000000",
        "0000000000000000",
    ],
};


class Skins3DRenderer {
    constructor() {
        // Generate missing directions for all sprites
        for (var key in SPRITES) {
            var s = SPRITES[key];
            if (!s.back) s.back = this._makeBack(s.front, s.colors);
            if (!s.left) s.left = this._makeLeft(s.front);
            if (!s.right) s.right = this._makeRight(s.front);
        }

        // Pre-generate all 32 frames for each sprite
        this._frames = {};
        for (var key in SPRITES) {
            this._frames[key] = this._generate32Frames(SPRITES[key]);
        }
    }

    /**
     * Generate 32 rotational frames by interpolating between 4 base sprites.
     * Frames 0-7: right to back (moving clockwise from right toward down)
     * Frames 8-15: back to left
     * Frames 16-23: left to front
     * Frames 24-31: front to right
     */
    _generate32Frames(sprite) {
        var dirs = ["right", "back", "left", "front"];
        var frames = [];
        for (var q = 0; q < 4; q++) {
            var fromDir = dirs[q];
            var toDir = dirs[(q + 1) % 4];
            var fromGrid = sprite[fromDir];
            var toGrid = sprite[toDir];
            for (var step = 0; step < 8; step++) {
                var t = step / 8; // 0 to 0.875
                frames.push(this._blendGrids(fromGrid, toGrid, t));
            }
        }
        return frames;
    }

    /**
     * Blend two 16x16 grids by shifting pixels.
     * At t=0, shows fromGrid. At t=1, shows toGrid.
     * Intermediate: shift columns from fromGrid and overlay toGrid pixels.
     */
    _blendGrids(fromGrid, toGrid, t) {
        var shift = Math.round(t * 3); // 0-2 pixel shift
        var result = [];
        for (var row = 0; row < 16; row++) {
            var line = "";
            for (var col = 0; col < 16; col++) {
                // Blend: use toGrid for pixels that "appear" as we turn
                var fromCol = col + shift;
                var toCol = col - (3 - shift);
                var ch = "0";
                if (t < 0.5) {
                    // Mostly from
                    if (fromCol >= 0 && fromCol < 16) ch = fromGrid[row][fromCol];
                    if (ch === "0" && toCol >= 0 && toCol < 16) ch = toGrid[row][toCol];
                } else {
                    // Mostly to
                    if (toCol >= 0 && toCol < 16) ch = toGrid[row][toCol];
                    if (ch === "0" && fromCol >= 0 && fromCol < 16) ch = fromGrid[row][fromCol];
                }
                if (!ch) ch = "0";
                line += ch;
            }
            result.push(line);
        }
        return result;
    }

    _makeBack(front, colors) {
        var bodyChar = this._findBodyChar(front);
        var faceChars = ["k", "p", "e", "n"];
        var back = [];
        for (var i = 0; i < front.length; i++) {
            var row = "";
            for (var j = 0; j < front[i].length; j++) {
                var ch = front[i][j];
                if (faceChars.indexOf(ch) >= 0 && i < 10) row += bodyChar;
                else row += ch;
            }
            back.push(row);
        }
        return back;
    }

    _makeLeft(front) {
        var left = [];
        for (var i = 0; i < front.length; i++) {
            var row = "";
            for (var j = 0; j < 16; j++) {
                var srcJ = j + 2;
                row += (srcJ < 16) ? front[i][srcJ] : "0";
            }
            left.push(row);
        }
        return left;
    }

    _makeRight(front) {
        var right = [];
        for (var i = 0; i < front.length; i++) {
            var row = "";
            for (var j = 0; j < 16; j++) {
                var srcJ = j - 2;
                row += (srcJ >= 0) ? front[i][srcJ] : "0";
            }
            right.push(row);
        }
        return right;
    }

    _findBodyChar(grid) {
        var counts = {};
        for (var i = 0; i < grid.length; i++) {
            for (var j = 0; j < grid[i].length; j++) {
                var ch = grid[i][j];
                if (ch !== "0") counts[ch] = (counts[ch] || 0) + 1;
            }
        }
        var best = "0", bestCount = 0;
        for (var c in counts) {
            if (counts[c] > bestCount && c !== "k" && c !== "p" && c !== "e") {
                best = c; bestCount = counts[c];
            }
        }
        return best;
    }

    draw(ctx, x, y, r, angle, skinId, playerColor) {
        var frames = this._frames[skinId] || this._frames.droplet;
        var sprite = SPRITES[skinId] || SPRITES.droplet;

        // Map angle to frame index (0-31)
        // angle=0 is right. Our frames: 0=right, 8=back(down), 16=left, 24=front(up)
        var a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        var frameIdx = Math.floor(a / (Math.PI * 2) * 32) % 32;
        var grid = frames[frameIdx];

        var size = r * 2;
        var pixelSize = size / 16;
        var blockDepth = pixelSize * 0.5;
        var topSquish = 0.6;

        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(x, y + r * 0.7, r * 0.55, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fill();

        var startX = x - size / 2;
        var startY = y - size * topSquish / 2 - blockDepth;

        for (var row = 15; row >= 0; row--) {
            var line = grid[row];
            if (!line) continue;
            for (var col = 0; col < 16; col++) {
                var ch = line[col];
                if (ch === "0" || !ch) continue;

                var color = sprite.colors[ch];
                if (!color) continue;
                if (ch === "c") color = playerColor;
                if (ch === "C") color = this.darken(playerColor, 0.7);

                var px = startX + col * pixelSize;
                var py = startY + row * pixelSize * topSquish;

                // TOP FACE
                ctx.fillStyle = color;
                ctx.fillRect(px, py, pixelSize + 0.3, pixelSize * topSquish + 0.3);

                // TOP HIGHLIGHT
                ctx.fillStyle = this.lighten(color, 0.2);
                ctx.fillRect(px, py, pixelSize + 0.3, pixelSize * topSquish * 0.25);

                // FRONT FACE (depth)
                ctx.fillStyle = this.darken(color, 0.5);
                ctx.fillRect(px, py + pixelSize * topSquish, pixelSize + 0.3, blockDepth);

                // RIGHT FACE (side)
                ctx.fillStyle = this.darken(color, 0.65);
                ctx.fillRect(px + pixelSize * 0.85, py, pixelSize * 0.15 + 0.3, pixelSize * topSquish + blockDepth);
            }
        }
    }

    lighten(color, amount) {
        var r, g, b;
        if (color[0] === "#") {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        } else {
            var m = color.match(/\d+/g);
            if (!m) return color;
            r = parseInt(m[0]); g = parseInt(m[1]); b = parseInt(m[2]);
        }
        r = Math.min(255, r + Math.floor(255 * amount));
        g = Math.min(255, g + Math.floor(255 * amount));
        b = Math.min(255, b + Math.floor(255 * amount));
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    darken(color, factor) {
        var r, g, b;
        if (color[0] === "#") {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        } else {
            var m = color.match(/\d+/g);
            if (!m) return color;
            r = parseInt(m[0]); g = parseInt(m[1]); b = parseInt(m[2]);
        }
        return "rgb(" + Math.floor(r * factor) + "," + Math.floor(g * factor) + "," + Math.floor(b * factor) + ")";
    }
}
