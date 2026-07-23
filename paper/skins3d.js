/**
 * Skins3D - Pixel-art style 3D characters for mobile paper.io game.
 * Each character is a fully drawn figure with body, head, limbs, accessories.
 * Rendered at 5x player radius for visibility on mobile.
 */

// Polyfill roundRect
if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        var r = typeof radii === "number" ? radii : (radii && radii[0] || 0);
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        this.closePath();
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

class Skins3DRenderer {
    constructor() {}

    draw(ctx, x, y, r, angle, skinId, color) {
        ctx.save();
        ctx.translate(x, y);
        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(0, r * 0.8, r * 0.5, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fill();

        switch (skinId) {
            case "bunny": this.drawBunny(ctx, r, color); break;
            case "penguin": this.drawPenguin(ctx, r, color); break;
            case "fox": this.drawFox(ctx, r, color); break;
            case "panda": this.drawPanda(ctx, r, color); break;
            case "owl": this.drawOwl(ctx, r, color); break;
            case "frog": this.drawFrog(ctx, r, color); break;
            case "chick": this.drawChick(ctx, r, color); break;
            case "skateboard": this.drawSkater(ctx, r, color); break;
            case "skis": this.drawSkier(ctx, r, color); break;
            case "hoverboard": this.drawHoverboard(ctx, r, color); break;
            case "astronaut": this.drawAstronaut(ctx, r, color); break;
            case "ninja": this.drawNinja(ctx, r, color); break;
            default: this.drawDroplet(ctx, r, color); break;
        }
        ctx.restore();
    }

    // --- DROPLET (default) ---
    drawDroplet(ctx, r, color) {
        // Teardrop body
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.7);
        ctx.bezierCurveTo(r * 0.5, -r * 0.3, r * 0.5, r * 0.3, 0, r * 0.6);
        ctx.bezierCurveTo(-r * 0.5, r * 0.3, -r * 0.5, -r * 0.3, 0, -r * 0.7);
        ctx.closePath();
        this.fill3D(ctx, 0, 0, r * 0.6, color);
        // Eyes
        this.drawEyes(ctx, r * 0.35, -r * 0.15, -r * 0.1);
        // Highlight
        this.specular(ctx, -r * 0.12, -r * 0.35, r * 0.1);
    }

