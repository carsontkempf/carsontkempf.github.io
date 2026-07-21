/**
 * Renderer - Isometric 3D grid rendering (Crossy Road style).
 * 
 * Converts grid coordinates to screen coordinates using isometric projection.
 * Camera follows the player with smooth interpolation.
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.tileWidth = 32;
        this.tileHeight = 16; // half of width for isometric
        this.cameraX = 0;
        this.cameraY = 0;
        this.targetCamX = 0;
        this.targetCamY = 0;
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth * devicePixelRatio;
        this.canvas.height = window.innerHeight * devicePixelRatio;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        this.screenW = window.innerWidth;
        this.screenH = window.innerHeight;
    }

    /**
     * Convert grid (x, y) to screen pixel coordinates (isometric).
     */
    gridToScreen(gx, gy) {
        const sx = (gx - gy) * (this.tileWidth / 2);
        const sy = (gx + gy) * (this.tileHeight / 2);
        // Apply camera offset and center on screen
        return {
            x: sx - this.cameraX + this.screenW / 2,
            y: sy - this.cameraY + this.screenH / 2
        };
    }

    /**
     * Set camera target to follow a grid position.
     */
    setCameraTarget(gx, gy) {
        this.targetCamX = (gx - gy) * (this.tileWidth / 2);
        this.targetCamY = (gx + gy) * (this.tileHeight / 2);
    }

    /**
     * Smoothly interpolate camera toward target.
     */
    updateCamera(dt) {
        const lerp = 1 - Math.pow(0.05, dt);
        this.cameraX += (this.targetCamX - this.cameraX) * lerp;
        this.cameraY += (this.targetCamY - this.cameraY) * lerp;
    }

    /**
     * Clear the canvas.
     */
    clear() {
        this.ctx.clearRect(0, 0, this.screenW, this.screenH);
        // Background
        this.ctx.fillStyle = "#0d1117";
        this.ctx.fillRect(0, 0, this.screenW, this.screenH);
    }

    /**
     * Draw a single isometric tile at grid position.
     */
    drawTile(gx, gy, color, borderColor) {
        const { x, y } = this.gridToScreen(gx, gy);
        const tw = this.tileWidth / 2;
        const th = this.tileHeight / 2;

        // Skip if off-screen
        if (x < -tw * 2 || x > this.screenW + tw * 2 || y < -th * 4 || y > this.screenH + th * 4) return;

        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x, y - th);      // top
        ctx.lineTo(x + tw, y);      // right
        ctx.lineTo(x, y + th);      // bottom
        ctx.lineTo(x - tw, y);      // left
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();

        if (borderColor) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }

    /**
     * Draw a 3D block (cube) at grid position - for players.
     */
    drawBlock(gx, gy, color, height) {
        const { x, y } = this.gridToScreen(gx, gy);
        const tw = this.tileWidth / 2;
        const th = this.tileHeight / 2;
        const h = height || 12;

        const ctx = this.ctx;

        // Top face
        ctx.beginPath();
        ctx.moveTo(x, y - th - h);
        ctx.lineTo(x + tw, y - h);
        ctx.lineTo(x, y + th - h);
        ctx.lineTo(x - tw, y - h);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Right face (darker)
        ctx.beginPath();
        ctx.moveTo(x + tw, y - h);
        ctx.lineTo(x + tw, y);
        ctx.lineTo(x, y + th);
        ctx.lineTo(x, y + th - h);
        ctx.closePath();
        ctx.fillStyle = this.darken(color, 0.7);
        ctx.fill();

        // Left face (even darker)
        ctx.beginPath();
        ctx.moveTo(x - tw, y - h);
        ctx.lineTo(x - tw, y);
        ctx.lineTo(x, y + th);
        ctx.lineTo(x, y + th - h);
        ctx.closePath();
        ctx.fillStyle = this.darken(color, 0.5);
        ctx.fill();
    }

    /**
     * Render the full grid given engine state.
     */
    renderGrid(engine, players) {
        // Draw tiles back-to-front (isometric z-order)
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = engine.grid[y][x];
                let color = "#1a1f2e"; // neutral
                let border = "#252a3a";

                if (cell.owner !== null) {
                    const owner = players.find(p => p.id === cell.owner);
                    if (owner) {
                        color = owner.territoryColor;
                        border = null;
                    }
                }
                if (cell.trail !== null) {
                    const trailer = players.find(p => p.id === cell.trail);
                    if (trailer) {
                        color = trailer.trailColor;
                        border = null;
                    }
                }

                this.drawTile(x, y, color, border);
            }
        }

        // Draw players (sorted by y for z-order)
        const sorted = [...players].filter(p => p.alive).sort((a, b) => (a.y + a.x) - (b.y + b.x));
        for (const p of sorted) {
            this.drawBlock(p.x, p.y, p.color, 14);
        }
    }

    /**
     * Darken a hex color.
     */
    darken(hex, factor) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
    }
}
