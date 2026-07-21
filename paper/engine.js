/**
 * Engine - Core game loop, grid state, and game clock.
 * 
 * The grid is a 2D array where each cell stores:
 * { owner: playerId|null, trail: playerId|null }
 * 
 * The engine runs at 60fps and ticks game logic at a fixed rate.
 */

const GRID_SIZE = 200;
const TICK_RATE = 15; // game logic ticks per second (player moves 15 cells/sec)
const GAME_DURATION = 120; // seconds

class Engine {
    constructor() {
        this.grid = [];
        this.players = []; // All players (human + AI)
        this.running = false;
        this.gameTime = 0; // elapsed seconds
        this.lastTick = 0;
        this.tickInterval = 1000 / TICK_RATE;
        this.animFrameId = null;
        this.onTick = null; // callback per game tick
        this.onRender = null; // callback per frame
        this.onGameEnd = null;
    }

    /**
     * Initialize the grid (all cells neutral).
     */
    initGrid() {
        this.grid = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            const row = [];
            for (let x = 0; x < GRID_SIZE; x++) {
                row.push({ owner: null, trail: null });
            }
            this.grid.push(row);
        }
    }

    /**
     * Get a cell safely (returns null if out of bounds).
     */
    getCell(x, y) {
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;
        return this.grid[y][x];
    }

    /**
     * Set cell ownership.
     */
    setOwner(x, y, playerId) {
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
        this.grid[y][x].owner = playerId;
        this.grid[y][x].trail = null;
    }

    /**
     * Set cell trail.
     */
    setTrail(x, y, playerId) {
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
        this.grid[y][x].trail = playerId;
    }

    /**
     * Clear all trail cells for a player.
     */
    clearTrail(playerId) {
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (this.grid[y][x].trail === playerId) {
                    this.grid[y][x].trail = null;
                }
            }
        }
    }

    /**
     * Count cells owned by a player.
     */
    countTerritory(playerId) {
        let count = 0;
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (this.grid[y][x].owner === playerId) count++;
            }
        }
        return count;
    }

    /**
     * Get territory percentage for a player.
     */
    getTerritoryPercent(playerId) {
        return (this.countTerritory(playerId) / (GRID_SIZE * GRID_SIZE) * 100).toFixed(1);
    }

    /**
     * Fill enclosed territory when a player's trail reconnects to their territory.
     * Uses flood-fill from edges: anything NOT reachable from outside = enclosed.
     */
    fillTerritory(playerId) {
        // Mark all trail cells as owned first
        const trailCells = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (this.grid[y][x].trail === playerId) {
                    this.grid[y][x].owner = playerId;
                    this.grid[y][x].trail = null;
                    trailCells.push({ x, y });
                }
            }
        }

        // Flood fill from edges to find cells NOT enclosed by this player
        const visited = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(false));
        const queue = [];

        // Seed from all edge cells that are NOT owned by this player
        for (let x = 0; x < GRID_SIZE; x++) {
            if (this.grid[0][x].owner !== playerId) { queue.push({ x, y: 0 }); visited[0][x] = true; }
            if (this.grid[GRID_SIZE - 1][x].owner !== playerId) { queue.push({ x, y: GRID_SIZE - 1 }); visited[GRID_SIZE - 1][x] = true; }
        }
        for (let y = 0; y < GRID_SIZE; y++) {
            if (this.grid[y][0].owner !== playerId) { queue.push({ x: 0, y }); visited[y][0] = true; }
            if (this.grid[y][GRID_SIZE - 1].owner !== playerId) { queue.push({ x: GRID_SIZE - 1, y }); visited[y][GRID_SIZE - 1] = true; }
        }

        // BFS flood fill
        const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
        while (queue.length > 0) {
            const { x, y } = queue.shift();
            for (const d of dirs) {
                const nx = x + d.x;
                const ny = y + d.y;
                if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) continue;
                if (visited[ny][nx]) continue;
                if (this.grid[ny][nx].owner === playerId) continue;
                visited[ny][nx] = true;
                queue.push({ x: nx, y: ny });
            }
        }

        // Any unvisited cell that isn't owned by this player is enclosed → claim it
        let filled = 0;
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (!visited[y][x] && this.grid[y][x].owner !== playerId) {
                    this.grid[y][x].owner = playerId;
                    this.grid[y][x].trail = null;
                    filled++;
                }
            }
        }

        return filled;
    }

    /**
     * Start the game loop.
     */
    start() {
        this.running = true;
        this.gameTime = 0;
        this.lastTick = performance.now();
        this._lastTime = performance.now();
        this._tickAccumulator = 0;
        this._loop();
    }

    /**
     * Stop the game loop.
     */
    stop() {
        this.running = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
    }

    _loop() {
        if (!this.running) return;

        const now = performance.now();
        const dt = now - this._lastTime;
        this._lastTime = now;

        // Accumulate time for fixed-rate ticks
        this._tickAccumulator += dt;
        while (this._tickAccumulator >= this.tickInterval) {
            this._tickAccumulator -= this.tickInterval;
            this.gameTime += 1 / TICK_RATE;

            // Game tick
            if (this.onTick) this.onTick();

            // Check game end
            if (this.gameTime >= GAME_DURATION) {
                this.running = false;
                if (this.onGameEnd) this.onGameEnd();
                return;
            }
        }

        // Render frame
        if (this.onRender) this.onRender(dt / 1000);

        this.animFrameId = requestAnimationFrame(() => this._loop());
    }
}
