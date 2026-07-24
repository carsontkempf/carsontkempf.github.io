/**
 * MiniMap - Circular overview of the arena.
 */

class MiniMap {
    constructor() {
        this.size = 80;
        this.padding = 10;
    }

    render(ctx, engine, players, screenW) {
        const screenH = window.innerHeight;
        const r = this.size / 2;
        const cx = screenW - r - this.padding;
        const cy = screenH - r - this.padding - 20;
        const cellSize = this.size / GRID_RES;
        const step = Math.max(2, Math.floor(GRID_RES / 40));

        // Clip to circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.clip();

        // Background circle
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.fill();

        // Territory
        for (let gy = 0; gy < GRID_RES; gy += step) {
            for (let gx = 0; gx < GRID_RES; gx += step) {
                const owner = engine.grid[gy][gx];
                if (owner === -1) continue;
                const player = players.find(p => p.id === owner);
                if (!player) continue;
                ctx.fillStyle = player.color;
                ctx.fillRect(cx - r + gx * cellSize, cy - r + gy * cellSize, cellSize * step + 0.5, cellSize * step + 0.5);
            }
        }

        // Player dots
        for (const p of players) {
            if (!p.alive) continue;
            const px = cx - r + (p.x / WORLD_SIZE) * this.size;
            const py = cy - r + (p.y / WORLD_SIZE) * this.size;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }

        ctx.restore();

        // Circle border
        ctx.beginPath();
        ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}