    // --- BUNNY ---
    drawBunny(ctx, r, color) {
        // Feet
        this.pill(ctx, -r * 0.2, r * 0.55, r * 0.15, r * 0.1, "#f8c8dc");
        this.pill(ctx, r * 0.2, r * 0.55, r * 0.15, r * 0.1, "#f8c8dc");
        // Body (oval torso)
        ctx.beginPath();
        ctx.ellipse(0, r * 0.2, r * 0.35, r * 0.4, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, r * 0.2, r * 0.4, "#f0f0f0");
        // Arms
        this.pill(ctx, -r * 0.4, r * 0.1, r * 0.1, r * 0.2, "#e8e8e8");
        this.pill(ctx, r * 0.4, r * 0.1, r * 0.1, r * 0.2, "#e8e8e8");
        // Head
        ctx.beginPath();
        ctx.arc(0, -r * 0.25, r * 0.3, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.25, r * 0.3, "#fff");
        // Ears (tall ovals)
        this.pill(ctx, -r * 0.12, -r * 0.7, r * 0.08, r * 0.3, "#fff");
        this.pill(ctx, r * 0.12, -r * 0.7, r * 0.08, r * 0.3, "#fff");
        // Inner ears (pink)
        this.pill(ctx, -r * 0.12, -r * 0.68, r * 0.04, r * 0.2, "#f8a0b8");
        this.pill(ctx, r * 0.12, -r * 0.68, r * 0.04, r * 0.2, "#f8a0b8");
        // Face
        this.drawEyes(ctx, r * 0.32, -r * 0.15, -r * 0.28);
        // Nose (pink triangle)
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.2);
        ctx.lineTo(-r * 0.04, -r * 0.15);
        ctx.lineTo(r * 0.04, -r * 0.15);
        ctx.closePath();
        ctx.fillStyle = "#f08090";
        ctx.fill();
        // Cheeks
        ctx.globalAlpha = 0.3;
        ctx.beginPath(); ctx.arc(-r * 0.18, -r * 0.15, r * 0.06, 0, Math.PI * 2);
        ctx.fillStyle = "#ff8888"; ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.18, -r * 0.15, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        this.specular(ctx, -r * 0.1, -r * 0.4, r * 0.08);
    }

    // --- PENGUIN ---
    drawPenguin(ctx, r, color) {
        // Feet (orange)
        this.pill(ctx, -r * 0.15, r * 0.6, r * 0.12, r * 0.06, "#ff9800");
        this.pill(ctx, r * 0.15, r * 0.6, r * 0.12, r * 0.06, "#ff9800");
        // Body (black oval)
        ctx.beginPath();
        ctx.ellipse(0, r * 0.15, r * 0.35, r * 0.5, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, r * 0.15, r * 0.45, "#222");
        // White belly
        ctx.beginPath();
        ctx.ellipse(0, r * 0.25, r * 0.22, r * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#f5f5f5";
        ctx.fill();
        // Wings/flippers
        ctx.save();
        ctx.translate(-r * 0.35, r * 0.1);
        ctx.rotate(-0.2);
        this.pill(ctx, 0, 0, r * 0.08, r * 0.25, "#333");
        ctx.restore();
        ctx.save();
        ctx.translate(r * 0.35, r * 0.1);
        ctx.rotate(0.2);
        this.pill(ctx, 0, 0, r * 0.08, r * 0.25, "#333");
        ctx.restore();
        // Head (black circle)
        ctx.beginPath();
        ctx.arc(0, -r * 0.3, r * 0.25, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.3, r * 0.25, "#1a1a1a");
        // Eyes (white circles with black pupils)
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(-r * 0.1, -r * 0.32, r * 0.07, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.1, -r * 0.32, r * 0.07, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(-r * 0.09, -r * 0.31, r * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.11, -r * 0.31, r * 0.04, 0, Math.PI * 2); ctx.fill();
        // Beak (orange)
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.22);
        ctx.lineTo(-r * 0.06, -r * 0.15);
        ctx.lineTo(r * 0.06, -r * 0.15);
        ctx.closePath();
        ctx.fillStyle = "#ff9800";
        ctx.fill();
        this.specular(ctx, -r * 0.08, -r * 0.45, r * 0.06);
    }

    // --- FOX ---
    drawFox(ctx, r, color) {
        // Tail (big bushy behind body)
        ctx.beginPath();
        ctx.ellipse(r * 0.3, r * 0.3, r * 0.2, r * 0.35, 0.5, 0, Math.PI * 2);
        this.fill3D(ctx, r * 0.3, r * 0.3, r * 0.25, "#e85d04");
        // White tail tip
        ctx.beginPath();
        ctx.arc(r * 0.4, r * 0.55, r * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();
        // Feet
        this.pill(ctx, -r * 0.15, r * 0.55, r * 0.08, r * 0.08, "#333");
        this.pill(ctx, r * 0.15, r * 0.55, r * 0.08, r * 0.08, "#333");
        // Body (orange)
        ctx.beginPath();
        ctx.ellipse(0, r * 0.15, r * 0.3, r * 0.4, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, r * 0.15, r * 0.35, "#f07020");
        // White chest
        ctx.beginPath();
        ctx.ellipse(0, r * 0.25, r * 0.15, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();
        // Head (orange, slightly pointed)
        ctx.beginPath();
        ctx.arc(0, -r * 0.25, r * 0.28, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.25, r * 0.28, "#f07020");
        // Ears (triangles)
        ctx.fillStyle = "#e85d04";
        ctx.beginPath(); ctx.moveTo(-r * 0.2, -r * 0.5); ctx.lineTo(-r * 0.3, -r * 0.75); ctx.lineTo(-r * 0.08, -r * 0.5); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(r * 0.2, -r * 0.5); ctx.lineTo(r * 0.3, -r * 0.75); ctx.lineTo(r * 0.08, -r * 0.5); ctx.closePath(); ctx.fill();
        // Inner ears
        ctx.fillStyle = "#f8c8dc";
        ctx.beginPath(); ctx.moveTo(-r * 0.17, -r * 0.52); ctx.lineTo(-r * 0.25, -r * 0.68); ctx.lineTo(-r * 0.11, -r * 0.52); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(r * 0.17, -r * 0.52); ctx.lineTo(r * 0.25, -r * 0.68); ctx.lineTo(r * 0.11, -r * 0.52); ctx.closePath(); ctx.fill();
        // White muzzle
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.15, r * 0.13, r * 0.1, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();
        // Nose
        ctx.beginPath(); ctx.arc(0, -r * 0.18, r * 0.04, 0, Math.PI * 2);
        ctx.fillStyle = "#222"; ctx.fill();
        // Eyes
        this.drawEyes(ctx, r * 0.3, -r * 0.12, -r * 0.3);
        this.specular(ctx, -r * 0.08, -r * 0.42, r * 0.07);
    }

    // --- PANDA ---
    drawPanda(ctx, r, color) {
        // Body (round white)
        ctx.beginPath();
        ctx.ellipse(0, r * 0.15, r * 0.35, r * 0.45, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, r * 0.15, r * 0.4, "#f8f8f8");
        // Black arms
        this.pill(ctx, -r * 0.4, r * 0.05, r * 0.12, r * 0.22, "#222");
        this.pill(ctx, r * 0.4, r * 0.05, r * 0.12, r * 0.22, "#222");
        // Black legs
        this.pill(ctx, -r * 0.18, r * 0.55, r * 0.12, r * 0.12, "#222");
        this.pill(ctx, r * 0.18, r * 0.55, r * 0.12, r * 0.12, "#222");
        // Head (white)
        ctx.beginPath();
        ctx.arc(0, -r * 0.28, r * 0.3, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.28, r * 0.3, "#fff");
        // Ears (black)
        ctx.fillStyle = "#222";
        ctx.beginPath(); ctx.arc(-r * 0.22, -r * 0.52, r * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.22, -r * 0.52, r * 0.1, 0, Math.PI * 2); ctx.fill();
        // Eye patches (black ovals)
        ctx.fillStyle = "#222";
        ctx.beginPath(); ctx.ellipse(-r * 0.12, -r * 0.28, r * 0.1, r * 0.12, -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(r * 0.12, -r * 0.28, r * 0.1, r * 0.12, 0.2, 0, Math.PI * 2); ctx.fill();
        // Eyes (white dots in patches)
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(-r * 0.11, -r * 0.28, r * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.11, -r * 0.28, r * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(-r * 0.11, -r * 0.27, r * 0.025, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.11, -r * 0.27, r * 0.025, 0, Math.PI * 2); ctx.fill();
        // Nose
        ctx.beginPath(); ctx.ellipse(0, -r * 0.18, r * 0.04, r * 0.03, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#333"; ctx.fill();
        this.specular(ctx, -r * 0.1, -r * 0.45, r * 0.07);
    }

    // --- OWL ---
    drawOwl(ctx, r, color) {
        // Body (brown, egg shape)
        ctx.beginPath();
        ctx.ellipse(0, r * 0.2, r * 0.3, r * 0.45, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, r * 0.2, r * 0.4, "#8B5E3C");
        // Wing feathers (darker patches)
        ctx.beginPath(); ctx.ellipse(-r * 0.3, r * 0.15, r * 0.1, r * 0.3, -0.2, 0, Math.PI * 2);
        ctx.fillStyle = "#6B3E1C"; ctx.fill();
        ctx.beginPath(); ctx.ellipse(r * 0.3, r * 0.15, r * 0.1, r * 0.3, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = "#6B3E1C"; ctx.fill();
        // Belly (lighter)
        ctx.beginPath(); ctx.ellipse(0, r * 0.3, r * 0.18, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#d4a574"; ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(0, -r * 0.25, r * 0.28, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.25, r * 0.28, "#8B5E3C");
        // Ear tufts
        ctx.fillStyle = "#6B3E1C";
        ctx.beginPath(); ctx.moveTo(-r * 0.18, -r * 0.48); ctx.lineTo(-r * 0.25, -r * 0.72); ctx.lineTo(-r * 0.08, -r * 0.5); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(r * 0.18, -r * 0.48); ctx.lineTo(r * 0.25, -r * 0.72); ctx.lineTo(r * 0.08, -r * 0.5); ctx.closePath(); ctx.fill();
        // Eye discs (light circles)
        ctx.fillStyle = "#f0dcc0";
        ctx.beginPath(); ctx.arc(-r * 0.12, -r * 0.25, r * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.12, -r * 0.25, r * 0.12, 0, Math.PI * 2); ctx.fill();
        // Big eyes (orange with black)
        ctx.fillStyle = "#ff8c00";
        ctx.beginPath(); ctx.arc(-r * 0.12, -r * 0.25, r * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.12, -r * 0.25, r * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(-r * 0.12, -r * 0.24, r * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.12, -r * 0.24, r * 0.04, 0, Math.PI * 2); ctx.fill();
        // Beak
        ctx.beginPath(); ctx.moveTo(0, -r * 0.18); ctx.lineTo(-r * 0.04, -r * 0.1); ctx.lineTo(r * 0.04, -r * 0.1); ctx.closePath();
        ctx.fillStyle = "#ff9800"; ctx.fill();
        // Feet
        this.pill(ctx, -r * 0.12, r * 0.6, r * 0.08, r * 0.05, "#ff9800");
        this.pill(ctx, r * 0.12, r * 0.6, r * 0.08, r * 0.05, "#ff9800");
        this.specular(ctx, -r * 0.08, -r * 0.42, r * 0.06);
    }

    // --- FROG ---
    drawFrog(ctx, r, color) {
        // Body (green, squat)
        ctx.beginPath();
        ctx.ellipse(0, r * 0.2, r * 0.38, r * 0.35, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, r * 0.2, r * 0.35, "#2ecc71");
        // Light belly
        ctx.beginPath(); ctx.ellipse(0, r * 0.3, r * 0.22, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#a8e6cf"; ctx.fill();
        // Back legs (bent)
        this.pill(ctx, -r * 0.35, r * 0.45, r * 0.12, r * 0.15, "#27ae60");
        this.pill(ctx, r * 0.35, r * 0.45, r * 0.12, r * 0.15, "#27ae60");
        // Front legs
        this.pill(ctx, -r * 0.3, r * 0.15, r * 0.07, r * 0.15, "#27ae60");
        this.pill(ctx, r * 0.3, r * 0.15, r * 0.07, r * 0.15, "#27ae60");
        // Head (wide)
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.15, r * 0.32, r * 0.25, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.15, r * 0.28, "#2ecc71");
        // Bulging eyes (on top)
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(-r * 0.15, -r * 0.38, r * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.15, -r * 0.38, r * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(-r * 0.14, -r * 0.37, r * 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.16, -r * 0.37, r * 0.05, 0, Math.PI * 2); ctx.fill();
        // Wide smile
        ctx.beginPath(); ctx.arc(0, -r * 0.08, r * 0.15, 0.1, Math.PI - 0.1);
        ctx.strokeStyle = "#1a7a40"; ctx.lineWidth = 1.5; ctx.stroke();
        // Spots on back
        ctx.fillStyle = "rgba(30,80,40,0.3)";
        ctx.beginPath(); ctx.arc(-r * 0.1, r * 0.1, r * 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.08, r * 0.2, r * 0.04, 0, Math.PI * 2); ctx.fill();
        this.specular(ctx, -r * 0.1, -r * 0.35, r * 0.06);
    }

    // --- CHICK ---
    drawChick(ctx, r, color) {
        // Feet (orange)
        this.pill(ctx, -r * 0.1, r * 0.6, r * 0.08, r * 0.06, "#ff8c00");
        this.pill(ctx, r * 0.1, r * 0.6, r * 0.08, r * 0.06, "#ff8c00");
        // Body (round yellow)
        ctx.beginPath();
        ctx.arc(0, r * 0.15, r * 0.35, 0, Math.PI * 2);
        this.fill3D(ctx, 0, r * 0.15, r * 0.35, "#ffd700");
        // Wings (small)
        ctx.beginPath(); ctx.ellipse(-r * 0.35, r * 0.15, r * 0.08, r * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = "#f0c000"; ctx.fill();
        ctx.beginPath(); ctx.ellipse(r * 0.35, r * 0.15, r * 0.08, r * 0.15, 0.3, 0, Math.PI * 2);
        ctx.fillStyle = "#f0c000"; ctx.fill();
        // Head (yellow)
        ctx.beginPath();
        ctx.arc(0, -r * 0.22, r * 0.26, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.22, r * 0.26, "#ffe044");
        // Crest (3 small feathers on top)
        ctx.strokeStyle = "#f0a000"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, -r * 0.48); ctx.lineTo(0, -r * 0.6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-r * 0.05, -r * 0.46); ctx.lineTo(-r * 0.08, -r * 0.56); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(r * 0.05, -r * 0.46); ctx.lineTo(r * 0.08, -r * 0.56); ctx.stroke();
        // Eyes
        this.drawEyes(ctx, r * 0.28, -r * 0.1, -r * 0.24);
        // Beak (orange)
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.15);
        ctx.lineTo(-r * 0.06, -r * 0.08);
        ctx.lineTo(r * 0.06, -r * 0.08);
        ctx.closePath();
        ctx.fillStyle = "#ff6600"; ctx.fill();
        // Blush
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = "#ff6666";
        ctx.beginPath(); ctx.arc(-r * 0.15, -r * 0.14, r * 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.15, -r * 0.14, r * 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        this.specular(ctx, -r * 0.08, -r * 0.38, r * 0.06);
    }

    // --- SKATER (person on skateboard) ---
    drawSkater(ctx, r, color) {
        // Skateboard
        ctx.beginPath();
        ctx.ellipse(0, r * 0.6, r * 0.45, r * 0.06, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, r * 0.6, r * 0.3, "#8B4513");
        // Wheels
        ctx.fillStyle = "#333";
        ctx.beginPath(); ctx.arc(-r * 0.25, r * 0.68, r * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.25, r * 0.68, r * 0.04, 0, Math.PI * 2); ctx.fill();
        // Legs (standing on board)
        this.pill(ctx, -r * 0.1, r * 0.35, r * 0.07, r * 0.2, "#3366cc");
        this.pill(ctx, r * 0.1, r * 0.35, r * 0.07, r * 0.2, "#3366cc");
        // Shoes
        this.pill(ctx, -r * 0.1, r * 0.52, r * 0.09, r * 0.05, "#444");
        this.pill(ctx, r * 0.1, r * 0.52, r * 0.09, r * 0.05, "#444");
        // Body (t-shirt)
        ctx.beginPath();
        ctx.ellipse(0, r * 0.0, r * 0.22, r * 0.28, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, 0, r * 0.25, color);
        // Arms
        this.pill(ctx, -r * 0.3, -r * 0.05, r * 0.06, r * 0.18, color);
        this.pill(ctx, r * 0.3, -r * 0.05, r * 0.06, r * 0.18, color);
        // Head
        ctx.beginPath();
        ctx.arc(0, -r * 0.35, r * 0.18, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.35, r * 0.18, "#fdd9b5");
        // Hair/cap
        ctx.beginPath();
        ctx.arc(0, -r * 0.42, r * 0.16, Math.PI, 0);
        ctx.fillStyle = "#333"; ctx.fill();
        // Cap brim
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.38, r * 0.2, r * 0.04, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#222"; ctx.fill();
        // Face
        this.drawEyes(ctx, r * 0.2, -r * 0.08, -r * 0.37);
        // Smile
        ctx.beginPath(); ctx.arc(0, -r * 0.3, r * 0.06, 0.2, Math.PI - 0.2);
        ctx.strokeStyle = "#333"; ctx.lineWidth = 1; ctx.stroke();
        this.specular(ctx, -r * 0.06, -r * 0.48, r * 0.05);
    }

    // --- SKIER ---
    drawSkier(ctx, r, color) {
        // Skis (blue, horizontal)
        this.pill(ctx, -r * 0.12, r * 0.7, r * 0.04, r * 0.5, "#1e90ff");
        this.pill(ctx, r * 0.12, r * 0.7, r * 0.04, r * 0.5, "#1e90ff");
        // Legs
        this.pill(ctx, -r * 0.1, r * 0.35, r * 0.07, r * 0.2, "#222");
        this.pill(ctx, r * 0.1, r * 0.35, r * 0.07, r * 0.2, "#222");
        // Boots
        this.pill(ctx, -r * 0.1, r * 0.52, r * 0.09, r * 0.06, "#444");
        this.pill(ctx, r * 0.1, r * 0.52, r * 0.09, r * 0.06, "#444");
        // Body (puffer jacket)
        ctx.beginPath();
        ctx.ellipse(0, r * 0.0, r * 0.25, r * 0.28, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, 0, r * 0.26, "#e74c3c");
        // Arms (holding poles)
        this.pill(ctx, -r * 0.32, -r * 0.05, r * 0.06, r * 0.2, "#e74c3c");
        this.pill(ctx, r * 0.32, -r * 0.05, r * 0.06, r * 0.2, "#e74c3c");
        // Poles
        ctx.strokeStyle = "#888"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-r * 0.35, -r * 0.2); ctx.lineTo(-r * 0.4, r * 0.7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(r * 0.35, -r * 0.2); ctx.lineTo(r * 0.4, r * 0.7); ctx.stroke();
        // Head
        ctx.beginPath();
        ctx.arc(0, -r * 0.35, r * 0.18, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.35, r * 0.18, "#fdd9b5");
        // Goggles
        ctx.fillStyle = "#ffa500";
        ctx.beginPath(); ctx.ellipse(0, -r * 0.37, r * 0.16, r * 0.06, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#333";
        ctx.beginPath(); ctx.ellipse(0, -r * 0.37, r * 0.14, r * 0.04, 0, 0, Math.PI * 2); ctx.fill();
        // Beanie
        ctx.beginPath();
        ctx.arc(0, -r * 0.45, r * 0.14, Math.PI, 0);
        ctx.fillStyle = "#e74c3c"; ctx.fill();
        // Pom pom
        ctx.beginPath(); ctx.arc(0, -r * 0.58, r * 0.04, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();
        this.specular(ctx, -r * 0.06, -r * 0.52, r * 0.04);
    }

    // --- HOVERBOARD ---
    drawHoverboard(ctx, r, color) {
        // Hover glow
        ctx.beginPath(); ctx.ellipse(0, r * 0.65, r * 0.4, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,200,255,0.2)"; ctx.fill();
        // Board (neon gradient)
        ctx.beginPath(); ctx.ellipse(0, r * 0.5, r * 0.4, r * 0.06, 0, 0, Math.PI * 2);
        var bg = ctx.createLinearGradient(-r * 0.4, 0, r * 0.4, 0);
        bg.addColorStop(0, "#7b2ff7"); bg.addColorStop(0.5, "#00d2ff"); bg.addColorStop(1, "#ff6b81");
        ctx.fillStyle = bg; ctx.fill();
        // Glow under
        ctx.beginPath(); ctx.ellipse(0, r * 0.55, r * 0.3, r * 0.04, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,210,255,0.4)"; ctx.fill();
        // Legs
        this.pill(ctx, -r * 0.08, r * 0.28, r * 0.06, r * 0.18, "#222");
        this.pill(ctx, r * 0.08, r * 0.28, r * 0.06, r * 0.18, "#222");
        // Body (futuristic suit)
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.05, r * 0.22, r * 0.28, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.05, r * 0.25, "#2c3e50");
        // Glowing chest piece
        ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,210,255,0.6)"; ctx.fill();
        // Arms
        this.pill(ctx, -r * 0.28, -r * 0.08, r * 0.06, r * 0.15, "#2c3e50");
        this.pill(ctx, r * 0.28, -r * 0.08, r * 0.06, r * 0.15, "#2c3e50");
        // Head (helmet)
        ctx.beginPath();
        ctx.arc(0, -r * 0.38, r * 0.18, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.38, r * 0.18, "#1a252f");
        // Visor
        ctx.beginPath(); ctx.ellipse(0, -r * 0.36, r * 0.14, r * 0.08, 0, 0, Math.PI * 2);
        var vg = ctx.createLinearGradient(0, -r * 0.44, 0, -r * 0.28);
        vg.addColorStop(0, "#00d2ff"); vg.addColorStop(1, "#7b2ff7");
        ctx.fillStyle = vg; ctx.fill();
        this.specular(ctx, -r * 0.06, -r * 0.48, r * 0.05);
    }

    // --- ASTRONAUT ---
    drawAstronaut(ctx, r, color) {
        // Backpack
        ctx.beginPath();
        ctx.ellipse(0, r * 0.1, r * 0.2, r * 0.3, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, r * 0.1, r * 0.25, "#888");
        // Legs (white suit)
        this.pill(ctx, -r * 0.12, r * 0.45, r * 0.08, r * 0.2, "#ddd");
        this.pill(ctx, r * 0.12, r * 0.45, r * 0.08, r * 0.2, "#ddd");
        // Boots
        this.pill(ctx, -r * 0.12, r * 0.6, r * 0.1, r * 0.06, "#777");
        this.pill(ctx, r * 0.12, r * 0.6, r * 0.1, r * 0.06, "#777");
        // Body (white puffy suit)
        ctx.beginPath();
        ctx.ellipse(0, r * 0.05, r * 0.28, r * 0.32, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, r * 0.05, r * 0.3, "#eee");
        // Arms
        this.pill(ctx, -r * 0.35, r * 0.0, r * 0.08, r * 0.2, "#ddd");
        this.pill(ctx, r * 0.35, r * 0.0, r * 0.08, r * 0.2, "#ddd");
        // Gloves
        ctx.fillStyle = "#aaa";
        ctx.beginPath(); ctx.arc(-r * 0.35, r * 0.18, r * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.35, r * 0.18, r * 0.06, 0, Math.PI * 2); ctx.fill();
        // Helmet (big sphere)
        ctx.beginPath();
        ctx.arc(0, -r * 0.3, r * 0.25, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.3, r * 0.25, "#fff");
        // Visor (dark blue/reflective)
        ctx.beginPath();
        ctx.arc(0, -r * 0.28, r * 0.18, 0, Math.PI * 2);
        var hg = ctx.createLinearGradient(0, -r * 0.45, 0, -r * 0.12);
        hg.addColorStop(0, "#1a1a4e");
        hg.addColorStop(0.5, "#2a4a8a");
        hg.addColorStop(1, "#4a90d9");
        ctx.fillStyle = hg; ctx.fill();
        // Stars in visor
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath(); ctx.arc(-r * 0.06, -r * 0.35, r * 0.02, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.08, -r * 0.25, r * 0.015, 0, Math.PI * 2); ctx.fill();
        // Flag patch on arm
        ctx.fillStyle = "#cc0000";
        ctx.fillRect(-r * 0.4, -r * 0.05, r * 0.1, r * 0.06);
        this.specular(ctx, -r * 0.08, -r * 0.45, r * 0.06);
    }

    // --- NINJA ---
    drawNinja(ctx, r, color) {
        // Legs
        this.pill(ctx, -r * 0.1, r * 0.4, r * 0.08, r * 0.2, "#1a1a2e");
        this.pill(ctx, r * 0.1, r * 0.4, r * 0.08, r * 0.2, "#1a1a2e");
        // Body (dark)
        ctx.beginPath();
        ctx.ellipse(0, r * 0.05, r * 0.25, r * 0.3, 0, 0, Math.PI * 2);
        this.fill3D(ctx, 0, r * 0.05, r * 0.27, "#2f3542");
        // Belt
        ctx.fillStyle = "#555";
        ctx.fillRect(-r * 0.25, r * 0.12, r * 0.5, r * 0.04);
        // Arms
        this.pill(ctx, -r * 0.32, -r * 0.05, r * 0.06, r * 0.2, "#2f3542");
        this.pill(ctx, r * 0.32, -r * 0.05, r * 0.06, r * 0.2, "#2f3542");
        // Sword on back (diagonal)
        ctx.strokeStyle = "#999"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(r * 0.15, -r * 0.6); ctx.lineTo(-r * 0.1, r * 0.3); ctx.stroke();
        ctx.fillStyle = "#c0a000";
        ctx.beginPath(); ctx.arc(r * 0.12, -r * 0.45, r * 0.03, 0, Math.PI * 2); ctx.fill();
        // Head (masked)
        ctx.beginPath();
        ctx.arc(0, -r * 0.32, r * 0.2, 0, Math.PI * 2);
        this.fill3D(ctx, 0, -r * 0.32, r * 0.2, "#2f3542");
        // Headband (red)
        ctx.fillStyle = "#ff4757";
        ctx.fillRect(-r * 0.2, -r * 0.36, r * 0.4, r * 0.05);
        // Headband tails
        ctx.strokeStyle = "#ff4757"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(r * 0.2, -r * 0.34);
        ctx.quadraticCurveTo(r * 0.4, -r * 0.4, r * 0.45, -r * 0.28);
        ctx.stroke();
        // Eyes (narrow slits, glowing)
        ctx.fillStyle = "#fff";
        ctx.fillRect(-r * 0.12, -r * 0.34, r * 0.08, r * 0.03);
        ctx.fillRect(r * 0.04, -r * 0.34, r * 0.08, r * 0.03);
        this.specular(ctx, -r * 0.06, -r * 0.46, r * 0.04);
    }

    // ===================
    // HELPER METHODS
    // ===================

    /** Draw a 3D-shaded filled shape (must have a path already begun) */
    fill3D(ctx, cx, cy, r, color) {
        var grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.05, cx, cy, r * 1.1);
        grad.addColorStop(0, this.lighten(color, 0.5));
        grad.addColorStop(0.2, this.lighten(color, 0.2));
        grad.addColorStop(0.5, color);
        grad.addColorStop(0.8, this.darken(color, 0.7));
        grad.addColorStop(1, this.darken(color, 0.4));
        ctx.fillStyle = grad;
        ctx.fill();
    }

    /** Draw a pill/capsule shape (rounded rect) */
    pill(ctx, x, y, rx, ry, color) {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        this.fill3D(ctx, x, y, Math.max(rx, ry), color);
    }

    /** Draw cute eyes */
    drawEyes(ctx, spacing, centerX, centerY) {
        var ex = spacing / 2;
        // White
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(centerX - ex, centerY, spacing * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(centerX + ex, centerY, spacing * 0.2, 0, Math.PI * 2); ctx.fill();
        // Pupil
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(centerX - ex + 1, centerY + 1, spacing * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(centerX + ex + 1, centerY + 1, spacing * 0.12, 0, Math.PI * 2); ctx.fill();
        // Highlight
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(centerX - ex - 1, centerY - 1, spacing * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(centerX + ex - 1, centerY - 1, spacing * 0.06, 0, Math.PI * 2); ctx.fill();
    }

    /** Specular highlight */
    specular(ctx, x, y, r) {
        var grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, "rgba(255,255,255,0.6)");
        grad.addColorStop(0.6, "rgba(255,255,255,0.15)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    }

    /** Lighten a color */
    lighten(color, amount) {
        var r, g, b;
        if (color.startsWith("rgb")) {
            var m = color.match(/\d+/g);
            r = parseInt(m[0]); g = parseInt(m[1]); b = parseInt(m[2]);
        } else {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        }
        r = Math.min(255, r + Math.floor(255 * amount));
        g = Math.min(255, g + Math.floor(255 * amount));
        b = Math.min(255, b + Math.floor(255 * amount));
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    /** Darken a color */
    darken(color, factor) {
        var r, g, b;
        if (color.startsWith("rgb")) {
            var m = color.match(/\d+/g);
            r = parseInt(m[0]); g = parseInt(m[1]); b = parseInt(m[2]);
        } else {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        }
        return "rgb(" + Math.floor(r * factor) + "," + Math.floor(g * factor) + "," + Math.floor(b * factor) + ")";
    }
}
