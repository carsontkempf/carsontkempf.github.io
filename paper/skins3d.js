/**
 * Skins3D - Crossy Road style 3D characters.
 * Each character is built from stacked 3D cuboids (boxes).
 * Each box has: top face, front face, right face (isometric 3/4 view).
 * Characters rotate by selecting different face visibility per angle.
 */

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

// Character models: arrays of 3D boxes
// Each box: [x, y, z, width, height, depth, color]
// x,y,z are relative to center (0,0,0), normalized to -1..1 range
// Colors: use string keys that map to actual colors per character

const MODELS = {};

MODELS.bunny = [
    // Body
    { x:0, y:0, z:0, w:0.5, h:0.5, d:0.4, c:"body" },
    // Head
    { x:0, y:-0.45, z:0.05, w:0.4, h:0.4, d:0.35, c:"head" },
    // Left ear
    { x:-0.12, y:-0.85, z:0, w:0.08, h:0.35, d:0.06, c:"head" },
    // Right ear
    { x:0.12, y:-0.85, z:0, w:0.08, h:0.35, d:0.06, c:"head" },
    // Inner ears (pink)
    { x:-0.12, y:-0.82, z:0.03, w:0.04, h:0.25, d:0.02, c:"accent" },
    { x:0.12, y:-0.82, z:0.03, w:0.04, h:0.25, d:0.02, c:"accent" },
    // Left leg
    { x:-0.15, y:0.35, z:0, w:0.12, h:0.2, d:0.12, c:"body" },
    // Right leg
    { x:0.15, y:0.35, z:0, w:0.12, h:0.2, d:0.12, c:"body" },
    // Feet
    { x:-0.15, y:0.5, z:0.03, w:0.14, h:0.06, d:0.14, c:"accent" },
    { x:0.15, y:0.5, z:0.03, w:0.14, h:0.06, d:0.14, c:"accent" },
    // Tail (back)
    { x:0, y:0.1, z:-0.25, w:0.1, h:0.1, d:0.1, c:"head" },
    // Eyes
    { x:-0.1, y:-0.42, z:0.18, w:0.06, h:0.06, d:0.02, c:"eye" },
    { x:0.1, y:-0.42, z:0.18, w:0.06, h:0.06, d:0.02, c:"eye" },
    // Nose
    { x:0, y:-0.35, z:0.2, w:0.05, h:0.04, d:0.02, c:"nose" },
];

MODELS.penguin = [
    { x:0, y:0, z:0, w:0.45, h:0.55, d:0.4, c:"body" },
    { x:0, y:0.05, z:0.1, w:0.3, h:0.4, d:0.1, c:"belly" },
    { x:0, y:-0.4, z:0, w:0.35, h:0.35, d:0.3, c:"body" },
    { x:-0.25, y:0, z:0, w:0.08, h:0.3, d:0.15, c:"body" },
    { x:0.25, y:0, z:0, w:0.08, h:0.3, d:0.15, c:"body" },
    { x:-0.12, y:0.4, z:0.05, w:0.14, h:0.06, d:0.14, c:"feet" },
    { x:0.12, y:0.4, z:0.05, w:0.14, h:0.06, d:0.14, c:"feet" },
    { x:-0.08, y:-0.4, z:0.15, w:0.06, h:0.06, d:0.02, c:"eye" },
    { x:0.08, y:-0.4, z:0.15, w:0.06, h:0.06, d:0.02, c:"eye" },
    { x:0, y:-0.3, z:0.18, w:0.08, h:0.05, d:0.04, c:"feet" },
];

