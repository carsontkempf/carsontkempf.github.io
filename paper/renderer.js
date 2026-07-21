/**
 * Renderer - Isometric 2.5D view (Crossy Road angle).
 * No grid lines. Smooth filled territories and curved trails.
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.baseScale = 1.2; // base zoom (zoomed in)
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

    /**
     * Convert world (x, y) to screen coords.
     * Uses a slight top-down perspective tilt (not full isometric) so speed looks uniform.
     */
    worldToScreen(wx, wy) {
        const s = this.scale;
        // Slight Y compression for depth feel (0.85 instead of full iso 0.5)
        const sx = (wx * s);
        const sy = (wy * s * 0.85);
        return {
            x: sx - this.cameraX + this.screenW / 2,
            y: sy - this.cameraY + this.screenH / 2
        };
    }

    setCameraTarget(wx, wy) {
        const s = this.scale;
        this.targetCamX = wx * s;
        this.targetCamY = wy * s * 0.85;
    }

    updateCamera(dt) {
        const lerp = 1 - Math.pow(0.01, dt);
        this.cameraX += (this.targetCamX - this.cameraX) * lerp;
        this.cameraY += (this.targetCamY - this.cameraY) * lerp;
        // Smooth zoom
        this.scale += (this.targetScale - this.scale) * lerp * 0.5;
    }

    /**
     * Set zoom based on territory percentage. More territory = zoom out.
     */
    setZoomForTerritory(pct) {
        // 0% = zoomed in (1.2), 50% = zoomed out (0.4)
        this.targetScale = Math.max(0.4, this.baseScale - pct * 0.016);
    }

    clear() {
        this.ctx.fillStyle = "#0d1117";
        this.ctx.fillRect(0, 0, this.screenW, this.screenH);
    }

    /**
     * Render territories as 3D raised colored surfaces.
     */
    renderTerritories(engine, players) {
        const ctx = this.ctx;
        const cellWorld = CELL_SIZE;
        const cs = cellWorld * this.scale; // screen size per cell
        const csY = cs * 0.85;
        const raise = 2; // 3D raise height in pixels

        // Draw each player's territory
        for (const p of players) {
            // First pass: draw the raised "side" (3D depth)
            const darkColor = this.darken(p.territoryColor, 0.5);
            ctx.fillStyle = darkColor;
            for (let gy = 0; gy < GRID_RES; gy++) {
                for (let gx = 0; gx < GRID_RES; gx++) {
                    if (engine.grid[gy][gx] !== p.id) continue;
                    const wx = gx * cellWorld + cellWorld / 2;
                    const wy = gy * cellWorld + cellWorld / 2;
                    const { x, y } = this.worldToScreen(wx, wy);
                    if (x < -cs || x > this.screenW + cs || y < -csY || y > this.screenH + csY) continue;

                    // Only draw side if no owned cell below
                    const below = gy + 1 < GRID_RES ? engine.grid[gy + 1][gx] : -1;
                    if (below !== p.id) {
                        ctx.fillRect(x - cs / 2, y + csY / 2 - raise, cs, raise + 1);
                    }
                }
            }

            // Second pass: draw the top face
            ctx.fillStyle = p.territoryColor;
            for (let gy = 0; gy < GRID_RES; gy++) {
                for (let gx = 0; gx < GRID_RES; gx++) {
                    if (engine.grid[gy][gx] !== p.id) continue;
                    const wx = gx * cellWorld + cellWorld / 2;
                    const wy = gy * cellWorld + cellWorld / 2;
                    const { x, y } = this.worldToScreen(wx, wy);
                    if (x < -cs || x > this.screenW + cs || y < -csY || y > this.screenH + csY) continue;
                    ctx.fillRect(x - cs / 2, y - csY / 2 - raise, cs + 0.5, csY + 0.5);
                }
            }
        }
    }

    /**
     * Render trails as smooth curves.
     */
    renderTrails(players) {
        const ctx = this.ctx;

        for (const p of players) {
            if (!p.alive || p.trail.length < 2) continue;

            ctx.beginPath();
            ctx.strokeStyle = p.trailColor;
            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            const first = this.worldToScreen(p.trail[0].x, p.trail[0].y);
            ctx.moveTo(first.x, first.y);

            // Draw smooth curve through trail points
            for (let i = 1; i < p.trail.length; i++) {
                const pt = this.worldToScreen(p.trail[i].x, p.trail[i].y);
                ctx.lineTo(pt.x, pt.y);
            }

            // Connect to player position
            const pos = this.worldToScreen(p.x, p.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();

            // Outer glow
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    /**
     * Render players as 3D-ish circles.
     */
    renderPlayers(players) {
        const ctx = this.ctx;

        for (const p of players) {
            if (!p.alive) continue;
            const { x, y } = this.worldToScreen(p.x, p.y);
            const r = PLAYER_RADIUS * this.scale;

            // Shadow
            ctx.beginPath();
            ctx.ellipse(x, y + 3, r * 1.1, r * 0.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.fill();

            // Body
            const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r);
            grad.addColorStop(0, "#fff");
            grad.addColorStop(0.3, p.color);
            grad.addColorStop(1, this.darken(p.color, 0.5));
            ctx.beginPath();
            ctx.arc(x, y - 2, r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Direction indicator
            const tipX = x + Math.cos(p.angle) * r * 0.7;
            const tipY = y - 2 + Math.sin(p.angle) * r * 0.7;
            ctx.beginPath();
            ctx.arc(tipX, tipY, r * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
        }
    }

    /**
     * Render arena border.
     */
    renderBorder() {
        const ctx = this.ctx;
        const tl = this.worldToScreen(0, 0);
        const tr = this.worldToScreen(WORLD_SIZE, 0);
        const br = this.worldToScreen(WORLD_SIZE, WORLD_SIZE);
        const bl = this.worldToScreen(0, WORLD_SIZE);
        ctx.beginPath();
        ctx.moveTo(tl.x, tl.y);
        ctx.lineTo(tr.x, tr.y);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(bl.x, bl.y);
        ctx.closePath();
        ctx.strokeStyle = "rgba(255,71,87,0.6)";
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    darken(hex, factor) {
        let r, g, b;
        if (hex.startsWith("rgb")) {
            [r, g, b] = hex.match(/\d+/g).map(Number);
        } else {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }
        return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
    }
}
