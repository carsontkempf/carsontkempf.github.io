/**
 * Renderer - Slightly tilted top-down view with 3D territory.
 * Territory rendered as smooth blobs with drop shadow and raised edges.
 * Trails as thick smooth curves.
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.baseScale = 0.12;
        this.scale = this.baseScale;
        this.targetScale = this.baseScale;
        this.cameraX = 0;
        this.cameraY = 0;
        this.targetCamX = 0;
        this.targetCamY = 0;
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth * devicePixelRatio;
        this.canvas.height = window.innerHeight * devicePixelRatio;
        this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        this.screenW = window.innerWidth;
        this.screenH = window.innerHeight;
    }

    worldToScreen(wx, wy) {
        return {
            x: wx * this.scale - this.cameraX + this.screenW / 2,
            y: wy * this.scale - this.cameraY + this.screenH / 2
        };
    }

    setCameraTarget(wx, wy) {
        this.targetCamX = wx * this.scale;
        this.targetCamY = wy * this.scale;
    }

    updateCamera(dt) {
        const lerp = 1 - Math.pow(0.005, dt);
        this.cameraX += (this.targetCamX - this.cameraX) * lerp;
        this.cameraY += (this.targetCamY - this.cameraY) * lerp;
        this.scale += (this.targetScale - this.scale) * lerp * 0.3;
    }

    setZoomForTerritory(pct) {
        this.targetScale = Math.max(0.02, this.baseScale - pct * 0.002);
    }

    clear() {
        this.ctx.fillStyle = "#111820";
        this.ctx.fillRect(0, 0, this.screenW, this.screenH);
    }

    /**
     * Render territories as smooth blobs with 3D shadow effect.
     * Uses rounded circles per cell to create organic shapes.
     */
    renderTerritories(engine, players) {
        const ctx = this.ctx;
        const cellWorld = CELL_SIZE;
        const cs = cellWorld * this.scale;

        for (const p of players) {
            // Collect visible cells
            const cells = [];
            for (let gy = 0; gy < GRID_RES; gy++) {
                for (let gx = 0; gx < GRID_RES; gx++) {
                    if (engine.grid[gy][gx] !== p.id) continue;
                    const wx = (gx + 0.5) * cellWorld;
                    const wy = (gy + 0.5) * cellWorld;
                    const { x, y } = this.worldToScreen(wx, wy);
                    if (x < -cs * 2 || x > this.screenW + cs * 2 || y < -cs * 2 || y > this.screenH + cs * 2) continue;
                    cells.push({ x, y });
                }
            }
            if (cells.length === 0) continue;

            const r = cs * 0.7; // circle radius per cell (overlap for smooth look)

            // 3D Shadow layer (offset down and slightly transparent)
            ctx.fillStyle = "rgba(0,0,0,0.35)";
            for (const c of cells) {
                ctx.beginPath();
                ctx.arc(c.x + 2, c.y + 4, r, 0, Math.PI * 2);
                ctx.fill();
            }

            // Main territory fill (circles that overlap = smooth blob)
            ctx.fillStyle = p.territoryColor;
            for (const c of cells) {
                ctx.beginPath();
                ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            // Highlight on top edge (lighter circles, smaller, offset up)
            ctx.fillStyle = this.lighten(p.territoryColor, 0.15);
            for (const c of cells) {
                ctx.beginPath();
                ctx.arc(c.x, c.y - 1, r * 0.75, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    /**
     * Render trails as smooth thick curves.
     */
    renderTrails(players) {
        const ctx = this.ctx;

        for (const p of players) {
            if (!p.alive || p.trail.length < 2) continue;

            // Trail shadow
            ctx.beginPath();
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.lineWidth = 8 * this.scale * 50;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            const f = this.worldToScreen(p.trail[0].x, p.trail[0].y);
            ctx.moveTo(f.x + 1, f.y + 3);
            for (let i = 1; i < p.trail.length; i++) {
                const pt = this.worldToScreen(p.trail[i].x, p.trail[i].y);
                ctx.lineTo(pt.x + 1, pt.y + 3);
            }
            const pos = this.worldToScreen(p.x, p.y);
            ctx.lineTo(pos.x + 1, pos.y + 3);
            ctx.stroke();

            // Main trail
            ctx.beginPath();
            ctx.strokeStyle = p.trailColor;
            ctx.lineWidth = 6 * this.scale * 50;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            const first = this.worldToScreen(p.trail[0].x, p.trail[0].y);
            ctx.moveTo(first.x, first.y);
            for (let i = 1; i < p.trail.length; i++) {
                const pt = this.worldToScreen(p.trail[i].x, p.trail[i].y);
                ctx.lineTo(pt.x, pt.y);
            }
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();

            // Inner bright line
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2 * this.scale * 50;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.moveTo(first.x, first.y);
            for (let i = 1; i < p.trail.length; i++) {
                const pt = this.worldToScreen(p.trail[i].x, p.trail[i].y);
                ctx.lineTo(pt.x, pt.y);
            }
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    }

    renderPlayers(players) {
        const ctx = this.ctx;
        for (const p of players) {
            if (!p.alive) continue;
            const { x, y } = this.worldToScreen(p.x, p.y);
            const r = PLAYER_RADIUS * this.scale * 1.2;

            // Shadow
            ctx.beginPath();
            ctx.ellipse(x + 1, y + 3, r * 1.1, r * 0.7, 0, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fill();

            // Body
            const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, 0, x, y, r);
            grad.addColorStop(0, "#fff");
            grad.addColorStop(0.35, p.color);
            grad.addColorStop(1, this.darken(p.color, 0.4));
            ctx.beginPath();
            ctx.arc(x, y - 1, r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Direction dot
            const tipX = x + Math.cos(p.angle) * r * 0.6;
            const tipY = y - 1 + Math.sin(p.angle) * r * 0.6;
            ctx.beginPath();
            ctx.arc(tipX, tipY, r * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
        }
    }

    renderBorder() {
        const ctx = this.ctx;
        const tl = this.worldToScreen(0, 0);
        const br = this.worldToScreen(WORLD_SIZE, WORLD_SIZE);
        ctx.strokeStyle = "rgba(255,71,87,0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
    }

    lighten(color, amount) {
        let r, g, b;
        if (color.startsWith("rgb")) {
            [r, g, b] = color.match(/\d+/g).map(Number);
        } else {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        }
        r = Math.min(255, r + Math.floor(255 * amount));
        g = Math.min(255, g + Math.floor(255 * amount));
        b = Math.min(255, b + Math.floor(255 * amount));
        return `rgb(${r},${g},${b})`;
    }

    darken(color, factor) {
        let r, g, b;
        if (color.startsWith("rgb")) {
            [r, g, b] = color.match(/\d+/g).map(Number);
        } else {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        }
        return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
    }
}