MODELS.fox = [
    { x:0, y:0, z:0, w:0.45, h:0.5, d:0.35, c:"body" },
    { x:0, y:0.1, z:0.08, w:0.25, h:0.25, d:0.1, c:"belly" },
    { x:0, y:-0.4, z:0.02, w:0.35, h:0.35, d:0.3, c:"body" },
    { x:-0.18, y:-0.62, z:0, w:0.1, h:0.15, d:0.06, c:"body" },
    { x:0.18, y:-0.62, z:0, w:0.1, h:0.15, d:0.06, c:"body" },
    { x:0, y:-0.32, z:0.16, w:0.12, h:0.08, d:0.06, c:"belly" },
    { x:-0.12, y:0.35, z:0, w:0.1, h:0.2, d:0.1, c:"dark" },
    { x:0.12, y:0.35, z:0, w:0.1, h:0.2, d:0.1, c:"dark" },
    { x:0.3, y:0.15, z:-0.15, w:0.12, h:0.12, d:0.3, c:"body" },
    { x:0.38, y:0.25, z:-0.15, w:0.08, h:0.08, d:0.08, c:"belly" },
    { x:-0.08, y:-0.4, z:0.16, w:0.05, h:0.05, d:0.02, c:"eye" },
    { x:0.08, y:-0.4, z:0.16, w:0.05, h:0.05, d:0.02, c:"eye" },
    { x:0, y:-0.3, z:0.18, w:0.04, h:0.04, d:0.02, c:"dark" },
];

MODELS.panda = [
    { x:0, y:0, z:0, w:0.5, h:0.55, d:0.4, c:"body" },
    { x:0, y:0, z:0, w:0.48, h:0.53, d:0.38, c:"belly" },
    { x:-0.22, y:-0.05, z:0, w:0.12, h:0.28, d:0.12, c:"dark" },
    { x:0.22, y:-0.05, z:0, w:0.12, h:0.28, d:0.12, c:"dark" },
    { x:-0.12, y:0.35, z:0, w:0.12, h:0.18, d:0.12, c:"dark" },
    { x:0.12, y:0.35, z:0, w:0.12, h:0.18, d:0.12, c:"dark" },
    { x:0, y:-0.4, z:0, w:0.4, h:0.38, d:0.35, c:"belly" },
    { x:-0.18, y:-0.55, z:0, w:0.1, h:0.1, d:0.1, c:"dark" },
    { x:0.18, y:-0.55, z:0, w:0.1, h:0.1, d:0.1, c:"dark" },
    { x:-0.1, y:-0.42, z:0.14, w:0.1, h:0.1, d:0.04, c:"dark" },
    { x:0.1, y:-0.42, z:0.14, w:0.1, h:0.1, d:0.04, c:"dark" },
    { x:-0.1, y:-0.42, z:0.16, w:0.04, h:0.04, d:0.02, c:"eye" },
    { x:0.1, y:-0.42, z:0.16, w:0.04, h:0.04, d:0.02, c:"eye" },
    { x:0, y:-0.32, z:0.18, w:0.05, h:0.04, d:0.02, c:"dark" },
];

MODELS.owl = [
    { x:0, y:0, z:0, w:0.4, h:0.5, d:0.35, c:"body" },
    { x:0, y:0.15, z:0.05, w:0.25, h:0.25, d:0.1, c:"belly" },
    { x:-0.22, y:0, z:0, w:0.1, h:0.35, d:0.12, c:"dark" },
    { x:0.22, y:0, z:0, w:0.1, h:0.35, d:0.12, c:"dark" },
    { x:0, y:-0.4, z:0, w:0.38, h:0.35, d:0.32, c:"body" },
    { x:-0.15, y:-0.6, z:0, w:0.08, h:0.12, d:0.06, c:"dark" },
    { x:0.15, y:-0.6, z:0, w:0.08, h:0.12, d:0.06, c:"dark" },
    { x:-0.1, y:-0.4, z:0.14, w:0.1, h:0.1, d:0.06, c:"accent" },
    { x:0.1, y:-0.4, z:0.14, w:0.1, h:0.1, d:0.06, c:"accent" },
    { x:-0.1, y:-0.4, z:0.17, w:0.05, h:0.05, d:0.02, c:"eye" },
    { x:0.1, y:-0.4, z:0.17, w:0.05, h:0.05, d:0.02, c:"eye" },
    { x:0, y:-0.3, z:0.18, w:0.06, h:0.06, d:0.04, c:"feet" },
    { x:-0.1, y:0.4, z:0.05, w:0.08, h:0.06, d:0.1, c:"feet" },
    { x:0.1, y:0.4, z:0.05, w:0.08, h:0.06, d:0.1, c:"feet" },
];

