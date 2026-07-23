/**
 * Skins3D - Cute 3D character models rendered on canvas.
 * 5x bigger than base player radius. Drawn facing movement direction.
 * 
 * Each skin is a hand-drawn cute character with:
 * - Round body shapes (kawaii style)
 * - Simple shading (gradient + highlight)
 * - Small accessories (ears, vehicles, etc)
 */

const SKINS_3D = {
    // Default
    droplet: { name: "Droplet", price: 0 },
    // Animals
    bunny: { name: "Bunny", price: 150 },
    penguin: { name: "Penguin", price: 200 },
    fox: { name: "Fox", price: 250 },
    panda: { name: "Panda", price: 300 },
    owl: { name: "Owl", price: 350 },
    frog: { name: "Frog", price: 200 },
    chick: { name: "Chick", price: 150 },
    // Vehicles
    skateboard: { name: "Skater", price: 400 },
    skis: { name: "Skier", price: 450 },
    hoverboard: { name: "Hoverboard", price: 500 },
    // Special
    astronaut: { name: "Astronaut", price: 600 },
    ninja: { name: "Ninja", price: 500 },
};

class Skins3DRenderer {
    constructor() {}

    draw(ctx, x, y, r, angle, skinId, color) {
        ctx.save();
        ctx.translate(x, y);

        switch (skinId) {
            case "bunny": this.drawBunny(ctx, r, angle, color); break;
            case "penguin": this.drawPenguin(ctx, r, angle, color); break;
            case "fox": this.drawFox(ctx, r, angle, color); break;
            case "panda": this.drawPanda(ctx, r, angle, color); break;
            case "owl": this.drawOwl(ctx, r, angle, color); break;
            case "frog": this.drawFrog(ctx, r, angle, color); break;
            case "chick": this.drawChick(ctx, r, angle, color); break;
            case "skateboard": this.drawSkater(ctx, r, angle, color); break;
            case "skis": this.drawSkier(ctx, r, angle, color); break;
            case "hoverboard": this.drawHoverboard(ctx, r, angle, color); break;
            case "astronaut": this.drawAstronaut(ctx, r, angle, color); break;
            case "ninja": this.drawNinja(ctx, r, angle, color); break;
            default: this.drawDroplet(ctx, r, angle, color); break;
        }

        ctx.restore();
    }

    // --- DROPLET (default) ---
    drawDroplet(ctx, r, angle, color) {
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(r * 0.9, 0);
        ctx.quadraticCurveTo(r * 0.3, -r * 0.7, -r * 0.6, -r * 0.3);
        ctx.quadraticCurveTo(-r * 1.0, 0, -r * 0.6, r * 0.3);
        ctx.quadraticCurveTo(r * 0.3, r * 0.7, r * 0.9, 0);
        ctx.closePath();
        this.fillBody(ctx, r, color);
        this.highlight(ctx, r * 0.3, -r * 0.15, r * 0.18);
    }

    // --- BUNNY ---
    drawBunny(ctx, r, angle, color) {
        // Ears
        ctx.fillStyle = color;
        this.oval(ctx, -r * 0.25, -r * 0.85, r * 0.15, r * 0.45);
        this.oval(ctx, r * 0.25, -r * 0.85, r * 0.15, r * 0.45);
        // Inner ears
        ctx.fillStyle = "#ffb6c1";
        this.oval(ctx, -r * 0.25, -r * 0.8, r * 0.08, r * 0.3);
        this.oval(ctx, r * 0.25, -r * 0.8, r * 0.08, r * 0.3);
        // Body
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
        this.fillBody(ctx, r * 0.55, color);
        // Face
        this.eyes(ctx, r, -0.15, -0.1, 0.15, -0.1);
        this.mouth(ctx, 0, r * 0.15, r * 0.1);
        // Cheeks
        ctx.fillStyle = "rgba(255,150,150,0.3)";
        this.oval(ctx, -r * 0.28, r * 0.08, r * 0.1, r * 0.07);
        this.oval(ctx, r * 0.28, r * 0.08, r * 0.1, r * 0.07);
        this.highlight(ctx, -r * 0.15, -r * 0.2, r * 0.12);
    }

