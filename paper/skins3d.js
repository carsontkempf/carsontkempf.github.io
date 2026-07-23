/**
 * Skins3D - Pixel-art characters drawn as scaled sprite grids.
 * Each character is a 16x16 pixel art grid rendered with 3D depth:
 * - Each pixel is drawn as a small raised block (isometric style)
 * - Colors include shading to simulate depth
 * - Characters look like tiny 3D voxel figures
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

// Pixel art sprites: 16x16 grids
// Each cell is a color key: 0=transparent, letters=colors defined per sprite
const SPRITES = {};

// --- BUNNY ---
SPRITES.bunny = {
    colors: { w:"#ffffff", W:"#e8e8e8", p:"#ffb8cc", P:"#ff88aa", k:"#111111", n:"#ffa0b0", b:"#fdd9b5" },
    grid: [
        "0000ww0000ww0000",
        "0000ww0000ww0000",
        "0000wp0000pw0000",
        "0000ww0000ww0000",
        "000wwwwwwwwww000",
        "00wwwwwwwwwwww00",
        "00wwkwwwwwwkww00",
        "00wwwwwwnwwwww00",
        "00Wwwwwwwwwwww00",
        "000wwwwwwwwww000",
        "0000WWWWWWWW0000",
        "000WWWWWWWWWW000",
        "00WWWWWWWWWWWW00",
        "00WW00WWWW00WW00",
        "00WW00WWWW00WW00",
        "00pp000000pppp00",
    ]
};

// --- PENGUIN ---
SPRITES.penguin = {
    colors: { k:"#1a1a2e", K:"#333344", w:"#f5f5f5", W:"#dddddd", o:"#ff8c00", O:"#cc7000", e:"#ffffff", p:"#111111" },
    grid: [
        "0000kkkkkk000000",
        "000kkkkkkkkk0000",
        "00kkkekkkekkkk00",
        "00kkpekkkepkkk00",
        "00kkkkkokkkkkkk0",
        "00kkkkkkkkkkkkk0",
        "0Kkkkwwwwwwkkkk0",
        "0Kkkkwwwwwwkkkk0",
        "0KKkkwwwwwwkkKK0",
        "00KKkwwwwwwkKK00",
        "000kkwwwwwwkk000",
        "000kkwwwwwwkk000",
        "0000kkwwwwkk0000",
        "0000kkkkkkkk0000",
        "000oo00000oo0000",
        "000ooo000ooo0000",
    ]
};

// --- FOX ---
SPRITES.fox = {
    colors: { o:"#f07020", O:"#cc5500", w:"#ffffff", W:"#e0e0e0", k:"#111111", n:"#222222", b:"#884400", t:"#ff9040" },
    grid: [
        "0o00000000000o00",
        "0oo0000000000oo0",
        "00ooooooooooooo0",
        "00oookooookoooo0",
        "00ooooowooooooo0",
        "00ooowwwwwooooo0",
        "000oooooooooooo0",
        "0000oooooooooo00",
        "000OOOOOoOOOO000",
        "00OOOOOOOOOOOO00",
        "00OOwwwwwwwwOO00",
        "00OOwwwwwwwwOO00",
        "000OOOOOOOOOO000",
        "000OO0000000OO00",
        "000nn00000000nn0",
        "00000000000ttttt",
    ]
};

// --- PANDA ---
SPRITES.panda = {
    colors: { w:"#ffffff", W:"#e8e8e8", k:"#222222", K:"#444444", p:"#111111", n:"#333333", e:"#ffffff" },
    grid: [
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
        "0kkWWWwwwwWWWkk0",
        "0kkWWWwwwwWWWkk0",
        "00kWWWWWWWWWWk00",
        "00kkWWWWWWWWkk00",
        "000kk0000000kk00",
        "000kk0000000kk00",
    ]
};

// --- OWL ---
SPRITES.owl = {
    colors: { b:"#8B5E3C", B:"#6B3E1C", t:"#d4a574", o:"#ff8c00", O:"#cc7000", w:"#f0dcc0", k:"#111111", y:"#ff9800" },
    grid: [
        "00Bb000000000bB0",
        "00bbb00000bbbbb0",
        "00bbbbbbbbbbbbb0",
        "0bbbwwbbbwwbbbb0",
        "0bbwowbbwowbbbb0",
        "0bbbwwbbbwwbbbb0",
        "0bbbbbbybbbbbb00",
        "00bbbbbbbbbbbb00",
        "00BBbbttttbbBB00",
        "00BBbbttttbbBB00",
        "000Bbbttttbb000B",
        "000Bbbbbbbbb000B",
        "0000Bbbbbbbb0000",
        "0000BBbbbbBB0000",
        "00000yy00yy00000",
        "00000yy00yy00000",
    ]
};

// --- FROG ---
SPRITES.frog = {
    colors: { g:"#2ecc71", G:"#27ae60", l:"#a8e6cf", w:"#ffffff", k:"#111111", d:"#1a7a40" },
    grid: [
        "00ww00000000ww00",
        "0wkww00000wkww00",
        "00ww00000000ww00",
        "00ggggggggggg000",
        "0gggggggggggggg0",
        "0ggggggggggggggg",
        "0gggggddddgggg00",
        "00ggggggggggg000",
        "G00GGGGGGGGGG000",
        "GG0GGGllllGGGG00",
        "GG0GGGllllGGGGG0",
        "GG0GGGllllGGGGG0",
        "000GGGGGGGGGGGG0",
        "000GGGGGGGGGGG00",
        "000GG000000GG000",
        "00ggg00000ggg000",
    ]
};

// --- CHICK ---
SPRITES.chick = {
    colors: { y:"#ffd700", Y:"#f0c000", o:"#ff6600", O:"#cc5500", k:"#111111", w:"#ffffff", b:"#ff8888" },
    grid: [
        "000000YY00000000",
        "00000YYY00000000",
        "0000yyyyyy000000",
        "000yyyyyyyy00000",
        "000yykyyyyky0000",
        "000yyyyyyyyyy000",
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
    ]
};

// --- ASTRONAUT ---
SPRITES.astronaut = {
    colors: { w:"#eeeeee", W:"#cccccc", g:"#888888", G:"#666666", b:"#2a4a8a", B:"#1a1a4e", v:"#4a90d9", s:"#aaaaaa" },
    grid: [
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
        "00ssWWWWWWWWss00",
        "000WWWWWWWWWW000",
        "000WWWWWWWWWW000",
        "000WW0000WW0WW00",
        "000gg000gg00gg00",
        "000ggg00ggg0000",
    ]
};

// --- NINJA ---
SPRITES.ninja = {
    colors: { d:"#2f3542", D:"#1a1a2e", r:"#ff4757", R:"#cc3344", w:"#ffffff", g:"#c0a000", s:"#999999", k:"#111111" },
    grid: [
        "00000000s0000000",
        "000000s0s0000000",
        "0000ddddddd00000",
        "000ddrrrrrdd0000",
        "000ddwddwdddd000",
        "000dddddddddrrr",
        "0000ddddddddd000",
        "000DDDDsDDDDD000",
        "00DDDDDsDDDDDD00",
        "00DDDDDDDDDDD000",
        "00DDgggggggDD000",
        "000DDDDDDDDD0000",
        "000DDDDDDDDD0000",
        "000DD00000DD0000",
        "000DD00000DD0000",
        "000kk00000kk0000",
    ]
};

// --- SKATER ---
SPRITES.skateboard = {
    colors: { h:"#fdd9b5", H:"#eec9a5", c:"#333333", C:"#222222", s:"#00d2ff", S:"#0099bb", b:"#8B4513", k:"#444444", j:"#3366cc", J:"#2244aa" },
    grid: [
        "0000ccccc0000000",
        "0000cccccc000000",
        "000hhcccchh00000",
        "000hhhhhhhh00000",
        "000hhkhhkhhh0000",
        "000hhhhhhhhh0000",
        "0000ssssssss0000",
        "000ssssssssss000",
        "00Sssssssssss000",
        "00Sssssssssss000",
        "000jjjjjjjjj0000",
        "000jjjjjjjjjj000",
        "000jj0000jjjj000",
        "000kk0000kkk0000",
        "00bbbbbbbbbbb000",
        "00k00k000k00k000",
    ]
};

// --- SKIER ---
SPRITES.skis = {
    colors: { r:"#e74c3c", R:"#cc3333", h:"#fdd9b5", o:"#ffa500", O:"#cc8400", w:"#ffffff", k:"#222222", b:"#1e90ff", g:"#888888", K:"#333333" },
    grid: [
        "000000ww00000000",
        "0000rrrrrr000000",
        "000rrooorrrr0000",
        "000rrKKKKrrr0000",
        "000hhhhhhhh00000",
        "000rrrrrrrrrr000",
        "00rrrrrrrrrrrr00",
        "0grrrrrrrrrrrg00",
        "0g0rrrrrrrrr0g00",
        "000KKKKKKKKKK000",
        "000KK0000KKKK000",
        "000KK0000KKKK000",
        "000kk0000kkkk000",
        "00bbb000bbbb0000",
        "00bbb000bbbb0000",
        "00bbb000bbbb0000",
    ]
};

// --- HOVERBOARD ---
SPRITES.hoverboard = {
    colors: { d:"#2c3e50", D:"#1a252f", c:"#00d2ff", C:"#0099bb", p:"#7b2ff7", P:"#5a1fb7", g:"#00ff88", h:"#1a252f", k:"#111111" },
    grid: [
        "0000DDDDDDdd0000",
        "000DDcccccDDd000",
        "000DDDDDDDDDd000",
        "000DDDDDDDDDD000",
        "000DDkDDkDDDD000",
        "0000DDDDDDDD0000",
        "000ddddddddddd00",
        "00dddddcdddddd00",
        "00dddddddddddd00",
        "000ddddddddddd00",
        "000dd00000dd0000",
        "000kk00000kk0000",
        "0000kk000kk00000",
        "0pppccccccccpp00",
        "0PCCccccccccCP00",
        "00gggg00gggggg00",
    ]
};

// --- DROPLET (simple) ---
SPRITES.droplet = {
    colors: { c:"#00d2ff", C:"#0099bb", w:"#ffffff", W:"#aaeeff", k:"#111111" },
    grid: [
        "0000000cc0000000",
        "000000cccc000000",
        "00000cccccc00000",
        "0000cccccccc0000",
        "000ccWccccccc000",
        "00cccWccccccc000",
        "00cccccccccccc00",
        "0ccccccccccccc00",
        "0ccccckcckccccc0",
        "0ccccccccccccc00",
        "00cccccccccccc00",
        "00ccccccccccc000",
        "000cccccccccc000",
        "0000Cccccccc0000",
        "00000CCCCCC00000",
        "0000000CC0000000",
    ]
};

class Skins3DRenderer {
    constructor() {
        this._cache = {};
    }

    draw(ctx, x, y, r, angle, skinId, playerColor) {
        var sprite = SPRITES[skinId] || SPRITES.droplet;
        var size = r * 2;
        var pixelSize = size / 16;

        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(x, y + r * 0.85, r * 0.5, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fill();

        // Draw each pixel as a 3D-ish block
        var startX = x - size / 2;
        var startY = y - size / 2;

        for (var row = 0; row < 16; row++) {
            var line = sprite.grid[row];
            for (var col = 0; col < 16; col++) {
                var ch = line[col];
                if (ch === "0") continue;

                var color = sprite.colors[ch];
                if (!color) continue;

                // If color is the player-mapped color, use player color
                if (ch === "c") color = playerColor;
                if (ch === "C") color = this.darken(playerColor, 0.7);

                var px = startX + col * pixelSize;
                var py = startY + row * pixelSize;

                // Main pixel face
                ctx.fillStyle = color;
                ctx.fillRect(px, py, pixelSize + 0.5, pixelSize + 0.5);

                // Top edge highlight (lighter)
                ctx.fillStyle = this.lighten(color, 0.2);
                ctx.fillRect(px, py, pixelSize + 0.5, pixelSize * 0.2);

                // Bottom/right shadow (darker)
                ctx.fillStyle = this.darken(color, 0.7);
                ctx.fillRect(px, py + pixelSize * 0.8, pixelSize + 0.5, pixelSize * 0.2);
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
