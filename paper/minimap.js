/**
 * MiniMap - Overview of the arena in top-right corner.
 */

class MiniMap {
    constructor() {
        this.size = 80;
        this.padding = 10;
    }

    render(ctx, engine, players, screenW) {
        const screenH = window.innerHeight;
        const x = screenW - this.size - this.padding;
        const y = screenH - this.size - this.padding - 20; // bottom-right
        const cellSize = this.size / GRID_RES;
        const step = Math.max(2, Math.floor(GRID_RES / 40));

        // Background
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(x - 2, y - 2, this.size + 4, this.size + 4);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 2, y - 2, this.size + 4, this.size + 4);

        // Territory
        for (let gy = 0; gy < GRID_RES; gy += step) {
            for (let gx = 0; gx < GRID_RES; gx += step) {
                const owner = engine.grid[gy][gx];
                if (owner === -1) continue;
                const player = players.find(p => p.id === owner);
                if (!player) continue;
                ctx.fillStyle = player.color;
                ctx.fillRect(x + gx * cellSize, y + gy * cellSize, cellSize * step, cellSize * step);
            }
        }

        // Player dots
        for (const p of players) {
            if (!p.alive) continue;
            const px = x + (p.x / WORLD_SIZE) * this.size;
            const py = y + (p.y / WORLD_SIZE) * this.size;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
    }
}
