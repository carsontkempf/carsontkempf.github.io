/**
 * Characters - 3D shape rendering for the isometric grid.
 * 
 * Each character is drawn as a multi-face 3D shape at isometric angle.
 * Characters bob gently while moving for life-like feel.
 */

class CharacterRenderer {
    constructor(renderer) {
        this.renderer = renderer;
        this.animTime = 0;
    }

    /**
     * Update animation time.
     */
    update(dt) {
        this.animTime += dt;
    }

    /**
     * Draw a character at grid position.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} gx - grid x
     * @param {number} gy - grid y
     * @param {string} color - base color hex
     * @param {string} shape - shape id
     * @param {boolean} moving - is the character moving
     * @param {number} direction - 0-3
     */
    draw(ctx, gx, gy, color, shape, moving, direction) {
        const { x, y } = this.renderer.gridToScreen(gx, gy);
        const tw = this.renderer.tileWidth / 2;

        // Bob animation
        const bob = moving ? Math.sin(this.animTime * 8) * 2 : 0;
        const drawY = y - bob;

        ctx.save();
        ctx.translate(x, drawY);

        switch (shape) {
            case "cube": this.drawCube(ctx, color, tw); break;
            case "sphere": this.drawSphere(ctx, color, tw); break;
            case "star": this.drawStar(ctx, color, tw); break;
            case "diamond": this.drawDiamond(ctx, color, tw); break;
            case "arrow": this.drawArrow(ctx, color, tw, direction); break;
            case "crown": this.drawCrown(ctx, color, tw); break;
            case "bear": this.drawBear(ctx, color, tw); break;
            case "cat": this.drawCat(ctx, color, tw); break;
            case "rocket": this.drawRocket(ctx, color, tw, direction); break;
            case "ghost": this.drawGhost(ctx, color, tw); break;
            default: this.drawCube(ctx, color, tw); break;
        }

        ctx.restore();
    }

    drawCube(ctx, color, s) {
        const h = 14;
        const hs = s * 0.6;
        // Top
        ctx.beginPath();
        ctx.moveTo(0, -h - hs / 2);
        ctx.lineTo(hs, -h);
        ctx.lineTo(0, -h + hs / 2);
        ctx.lineTo(-hs, -h);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        // Right
        ctx.beginPath();
        ctx.moveTo(hs, -h);
        ctx.lineTo(hs, 0);
        ctx.lineTo(0, hs / 2);
        ctx.lineTo(0, -h + hs / 2);
        ctx.closePath();
        ctx.fillStyle = this.darken(color, 0.7);
        ctx.fill();
        // Left
        ctx.beginPath();
        ctx.moveTo(-hs, -h);
        ctx.lineTo(-hs, 0);
        ctx.lineTo(0, hs / 2);
        ctx.lineTo(0, -h + hs / 2);
        ctx.closePath();
        ctx.fillStyle = this.darken(color, 0.5);
        ctx.fill();
    }