    // --- PENGUIN ---
    drawPenguin(ctx, r, angle, color) {
        // Body (black)
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
        this.fillBody(ctx, r * 0.55, "#333");
        // Belly (white)
        ctx.beginPath();
        ctx.ellipse(0, r * 0.1, r * 0.35, r * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#f0f0f0";
        ctx.fill();
        // Beak
        ctx.beginPath();
        ctx.moveTo(-r * 0.08, -r * 0.02);
        ctx.lineTo(0, r * 0.1);
        ctx.lineTo(r * 0.08, -r * 0.02);
        ctx.closePath();
        ctx.fillStyle = "#ffa502";
        ctx.fill();
        // Eyes
        this.eyes(ctx, r, -0.15, -0.12, 0.15, -0.12);
        // Feet
        ctx.fillStyle = "#ffa502";
        this.oval(ctx, -r * 0.15, r * 0.5, r * 0.1, r * 0.06);
        this.oval(ctx, r * 0.15, r * 0.5, r * 0.1, r * 0.06);
        this.highlight(ctx, -r * 0.1, -r * 0.25, r * 0.1);
    }

    // --- FOX ---
    drawFox(ctx, r, angle, color) {
        // Ears
        ctx.fillStyle = "#ff6348";
        this.triangle(ctx, -r * 0.35, -r * 0.6, r * 0.2, r * 0.35);
        this.triangle(ctx, r * 0.35, -r * 0.6, r * 0.2, r * 0.35);
        ctx.fillStyle = "#fff";
        this.triangle(ctx, -r * 0.35, -r * 0.5, r * 0.1, r * 0.2);
        this.triangle(ctx, r * 0.35, -r * 0.5, r * 0.1, r * 0.2);
        // Head
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
        this.fillBody(ctx, r * 0.5, "#ff6348");
        // Snout
        ctx.beginPath();
        ctx.ellipse(0, r * 0.15, r * 0.2, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        // Nose
        ctx.beginPath();
        ctx.arc(0, r * 0.08, r * 0.06, 0, Math.PI * 2);
        ctx.fillStyle = "#333";
        ctx.fill();
        this.eyes(ctx, r, -0.18, -0.08, 0.18, -0.08);
        this.highlight(ctx, -r * 0.12, -r * 0.2, r * 0.1);
    }

    // --- PANDA ---
    drawPanda(ctx, r, angle, color) {
        // Body
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        // Ears
        ctx.fillStyle = "#222";
        ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.38, r * 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.38, r * 0.15, 0, Math.PI * 2); ctx.fill();
        // Eye patches
        ctx.beginPath(); ctx.ellipse(-r * 0.18, -r * 0.05, r * 0.14, r * 0.16, -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(r * 0.18, -r * 0.05, r * 0.14, r * 0.16, 0.2, 0, Math.PI * 2); ctx.fill();
        // Eyes (white dots in patches)
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(-r * 0.16, -r * 0.05, r * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.16, -r * 0.05, r * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(-r * 0.16, -r * 0.04, r * 0.03, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.16, -r * 0.04, r * 0.03, 0, Math.PI * 2); ctx.fill();
        // Nose
        ctx.beginPath(); ctx.ellipse(0, r * 0.12, r * 0.06, r * 0.04, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#333"; ctx.fill();
        this.highlight(ctx, -r * 0.15, -r * 0.25, r * 0.1);
    }

    // --- OWL ---
    drawOwl(ctx, r, angle, color) {
        ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
        this.fillBody(ctx, r * 0.55, "#8B4513");
        // Big eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(-r * 0.18, -r * 0.05, r * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.18, -r * 0.05, r * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffa502";
        ctx.beginPath(); ctx.arc(-r * 0.18, -r * 0.05, r * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.18, -r * 0.05, r * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(-r * 0.18, -r * 0.04, r * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.18, -r * 0.04, r * 0.06, 0, Math.PI * 2); ctx.fill();
        // Beak
        ctx.fillStyle = "#ffa502";
        ctx.beginPath(); ctx.moveTo(0, r * 0.08); ctx.lineTo(-r * 0.06, r * 0.18); ctx.lineTo(r * 0.06, r * 0.18); ctx.closePath(); ctx.fill();
        // Ear tufts
        ctx.fillStyle = "#5c3317";
        this.triangle(ctx, -r * 0.3, -r * 0.55, r * 0.12, r * 0.25);
        this.triangle(ctx, r * 0.3, -r * 0.55, r * 0.12, r * 0.25);
        this.highlight(ctx, -r * 0.1, -r * 0.2, r * 0.08);
    }

    // --- FROG ---
    drawFrog(ctx, r, angle, color) {
        ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
        this.fillBody(ctx, r * 0.5, "#2ed573");
        // Big eyes on top
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.35, r * 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.2, -r * 0.35, r * 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.33, r * 0.07, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.2, -r * 0.33, r * 0.07, 0, Math.PI * 2); ctx.fill();
        // Smile
        ctx.beginPath(); ctx.arc(0, r * 0.1, r * 0.2, 0.1, Math.PI - 0.1);
        ctx.strokeStyle = "#1a8f4a"; ctx.lineWidth = 2; ctx.stroke();
        // Cheeks
        ctx.fillStyle = "rgba(255,100,100,0.2)";
        this.oval(ctx, -r * 0.3, r * 0.05, r * 0.08, r * 0.06);
        this.oval(ctx, r * 0.3, r * 0.05, r * 0.08, r * 0.06);
        this.highlight(ctx, -r * 0.12, -r * 0.15, r * 0.1);
    }

    // --- CHICK ---
    drawChick(ctx, r, angle, color) {
        ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
        this.fillBody(ctx, r * 0.5, "#ffd700");
        // Wings
        ctx.fillStyle = "#f0c000";
        this.oval(ctx, -r * 0.45, r * 0.05, r * 0.15, r * 0.2);
        this.oval(ctx, r * 0.45, r * 0.05, r * 0.15, r * 0.2);
        // Beak
        ctx.fillStyle = "#ff6348";
        ctx.beginPath(); ctx.moveTo(0, -r * 0.02); ctx.lineTo(-r * 0.1, r * 0.08); ctx.lineTo(r * 0.1, r * 0.08); ctx.closePath(); ctx.fill();
        this.eyes(ctx, r, -0.13, -0.1, 0.13, -0.1);
        // Blush
        ctx.fillStyle = "rgba(255,150,100,0.3)";
        this.oval(ctx, -r * 0.25, r * 0.05, r * 0.08, r * 0.06);
        this.oval(ctx, r * 0.25, r * 0.05, r * 0.08, r * 0.06);
        this.highlight(ctx, -r * 0.12, -r * 0.2, r * 0.1);
    }

    // --- SKATER (character on skateboard) ---
    drawSkater(ctx, r, angle, color) {
        ctx.rotate(angle);
        // Skateboard
        ctx.fillStyle = "#8B4513";
        this.roundRect(ctx, -r * 0.6, r * 0.25, r * 1.2, r * 0.12, r * 0.06);
        // Wheels
        ctx.fillStyle = "#333";
        ctx.beginPath(); ctx.arc(-r * 0.35, r * 0.4, r * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.35, r * 0.4, r * 0.06, 0, Math.PI * 2); ctx.fill();
        // Body (round character on top)
        ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.35, 0, Math.PI * 2);
        this.fillBody(ctx, r * 0.35, color);
        // Cap
        ctx.fillStyle = this.darkenColor(color, 0.6);
        ctx.beginPath(); ctx.ellipse(0, -r * 0.35, r * 0.25, r * 0.08, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(-r * 0.25, -r * 0.4, r * 0.5, r * 0.08);
        // Face
        this.eyes(ctx, r * 0.7, -0.12, -0.02, 0.12, -0.02);
        this.mouth(ctx, 0, r * 0.05, r * 0.08);
        this.highlight(ctx, -r * 0.08, -r * 0.25, r * 0.08);
    }

    // --- SKIER (character on skis) ---
    drawSkier(ctx, r, angle, color) {
        ctx.rotate(angle);
        // Skis
        ctx.fillStyle = "#1e90ff";
        this.roundRect(ctx, -r * 0.25, r * 0.3, r * 0.12, r * 0.8, r * 0.06);
        this.roundRect(ctx, r * 0.13, r * 0.3, r * 0.12, r * 0.8, r * 0.06);
        // Body
        ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.35, 0, Math.PI * 2);
        this.fillBody(ctx, r * 0.35, color);
        // Goggles
        ctx.fillStyle = "#222";
        ctx.beginPath(); ctx.ellipse(0, -r * 0.12, r * 0.25, r * 0.1, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffa502";
        ctx.beginPath(); ctx.ellipse(0, -r * 0.12, r * 0.22, r * 0.07, 0, 0, Math.PI * 2); ctx.fill();
        // Beanie
        ctx.fillStyle = "#ff4757";
        ctx.beginPath(); ctx.arc(0, -r * 0.35, r * 0.18, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.arc(0, -r * 0.48, r * 0.06, 0, Math.PI * 2); ctx.fill();
        this.highlight(ctx, -r * 0.08, -r * 0.3, r * 0.06);
    }

    // --- HOVERBOARD ---
    drawHoverboard(ctx, r, angle, color) {
        ctx.rotate(angle);
        // Hover glow
        ctx.fillStyle = "rgba(0,210,255,0.15)";
        ctx.beginPath(); ctx.ellipse(0, r * 0.4, r * 0.5, r * 0.12, 0, 0, Math.PI * 2); ctx.fill();
        // Board
        const grad = ctx.createLinearGradient(-r * 0.5, 0, r * 0.5, 0);
        grad.addColorStop(0, "#7b2ff7"); grad.addColorStop(0.5, "#00d2ff"); grad.addColorStop(1, "#ff6b81");
        ctx.fillStyle = grad;
        this.roundRect(ctx, -r * 0.5, r * 0.2, r * 1.0, r * 0.1, r * 0.05);
        // Glow under board
        ctx.fillStyle = "rgba(0,210,255,0.3)";
        ctx.beginPath(); ctx.ellipse(0, r * 0.35, r * 0.35, r * 0.05, 0, 0, Math.PI * 2); ctx.fill();
        // Body
        ctx.beginPath(); ctx.arc(0, -r * 0.15, r * 0.35, 0, Math.PI * 2);
        this.fillBody(ctx, r * 0.35, color);
        // Visor
        ctx.fillStyle = "rgba(0,210,255,0.5)";
        ctx.beginPath(); ctx.ellipse(0, -r * 0.15, r * 0.22, r * 0.12, 0, -0.3, Math.PI + 0.3); ctx.fill();
        this.eyes(ctx, r * 0.7, -0.1, -0.05, 0.1, -0.05);
        this.highlight(ctx, -r * 0.08, -r * 0.3, r * 0.08);
    }

    // --- ASTRONAUT ---
    drawAstronaut(ctx, r, angle, color) {
        // Suit body
        ctx.beginPath(); ctx.arc(0, r * 0.1, r * 0.4, 0, Math.PI * 2);
        this.fillBody(ctx, r * 0.4, "#ddd");
        // Helmet
        ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();
        ctx.strokeStyle = "#aaa"; ctx.lineWidth = 2; ctx.stroke();
        // Visor
        ctx.beginPath(); ctx.arc(0, -r * 0.18, r * 0.25, 0, Math.PI * 2);
        const vGrad = ctx.createLinearGradient(0, -r * 0.4, 0, r * 0.1);
        vGrad.addColorStop(0, "#1a1a4e"); vGrad.addColorStop(1, "#4a90d9");
        ctx.fillStyle = vGrad; ctx.fill();
        // Star reflection
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath(); ctx.arc(-r * 0.1, -r * 0.28, r * 0.04, 0, Math.PI * 2); ctx.fill();
        // Backpack
        ctx.fillStyle = "#999";
        this.roundRect(ctx, -r * 0.15, r * 0.2, r * 0.3, r * 0.25, r * 0.05);
        this.highlight(ctx, -r * 0.12, -r * 0.35, r * 0.08);
    }

    // --- NINJA ---
    drawNinja(ctx, r, angle, color) {
        ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
        this.fillBody(ctx, r * 0.5, "#2f3542");
        // Headband
        ctx.fillStyle = "#ff4757";
        ctx.fillRect(-r * 0.5, -r * 0.12, r * 1.0, r * 0.1);
        // Tail
        ctx.beginPath(); ctx.moveTo(r * 0.4, -r * 0.12);
        ctx.quadraticCurveTo(r * 0.7, -r * 0.3, r * 0.8, -r * 0.1);
        ctx.strokeStyle = "#ff4757"; ctx.lineWidth = 3; ctx.stroke();
        // Eyes (narrow slits)
        ctx.fillStyle = "#fff";
        ctx.fillRect(-r * 0.22, -r * 0.08, r * 0.15, r * 0.06);
        ctx.fillRect(r * 0.07, -r * 0.08, r * 0.15, r * 0.06);
        ctx.fillStyle = "#111";
        ctx.fillRect(-r * 0.17, -r * 0.07, r * 0.08, r * 0.04);
        ctx.fillRect(r * 0.1, -r * 0.07, r * 0.08, r * 0.04);
        this.highlight(ctx, -r * 0.12, -r * 0.25, r * 0.08);
    }

    // --- HELPERS ---
    fillBody(ctx, r, color) {
        const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.3, 0, 0, 0, r);
        grad.addColorStop(0, "#fff");
        grad.addColorStop(0.3, color);
        grad.addColorStop(1, this.darkenColor(color, 0.5));
        ctx.fillStyle = grad;
        ctx.fill();
    }

    highlight(ctx, x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fill();
    }

    eyes(ctx, r, lx, ly, rx, ry) {
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(r * lx, r * ly, r * 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * rx, r * ry, r * 0.05, 0, Math.PI * 2); ctx.fill();
        // Highlights
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(r * lx + 1, r * ly - 1, r * 0.02, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * rx + 1, r * ry - 1, r * 0.02, 0, Math.PI * 2); ctx.fill();
    }

    mouth(ctx, x, y, size) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0.1, Math.PI - 0.1);
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    oval(ctx, x, y, rx, ry) {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    triangle(ctx, x, y, w, h) {
        ctx.beginPath();
        ctx.moveTo(x, y - h / 2);
        ctx.lineTo(x - w / 2, y + h / 2);
        ctx.lineTo(x + w / 2, y + h / 2);
        ctx.closePath();
        ctx.fill();
    }

    roundRect(ctx, x, y, w, h, rad) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, rad);
        ctx.fill();
    }

    darkenColor(color, factor) {
        if (color.startsWith("rgb")) {
            const [r, g, b] = color.match(/\d+/g).map(Number);
            return `rgb(${Math.floor(r*factor)},${Math.floor(g*factor)},${Math.floor(b*factor)})`;
        }
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgb(${Math.floor(r*factor)},${Math.floor(g*factor)},${Math.floor(b*factor)})`;
    }
}