MODELS.frog = [
    { x:0, y:0, z:0, w:0.5, h:0.35, d:0.4, c:"body" },
    { x:0, y:0.05, z:0.08, w:0.35, h:0.2, d:0.1, c:"belly" },
    { x:0, y:-0.3, z:0, w:0.45, h:0.3, d:0.35, c:"body" },
    { x:-0.2, y:-0.38, z:0.1, w:0.1, h:0.1, d:0.1, c:"eye_w" },
    { x:0.2, y:-0.38, z:0.1, w:0.1, h:0.1, d:0.1, c:"eye_w" },
    { x:-0.2, y:-0.38, z:0.15, w:0.05, h:0.05, d:0.02, c:"eye" },
    { x:0.2, y:-0.38, z:0.15, w:0.05, h:0.05, d:0.02, c:"eye" },
    { x:-0.25, y:0.2, z:0, w:0.14, h:0.18, d:0.14, c:"body" },
    { x:0.25, y:0.2, z:0, w:0.14, h:0.18, d:0.14, c:"body" },
    { x:-0.15, y:0.35, z:0.04, w:0.12, h:0.05, d:0.14, c:"body" },
    { x:0.15, y:0.35, z:0.04, w:0.12, h:0.05, d:0.14, c:"body" },
];

MODELS.chick = [
    { x:0, y:0, z:0, w:0.4, h:0.4, d:0.35, c:"body" },
    { x:0, y:-0.35, z:0, w:0.35, h:0.32, d:0.3, c:"body" },
    { x:-0.2, y:0, z:0, w:0.08, h:0.18, d:0.1, c:"body" },
    { x:0.2, y:0, z:0, w:0.08, h:0.18, d:0.1, c:"body" },
    { x:0, y:-0.55, z:0, w:0.04, h:0.12, d:0.03, c:"accent" },
    { x:-0.06, y:-0.52, z:0, w:0.03, h:0.08, d:0.03, c:"accent" },
    { x:0.06, y:-0.52, z:0, w:0.03, h:0.08, d:0.03, c:"accent" },
    { x:-0.08, y:-0.35, z:0.15, w:0.05, h:0.05, d:0.02, c:"eye" },
    { x:0.08, y:-0.35, z:0.15, w:0.05, h:0.05, d:0.02, c:"eye" },
    { x:0, y:-0.25, z:0.18, w:0.06, h:0.05, d:0.04, c:"feet" },
    { x:-0.08, y:0.3, z:0.03, w:0.08, h:0.05, d:0.1, c:"feet" },
    { x:0.08, y:0.3, z:0.03, w:0.08, h:0.05, d:0.1, c:"feet" },
];

MODELS.droplet = [
    { x:0, y:0, z:0, w:0.45, h:0.5, d:0.4, c:"body" },
    { x:0, y:-0.35, z:0, w:0.3, h:0.3, d:0.25, c:"body" },
    { x:0, y:-0.55, z:0, w:0.15, h:0.15, d:0.12, c:"body" },
    { x:-0.08, y:-0.1, z:0.2, w:0.05, h:0.06, d:0.02, c:"eye" },
    { x:0.08, y:-0.1, z:0.2, w:0.05, h:0.06, d:0.02, c:"eye" },
];

MODELS.astronaut = MODELS.droplet;
MODELS.ninja = MODELS.fox;
MODELS.skateboard = MODELS.bunny;
MODELS.skis = MODELS.penguin;
MODELS.hoverboard = MODELS.chick;

