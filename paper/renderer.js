/**
 * Renderer - Top-down 2D view (Paper.io style).
 * 
 * Switched from isometric to top-down for smoother feel and proper curves.
 * Camera follows player with smooth interpolation.
 * Trails drawn as smooth connected paths with rounded corners.
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.cellSize = 16; // pixels per grid cell
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

    gridToScreen(gx, gy) {
        return {
            x: gx * this.cellSize - this.cameraX + this.screenW / 2,
            y: gy * this.cellSize - this.cameraY + this.screenH / 2
        };
    }

    setCameraTarget(gx, gy) {
        this.targetCamX = gx * this.cellSize;
        this.targetCamY = gy * this.cellSize;
    }

    updateCamera(dt) {
        const lerp = 1 - Math.pow(0.02, dt);
        this.cameraX += (this.targetCamX - this.cameraX) * lerp;
        this.cameraY += (this.targetCamY - this.cameraY) * lerp;
    }

    clear() {
        this.ctx.fillStyle = "#1a1f2e";
        this.ctx.fillRect(0, 0, this.screenW, this.screenH);
    }

    /**
     * Render territories as filled regions, trails as smooth paths.
     */
    renderGrid(engine, players) {
        const ctx = this.ctx;
        const cs = this.cellSize;

        // Visible bounds
        const startX = Math.max(0, Math.floor((this.cameraX - this.screenW / 2) / cs) - 1);
        const endX = Math.min(GRID_SIZE, Math.ceil((this.cameraX + this.screenW / 2) / cs) + 1);
        const startY = Math.max(0, Math.floor((this.cameraY - this.screenH / 2) / cs) - 1);
        const endY = Math.min(GRID_SIZE, Math.ceil((this.cameraY + this.screenH / 2) / cs) + 1);

        // Draw grid background with subtle lines
        ctx.strokeStyle = "#222838";
        ctx.lineWidth = 0.3;
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const sx = x * cs - this.cameraX + this.screenW / 2;
                const sy = y * cs - this.cameraY + this.screenH / 2;
                ctx.strokeRect(sx, sy, cs, cs);
            }
        }

        // Draw territory fills
        for (const p of players) {
            ctx.fillStyle = p.territoryColor;
            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    if (engine.grid[y][x].owner === p.id) {
                        const sx = x * cs - this.cameraX + this.screenW / 2;
                        const sy = y * cs - this.cameraY + this.screenH / 2;
                        ctx.fillRect(sx, sy, cs, cs);
                    }
                }
            }
        }

        // Draw trails as smooth thick lines
        for (const p of players) {
            if (p.trail.length < 2) {
                // Single trail cell - draw a dot
                if (p.trail.length === 1) {
                    const { x, y } = this.gridToScreen(p.trail[0].x + 0.5, p.trail[0].y + 0.5);
                    ctx.beginPath();
                    ctx.arc(x, y, cs * 0.35, 0, Math.PI * 2);
                    ctx.fillStyle = p.trailColor;
                    ctx.fill();
                }
                continue;
            }

            ctx.beginPath();
            ctx.strokeStyle = p.trailColor;
            ctx.lineWidth = cs * 0.7;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            const first = this.gridToScreen(p.trail[0].x + 0.5, p.trail[0].y + 0.5);
            ctx.moveTo(first.x, first.y);

            for (let i = 1; i < p.trail.length; i++) {
                const pt = this.gridToScreen(p.trail[i].x + 0.5, p.trail[i].y + 0.5);
                ctx.lineTo(pt.x, pt.y);
            }

            // Connect trail to current player position
            if (p.alive && !p.isInOwnTerritory) {
                const pos = this.gridToScreen(p.x + 0.5, p.y + 0.5);
                ctx.lineTo(pos.x, pos.y);
            }

            ctx.stroke();

            // Draw trail border (darker outline)
            ctx.strokeStyle = p.color;
            ctx.lineWidth = cs * 0.3;
            ctx.stroke();
        }

        // Draw arena border
        const bx = 0 * cs - this.cameraX + this.screenW / 2;
        const by = 0 * cs - this.cameraY + this.screenH / 2;
        ctx.strokeStyle = "#ff4757";
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, GRID_SIZE * cs, GRID_SIZE * cs);
    }

    /**
     * Draw a player as a circle with direction indicator.
     */
    drawPlayer(player) {
        if (!player.alive) return;
        const { x, y } = this.gridToScreen(player.x + 0.5, player.y + 0.5);
        const r = this.cellSize * 0.6;
        const ctx = this.ctx;

        // Shadow
        ctx.beginPath();
        ctx.ellipse(x, y + 2, r, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fill();

        // Body circle
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
        grad.addColorStop(0, this.lighten(player.color, 0.3));
        grad.addColorStop(1, player.color);
        ctx.fillStyle = grad;
        ctx.fill();

        // White outline
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Direction arrow
        const angle = [3 * Math.PI / 2, 0, Math.PI / 2, Math.PI][player.direction];
        const ax = x + Math.cos(angle) * r * 0.5;
        const ay = y + Math.sin(angle) * r * 0.5;
        ctx.beginPath();
        ctx.arc(ax, ay, r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
    }

    lighten(hex, amount) {
        const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + Math.floor(255 * amount));
        const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + Math.floor(255 * amount));
        const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + Math.floor(255 * amount));
        return `rgb(${r},${g},${b})`;
    }

    darken(hex, factor) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
    }
}