    drawSphere(ctx, color, s) {
        const r = s * 0.55;
        // Shadow
        ctx.beginPath();
        ctx.ellipse(0, 2, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fill();
        // Sphere
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.9, r * 0.1, 0, -r * 0.4, r);
        grad.addColorStop(0, this.lighten(color, 0.4));
        grad.addColorStop(0.6, color);
        grad.addColorStop(1, this.darken(color, 0.5));
        ctx.beginPath();
        ctx.arc(0, -r * 0.7, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        // Highlight
        ctx.beginPath();
        ctx.arc(-r * 0.25, -r * 1.1, r * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fill();
    }

    drawStar(ctx, color, s) {
        const r = s * 0.65;
        const ir = r * 0.4;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI / 5) - Math.PI / 2;
            const radius = i % 2 === 0 ? r : ir;
            const sx = Math.cos(angle) * radius;
            const sy = Math.sin(angle) * radius - r * 0.5;
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = this.darken(color, 0.6);
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    drawDiamond(ctx, color, s) {
        const w = s * 0.5;
        const h = s * 0.9;
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(w, -h * 0.3);
        ctx.lineTo(0, h * 0.3);
        ctx.lineTo(-w, -h * 0.3);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        // Right facet
        ctx.beginPath();
        ctx.moveTo(0, -h * 0.3);
        ctx.lineTo(w, -h * 0.3);
        ctx.lineTo(0, h * 0.3);
        ctx.closePath();
        ctx.fillStyle = this.darken(color, 0.7);
        ctx.fill();
        // Highlight
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(-w * 0.3, -h * 0.5);
        ctx.lineTo(0, -h * 0.3);
        ctx.closePath();
        ctx.fillStyle = this.lighten(color, 0.3);
        ctx.fill();
    }

    drawArrow(ctx, color, s, dir) {
        ctx.save();
        ctx.rotate([0, Math.PI / 2, Math.PI, -Math.PI / 2][dir || 0]);
        const w = s * 0.45;
        const h = s * 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.lineTo(w, -h * 0.2);
        ctx.lineTo(w * 0.4, -h * 0.2);
        ctx.lineTo(w * 0.4, h * 0.3);
        ctx.lineTo(-w * 0.4, h * 0.3);
        ctx.lineTo(-w * 0.4, -h * 0.2);
        ctx.lineTo(-w, -h * 0.2);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = this.darken(color, 0.6);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    }

    drawCrown(ctx, color, s) {
        const w = s * 0.6;
        const h = s * 0.7;
        // Base
        ctx.beginPath();
        ctx.moveTo(-w, 0);
        ctx.lineTo(-w, -h * 0.4);
        ctx.lineTo(-w * 0.5, -h * 0.2);
        ctx.lineTo(0, -h);
        ctx.lineTo(w * 0.5, -h * 0.2);
        ctx.lineTo(w, -h * 0.4);
        ctx.lineTo(w, 0);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = this.darken(color, 0.6);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Jewels
        ctx.beginPath();
        ctx.arc(0, -h * 0.3, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
    }

    drawBear(ctx, color, s) {
        const r = s * 0.5;
        // Ears
        ctx.beginPath();
        ctx.arc(-r * 0.65, -r * 1.5, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = this.darken(color, 0.7);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.65, -r * 1.5, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = this.darken(color, 0.7);
        ctx.fill();
        // Inner ears
        ctx.beginPath();
        ctx.arc(-r * 0.65, -r * 1.5, r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = "#ffb6c1";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.65, -r * 1.5, r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = "#ffb6c1";
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(0, -r * 0.8, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        // Snout
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.5, r * 0.35, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.lighten(color, 0.3);
        ctx.fill();
        // Nose
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.6, r * 0.12, r * 0.09, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#333";
        ctx.fill();
        // Eyes
        ctx.beginPath();
        ctx.arc(-r * 0.3, -r * 0.95, r * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = "#222";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.3, -r * 0.95, r * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = "#222";
        ctx.fill();
        // Eye highlights
        ctx.beginPath();
        ctx.arc(-r * 0.25, -r * 1.0, r * 0.04, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.35, -r * 1.0, r * 0.04, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
    }

    drawCat(ctx, color, s) {
        const r = s * 0.48;
        // Ears (triangles)
        ctx.beginPath();
        ctx.moveTo(-r * 0.8, -r * 1.8);
        ctx.lineTo(-r * 0.2, -r * 1.2);
        ctx.lineTo(-r * 0.9, -r * 1.0);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(r * 0.8, -r * 1.8);
        ctx.lineTo(r * 0.2, -r * 1.2);
        ctx.lineTo(r * 0.9, -r * 1.0);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        // Inner ears
        ctx.beginPath();
        ctx.moveTo(-r * 0.7, -r * 1.6);
        ctx.lineTo(-r * 0.35, -r * 1.25);
        ctx.lineTo(-r * 0.8, -r * 1.15);
        ctx.closePath();
        ctx.fillStyle = "#ffb6c1";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(r * 0.7, -r * 1.6);
        ctx.lineTo(r * 0.35, -r * 1.25);
        ctx.lineTo(r * 0.8, -r * 1.15);
        ctx.closePath();
        ctx.fillStyle = "#ffb6c1";
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(0, -r * 0.7, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        // Eyes
        ctx.beginPath();
        ctx.ellipse(-r * 0.35, -r * 0.85, r * 0.18, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#7bed9f";
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(r * 0.35, -r * 0.85, r * 0.18, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#7bed9f";
        ctx.fill();
        // Pupils (slits)
        ctx.beginPath();
        ctx.ellipse(-r * 0.35, -r * 0.85, r * 0.05, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#111";
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(r * 0.35, -r * 0.85, r * 0.05, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#111";
        ctx.fill();
        // Nose
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.55);
        ctx.lineTo(-r * 0.08, -r * 0.45);
        ctx.lineTo(r * 0.08, -r * 0.45);
        ctx.closePath();
        ctx.fillStyle = "#ff6b81";
        ctx.fill();
        // Whiskers
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 0.8;
        for (const side of [-1, 1]) {
            for (const angle of [-0.2, 0, 0.2]) {
                ctx.beginPath();
                ctx.moveTo(side * r * 0.2, -r * 0.45);
                ctx.lineTo(side * r * 0.9, -r * 0.5 + angle * r);
                ctx.stroke();
            }
        }
    }

    drawRocket(ctx, color, s, dir) {
        ctx.save();
        ctx.rotate([0, Math.PI / 2, Math.PI, -Math.PI / 2][dir || 0]);
        const w = s * 0.35;
        const h = s * 0.9;
        // Body
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.quadraticCurveTo(w, -h * 0.5, w, 0);
        ctx.lineTo(w * 0.6, h * 0.2);
        ctx.lineTo(-w * 0.6, h * 0.2);
        ctx.lineTo(-w, 0);
        ctx.quadraticCurveTo(-w, -h * 0.5, 0, -h);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        // Nose cone
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.quadraticCurveTo(w * 0.4, -h * 0.75, w * 0.3, -h * 0.55);
        ctx.lineTo(-w * 0.3, -h * 0.55);
        ctx.quadraticCurveTo(-w * 0.4, -h * 0.75, 0, -h);
        ctx.closePath();
        ctx.fillStyle = this.lighten(color, 0.3);
        ctx.fill();
        // Window
        ctx.beginPath();
        ctx.arc(0, -h * 0.35, w * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = "#a4f4ff";
        ctx.fill();
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1;
        ctx.stroke();
        // Fins
        ctx.beginPath();
        ctx.moveTo(-w, 0);
        ctx.lineTo(-w * 1.4, h * 0.3);
        ctx.lineTo(-w * 0.6, h * 0.2);
        ctx.closePath();
        ctx.fillStyle = this.darken(color, 0.6);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w, 0);
        ctx.lineTo(w * 1.4, h * 0.3);
        ctx.lineTo(w * 0.6, h * 0.2);
        ctx.closePath();
        ctx.fillStyle = this.darken(color, 0.6);
        ctx.fill();
        // Flame
        const flicker = Math.sin(this.renderer ? 0 : 0) * 2;
        ctx.beginPath();
        ctx.moveTo(-w * 0.4, h * 0.2);
        ctx.quadraticCurveTo(0, h * 0.7 + flicker, w * 0.4, h * 0.2);
        ctx.fillStyle = "#ffa502";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-w * 0.2, h * 0.2);
        ctx.quadraticCurveTo(0, h * 0.55, w * 0.2, h * 0.2);
        ctx.fillStyle = "#ff6348";
        ctx.fill();
        ctx.restore();
    }

    drawGhost(ctx, color, s) {
        const r = s * 0.55;
        const h = r * 1.5;
        // Body
        ctx.beginPath();
        ctx.arc(0, -h * 0.5, r, Math.PI, 0, false);
        ctx.lineTo(r, 0);
        // Wavy bottom
        const waves = 4;
        for (let i = 0; i <= waves; i++) {
            const wx = r - (i * 2 * r / waves);
            const wy = (i % 2 === 0) ? r * 0.3 : 0;
            ctx.lineTo(wx, wy);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        // Eyes
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -h * 0.55, r * 0.2, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(r * 0.3, -h * 0.55, r * 0.2, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        // Pupils
        ctx.beginPath();
        ctx.arc(-r * 0.25, -h * 0.5, r * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = "#222";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.35, -h * 0.5, r * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = "#222";
        ctx.fill();
        // Mouth
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.25, r * 0.15, r * 0.1, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#333";
        ctx.fill();
    }

    darken(hex, factor) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
    }

    lighten(hex, amount) {
        const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + Math.floor(255 * amount));
        const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + Math.floor(255 * amount));
        const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + Math.floor(255 * amount));
        return `rgb(${r},${g},${b})`;
    }
}