// Color palettes per skin
const PALETTES = {
    bunny:   { body:"#ffffff", head:"#ffffff", belly:"#ffffff", accent:"#ffaacc", dark:"#dddddd", eye:"#111111", nose:"#ff8899", eye_w:"#ffffff", feet:"#ff9800" },
    penguin: { body:"#1a1a2e", head:"#1a1a2e", belly:"#f5f5f5", accent:"#ffaacc", dark:"#333344", eye:"#ffffff", nose:"#111111", eye_w:"#ffffff", feet:"#ff8c00" },
    fox:     { body:"#f07020", head:"#f07020", belly:"#ffffff", accent:"#ffaacc", dark:"#222222", eye:"#111111", nose:"#222222", eye_w:"#ffffff", feet:"#ff8c00" },
    panda:   { body:"#ffffff", head:"#ffffff", belly:"#ffffff", accent:"#ffaacc", dark:"#222222", eye:"#ffffff", nose:"#333333", eye_w:"#ffffff", feet:"#ff8c00" },
    owl:     { body:"#8B5E3C", head:"#8B5E3C", belly:"#d4a574", accent:"#f0dcc0", dark:"#6B3E1C", eye:"#111111", nose:"#111111", eye_w:"#ffffff", feet:"#ff9800" },
    frog:    { body:"#2ecc71", head:"#2ecc71", belly:"#a8e6cf", accent:"#ffaacc", dark:"#1a7a40", eye:"#111111", nose:"#111111", eye_w:"#ffffff", feet:"#ff9800" },
    chick:   { body:"#ffd700", head:"#ffd700", belly:"#ffd700", accent:"#f0a000", dark:"#cc9900", eye:"#111111", nose:"#111111", eye_w:"#ffffff", feet:"#ff6600" },
    droplet: { body:"#00d2ff", head:"#00d2ff", belly:"#00d2ff", accent:"#0099bb", dark:"#007799", eye:"#111111", nose:"#111111", eye_w:"#ffffff", feet:"#ff9800" },
    astronaut:{ body:"#eeeeee", head:"#eeeeee", belly:"#eeeeee", accent:"#2a4a8a", dark:"#888888", eye:"#111111", nose:"#111111", eye_w:"#ffffff", feet:"#666666" },
    ninja:   { body:"#2f3542", head:"#2f3542", belly:"#2f3542", accent:"#ff4757", dark:"#111111", eye:"#ffffff", nose:"#111111", eye_w:"#ffffff", feet:"#222222" },
    skateboard:{ body:"#00d2ff", head:"#fdd9b5", belly:"#00d2ff", accent:"#8B4513", dark:"#333333", eye:"#111111", nose:"#111111", eye_w:"#ffffff", feet:"#444444" },
    skis:    { body:"#e74c3c", head:"#fdd9b5", belly:"#e74c3c", accent:"#1e90ff", dark:"#222222", eye:"#111111", nose:"#111111", eye_w:"#ffffff", feet:"#444444" },
    hoverboard:{ body:"#2c3e50", head:"#2c3e50", belly:"#2c3e50", accent:"#00d2ff", dark:"#1a252f", eye:"#00d2ff", nose:"#111111", eye_w:"#ffffff", feet:"#7b2ff7" },
};

class Skins3DRenderer {
    constructor() {
        // Camera: 30 degrees from horizontal (mostly front, some top visible)
        this.camTilt = Math.PI / 6; // 30 degrees
        this.cosT = Math.cos(this.camTilt); // ~0.866 (how much front face shows)
        this.sinT = Math.sin(this.camTilt); // ~0.5 (how much top face shows)
    }

