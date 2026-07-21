/**
 * MiniMap - Small overview of the full grid in the top-right corner.
 * Shows all territories as colored blocks, player positions as bright dots.
 */

class MiniMap {
    constructor() {
        this.size = 80; // px
        this.padding = 10;
    }

    render(ctx, engine, players, screenW) {
        const x = screenW - this.size - this.padding;
        const y = this.padding + 36; // below HUD
        const cellSize = this.size / GRID_SIZE;

        // Background
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(x - 2, y - 2, this.size + 4, this.size + 4);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 2, y - 2, this.size + 4, this.size + 4);

        // Draw territories (sample every 2 cells for performance)
        for (let gy = 0; gy < GRID_SIZE; gy += 2) {
            for (let gx = 0; gx < GRID_SIZE; gx += 2) {
                const cell = engine.grid[gy][gx];
                if (cell.owner !== null) {
                    const owner = players.find(p => p.id === cell.owner);
                    if (owner) {
                        ctx.fillStyle = owner.color;
                        ctx.fillRect(
                            x + gx * cellSize,
                            y + gy * cellSize,
                            cellSize * 2,
                            cellSize * 2
                        );
                    }
                }
                if (cell.trail !== null) {
                    const trailer = players.find(p => p.id === cell.trail);
                    if (trailer) {
                        ctx.fillStyle = trailer.trailColor || trailer.color;
                        ctx.globalAlpha = 0.7;
                        ctx.fillRect(
                            x + gx * cellSize,
                            y + gy * cellSize,
                            cellSize * 2,
                            cellSize * 2
                        );
                        ctx.globalAlpha = 1;
                    }
                }
            }
        }

        // Draw player positions as bright dots
        for (const p of players) {
            if (!p.alive) continue;
            const px = x + p.x * cellSize;
            const py = y + p.y * cellSize;
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
