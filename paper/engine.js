/**
 * Engine - Continuous movement Paper.io clone.
 * 
 * World is WORLD_SIZE x WORLD_SIZE units.
 * Territory stored as a grid (GRID_RES x GRID_RES) for fast fill.
 * Players move continuously at any angle (360°).
 * Trail is a list of points forming a smooth path.
 */

const WORLD_SIZE = 10000; // world units
const GRID_RES = 200; // territory grid resolution
const CELL_SIZE = WORLD_SIZE / GRID_RES;
const GAME_DURATION = 120;
const PLAYER_SPEED = 300; // units per second (faster for bigger map)
const PLAYER_RADIUS = 18;

class Engine {
    constructor() {
        this.grid = []; // territory ownership grid
        this.running = false;
        this.gameTime = 0;
        this.animFrameId = null;
        this.onUpdate = null;
        this.onRender = null;
        this.onGameEnd = null;
        this._lastTime = 0;
    }

    initGrid() {
        this.grid = [];
        for (let y = 0; y < GRID_RES; y++) {
            const row = new Int8Array(GRID_RES); // -1 = neutral, 0-5 = player id
            row.fill(-1);
            this.grid.push(row);
        }
    }

    /**
     * Convert world coords to grid coords.
     */
    worldToGrid(wx, wy) {
        return {
            gx: Math.floor(wx / CELL_SIZE),
            gy: Math.floor(wy / CELL_SIZE)
        };
    }

    /**
     * Set territory ownership for a circle of cells around a point.
     */
    setTerritoryCircle(wx, wy, radius, playerId) {
        const { gx: cx, gy: cy } = this.worldToGrid(wx, wy);
        const gr = Math.ceil(radius / CELL_SIZE);
        for (let dy = -gr; dy <= gr; dy++) {
            for (let dx = -gr; dx <= gr; dx++) {
                const x = cx + dx;
                const y = cy + dy;
                if (x >= 0 && x < GRID_RES && y >= 0 && y < GRID_RES) {
                    if (dx * dx + dy * dy <= gr * gr) {
                        this.grid[y][x] = playerId;
                    }
                }
            }
        }
    }

    /**
     * Check if a world position is in a player's territory.
     */
    isInTerritory(wx, wy, playerId) {
        const { gx, gy } = this.worldToGrid(wx, wy);
        if (gx < 0 || gx >= GRID_RES || gy < 0 || gy >= GRID_RES) return false;
        return this.grid[gy][gx] === playerId;
    }

    /**
     * Fill territory enclosed by a trail polygon using flood-fill.
     * The trail forms the border; everything inside that can't reach the edges = owned.
     */
    fillTerritory(playerId, trail) {
        if (trail.length < 3) return 0;

        // Mark trail cells as owned
        for (const pt of trail) {
            const { gx, gy } = this.worldToGrid(pt.x, pt.y);
            if (gx >= 0 && gx < GRID_RES && gy >= 0 && gy < GRID_RES) {
                this.grid[gy][gx] = playerId;
            }
        }

        // Rasterize trail as a filled polygon on the grid
        // Find bounding box
        let minGx = GRID_RES, maxGx = 0, minGy = GRID_RES, maxGy = 0;
        const gridTrail = trail.map(pt => {
            const g = this.worldToGrid(pt.x, pt.y);
            minGx = Math.min(minGx, g.gx); maxGx = Math.max(maxGx, g.gx);
            minGy = Math.min(minGy, g.gy); maxGy = Math.max(maxGy, g.gy);
            return g;
        });

        minGx = Math.max(0, minGx - 1); maxGx = Math.min(GRID_RES - 1, maxGx + 1);
        minGy = Math.max(0, minGy - 1); maxGy = Math.min(GRID_RES - 1, maxGy + 1);

        // Flood fill from edges of bounding box - anything unreachable = enclosed
        const w = maxGx - minGx + 1;
        const h = maxGy - minGy + 1;
        const visited = new Uint8Array(w * h);
        const queue = [];

        // Seed edges
        for (let x = minGx; x <= maxGx; x++) {
            if (this.grid[minGy][x] !== playerId) { queue.push(x - minGx + (0) * w); visited[(0) * w + x - minGx] = 1; }
            if (this.grid[maxGy][x] !== playerId) { queue.push(x - minGx + (h - 1) * w); visited[(h - 1) * w + x - minGx] = 1; }
        }
        for (let y = minGy; y <= maxGy; y++) {
            if (this.grid[y][minGx] !== playerId) { queue.push(0 + (y - minGy) * w); visited[(y - minGy) * w] = 1; }
            if (this.grid[y][maxGx] !== playerId) { queue.push(w - 1 + (y - minGy) * w); visited[(y - minGy) * w + w - 1] = 1; }
        }

        // BFS
        let qi = 0;
        while (qi < queue.length) {
            const idx = queue[qi++];
            const lx = idx % w;
            const ly = Math.floor(idx / w);
            const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
            for (const [ddx, ddy] of dirs) {
                const nx = lx + ddx;
                const ny = ly + ddy;
                if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
                const ni = ny * w + nx;
                if (visited[ni]) continue;
                const gx = nx + minGx;
                const gy = ny + minGy;
                if (this.grid[gy][gx] === playerId) continue;
                visited[ni] = 1;
                queue.push(ni);
            }
        }

        // Anything not visited = enclosed = claim it
        let filled = 0;
        for (let ly = 0; ly < h; ly++) {
            for (let lx = 0; lx < w; lx++) {
                if (!visited[ly * w + lx]) {
                    const gx = lx + minGx;
                    const gy = ly + minGy;
                    if (this.grid[gy][gx] !== playerId) {
                        this.grid[gy][gx] = playerId;
                        filled++;
                    }
                }
            }
        }
        return filled;
    }

    /**
     * Clear ALL territory for a player (on death).
     */
    clearTerritory(playerId) {
        for (let y = 0; y < GRID_RES; y++) {
            for (let x = 0; x < GRID_RES; x++) {
                if (this.grid[y][x] === playerId) this.grid[y][x] = -1;
            }
        }
    }

    /**
     * Count territory cells for a player.
     */
    countTerritory(playerId) {
        let count = 0;
        for (let y = 0; y < GRID_RES; y++) {
            for (let x = 0; x < GRID_RES; x++) {
                if (this.grid[y][x] === playerId) count++;
            }
        }
        return count;
    }

    getTerritoryPercent(playerId) {
        return (this.countTerritory(playerId) / (GRID_RES * GRID_RES) * 100).toFixed(1);
    }

    start() {
        this.running = true;
        this.gameTime = 0;
        this._lastTime = performance.now();
        this._loop();
    }

    stop() {
        this.running = false;
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    }

    _loop() {
        if (!this.running) return;
        const now = performance.now();
        const dt = Math.min((now - this._lastTime) / 1000, 0.05); // cap at 50ms
        this._lastTime = now;
        this.gameTime += dt;

        if (this.gameTime >= GAME_DURATION) {
            this.running = false;
            if (this.onGameEnd) this.onGameEnd();
            return;
        }

        if (this.onUpdate) this.onUpdate(dt);
        if (this.onRender) this.onRender(dt);

        this.animFrameId = requestAnimationFrame(() => this._loop());
    }
}
