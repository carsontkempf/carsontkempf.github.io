/**
 * Renderer - Isometric 2.5D view (Crossy Road angle).
 * No grid lines. Smooth filled territories and curved trails.
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.scale = 0.6; // zoom level
        // Isometric projection angles
        this.isoAngle = 0.46; // tilt (radians, ~26°)
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
     * Convert world (x, y) to screen coords with isometric projection.
     */
    worldToScreen(wx, wy) {
        const s = this.scale;
        const cos = Math.cos(this.isoAngle);
        const sin = Math.sin(this.isoAngle);
        // Rotate and scale
        const sx = (wx - wy) * s * 0.7;
        const sy = (wx + wy) * s * sin * 0.5;
        return {
            x: sx - this.cameraX + this.screenW / 2,
            y: sy - this.cameraY + this.screenH / 2
        };
    }

    setCameraTarget(wx, wy) {
        const s = this.scale;
        const sin = Math.sin(this.isoAngle);
        this.targetCamX = (wx - wy) * s * 0.7;
        this.targetCamY = (wx + wy) * s * sin * 0.5;
    }

    updateCamera(dt) {
        const lerp = 1 - Math.pow(0.01, dt);
        this.cameraX += (this.targetCamX - this.cameraX) * lerp;
        this.cameraY += (this.targetCamY - this.cameraY) * lerp;
    }

    clear() {
        this.ctx.fillStyle = "#0d1117";
        this.ctx.fillRect(0, 0, this.screenW, this.screenH);
    }

    /**
     * Render territories as colored regions.
     */
    renderTerritories(engine, players) {
        const ctx = this.ctx;
        const cellWorld = CELL_SIZE;

        // Only draw cells visible on screen (approximate)
        for (let gy = 0; gy < GRID_RES; gy++) {
            for (let gx = 0; gx < GRID_RES; gx++) {
                const owner = engine.grid[gy][gx];
                if (owner === -1) continue;

                const wx = gx * cellWorld + cellWorld / 2;
                const wy = gy * cellWorld + cellWorld / 2;
                const { x, y } = this.worldToScreen(wx, wy);

                // Cull off-screen
                if (x < -30 || x > this.screenW + 30 || y < -30 || y > this.screenH + 30) continue;

                const player = players.find(p => p.id === owner);
                if (!player) continue;

                // Draw as small filled diamond
                const s = cellWorld * this.scale * 0.35;
                const sy = s * Math.sin(this.isoAngle) * 0.7;
                ctx.fillStyle = player.territoryColor;
                ctx.beginPath();
                ctx.moveTo(x, y - sy);
                ctx.lineTo(x + s, y);
                ctx.lineTo(x, y + sy);
                ctx.lineTo(x - s, y);
                ctx.closePath();
                ctx.fill();
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
            const tipY = y - 2 + Math.sin(p.angle) * r * 0.4; // compressed for iso
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
        const corners = [
            this.worldToScreen(0, 0),
            this.worldToScreen(WORLD_SIZE, 0),
            this.worldToScreen(WORLD_SIZE, WORLD_SIZE),
            this.worldToScreen(0, WORLD_SIZE),
        ];
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y);
        ctx.closePath();
        ctx.strokeStyle = "rgba(255,71,87,0.5)";
        ctx.lineWidth = 2;
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