    draw(ctx, x, y, r, angle, skinId, playerColor) {
        var model = MODELS[skinId] || MODELS.droplet;
        var palette = PALETTES[skinId] || PALETTES.droplet;

        // Character rotation around vertical axis (Y)
        var a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        var cosA = Math.cos(a);
        var sinA = Math.sin(a);

        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(x, y + r * 0.75, r * 0.4, r * 0.12, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fill();

        // Transform and sort all boxes
        var projected = [];
        for (var i = 0; i < model.length; i++) {
            var box = model[i];
            var color = palette[box.c] || playerColor;
            if (box.c === "body" && (skinId === "droplet" || skinId === "skateboard")) color = playerColor;

            // Rotate around Y axis by character angle
            var rx = box.x * cosA + box.z * sinA;
            var ry = box.y;
            var rz = -box.x * sinA + box.z * cosA;

            // Project: camera at 30deg tilt looking at character
            // screenX = rx (sideways stays same)
            // screenY = ry * cosT - rz * sinT (Y compressed by tilt, Z lifts up)
            var sx = x + rx * r * 1.3;
            var sy = y + (ry * this.cosT - rz * this.sinT) * r * 1.3;

            // Sort depth: things further from camera drawn first
            var depthSort = rz * this.cosT + ry * this.sinT;

            projected.push({
                sx: sx, sy: sy,
                w: box.w * r * 1.3,
                h: box.h * r * 1.3 * this.cosT, // height compressed by viewing angle
                d: box.d * r * 1.3 * this.sinT,  // depth visible as vertical from tilt
                color: color,
                depth: depthSort,
                rx: rx, rz: rz,
            });
        }

        // Sort back-to-front
        projected.sort(function(a2, b2) { return a2.depth - b2.depth; });

        // Draw each box
        for (var i = 0; i < projected.length; i++) {
            var p = projected[i];
            this._drawBox3D(ctx, p.sx, p.sy, p.w, p.h, p.d, p.color, sinA, cosA);
        }
    }

    _drawBox3D(ctx, x, y, w, h, topH, color, sinA, cosA) {
        // topH = how much of the top face is visible (from camera tilt)
        var topColor = this._lighten(color, 0.25);
        var frontColor = color;
        var rightColor = this._darken(color, 0.7);
        var leftColor = this._darken(color, 0.6);

        // TOP FACE (always visible at 30deg camera)
        if (topH > 0.5) {
            ctx.beginPath();
            ctx.moveTo(x - w, y - h);
            ctx.lineTo(x + w, y - h);
            ctx.lineTo(x + w, y - h - topH);
            ctx.lineTo(x - w, y - h - topH);
            ctx.closePath();
            ctx.fillStyle = topColor;
            ctx.fill();
        }

        // FRONT FACE (main rectangle - always visible)
        ctx.beginPath();
        ctx.rect(x - w, y - h, w * 2, h * 2);
        ctx.fillStyle = frontColor;
        ctx.fill();

        // RIGHT SIDE (visible based on character rotation)
        if (sinA > 0.1) {
            var sideW = w * 0.6 * sinA;
            ctx.beginPath();
            ctx.moveTo(x + w, y - h - topH);
            ctx.lineTo(x + w + sideW, y - h - topH * 0.7);
            ctx.lineTo(x + w + sideW, y + h - topH * 0.7);
            ctx.lineTo(x + w, y + h);
            ctx.closePath();
            ctx.fillStyle = rightColor;
            ctx.fill();
        }

        // LEFT SIDE (visible based on character rotation)
        if (sinA < -0.1) {
            var sideW = w * 0.6 * (-sinA);
            ctx.beginPath();
            ctx.moveTo(x - w, y - h - topH);
            ctx.lineTo(x - w - sideW, y - h - topH * 0.7);
            ctx.lineTo(x - w - sideW, y + h - topH * 0.7);
            ctx.lineTo(x - w, y + h);
            ctx.closePath();
            ctx.fillStyle = leftColor;
            ctx.fill();
        }
    }

    _lighten(color, amount) {
        var r, g, b;
        if (color[0] === "#") {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        } else { return color; }
        r = Math.min(255, r + Math.floor(255 * amount));
        g = Math.min(255, g + Math.floor(255 * amount));
        b = Math.min(255, b + Math.floor(255 * amount));
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    _darken(color, factor) {
        var r, g, b;
        if (color[0] === "#") {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        } else { return color; }
        return "rgb(" + Math.floor(r * factor) + "," + Math.floor(g * factor) + "," + Math.floor(b * factor) + ")";
    }
}
