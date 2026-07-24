/**
 * Engine - Continuous movement Paper.io clone.
 * World is WORLD_SIZE x WORLD_SIZE units.
 * Territory stored as grid (GRID_RES x GRID_RES).
 * Trail rasterized with Bresenham lines for gap-free filling.
 */

const WORLD_SIZE = 40000;
const GRID_RES = 300;
const CELL_SIZE = WORLD_SIZE / GRID_RES;
const GAME_DURATION = 120;
const PLAYER_SPEED = 2000;
const PLAYER_RADIUS = 30;

class Engine {
    constructor() {
        this.grid = [];
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
            const row = new Int8Array(GRID_RES);
            row.fill(-1);
            this.grid.push(row);
        }
    }

    worldToGrid(wx, wy) {
        return { gx: Math.floor(wx / CELL_SIZE), gy: Math.floor(wy / CELL_SIZE) };
    }

    setTerritoryCircle(wx, wy, radius, playerId, force) {
        const { gx: cx, gy: cy } = this.worldToGrid(wx, wy);
        const gr = Math.ceil(radius / CELL_SIZE);
        for (let dy = -gr; dy <= gr; dy++) {
            for (let dx = -gr; dx <= gr; dx++) {
                const x = cx + dx, y = cy + dy;
                if (x >= 0 && x < GRID_RES && y >= 0 && y < GRID_RES && dx * dx + dy * dy <= gr * gr) {
                    // Only claim unowned cells unless forced (human player initial spawn)
                    if (force || this.grid[y][x] === -1) {
                        this.grid[y][x] = playerId;
                    }
                }
            }
        }
    }

    isInTerritory(wx, wy, playerId) {
        const { gx, gy } = this.worldToGrid(wx, wy);
        if (gx < 0 || gx >= GRID_RES || gy < 0 || gy >= GRID_RES) return false;
        return this.grid[gy][gx] === playerId;
    }

    /**
     * Fill territory by expanding from existing territory outward,
     * bounded by the rasterized trail. Claims all cells reachable from
     * the player's territory that don't cross the trail boundary.
     */
    fillTerritory(playerId, trail) {
        if (trail.length < 2) return 0;

        // Step 1: Mark trail cells on a temporary boundary map
        const boundary = new Uint8Array(GRID_RES * GRID_RES);

        // Rasterize trail as thick 4-connected lines
        for (let i = 0; i < trail.length - 1; i++) {
            const g0 = this.worldToGrid(trail[i].x, trail[i].y);
            const g1 = this.worldToGrid(trail[i + 1].x, trail[i + 1].y);
            this._rasterLineOnMap(g0.gx, g0.gy, g1.gx, g1.gy, boundary);
        }

        // Step 2: Flood fill from ALL existing territory cells,
        // expanding into any cell that isn't already owned and isn't beyond the boundary.
        // We use a two-phase approach:
        // Phase A: find all cells reachable from territory without crossing boundary
        const visited = new Uint8Array(GRID_RES * GRID_RES);
        const queue = [];

        // Seed with all current territory cells
        for (let y = 0; y < GRID_RES; y++) {
            for (let x = 0; x < GRID_RES; x++) {
                if (this.grid[y][x] === playerId) {
                    const idx = y * GRID_RES + x;
                    visited[idx] = 1;
                    queue.push(idx);
                }
            }
        }

        // Also seed with all trail cells (they become territory)
        for (let i = 0; i < GRID_RES * GRID_RES; i++) {
            if (boundary[i] && !visited[i]) {
                visited[i] = 1;
                queue.push(i);
            }
        }

        // BFS expand - can go through boundary cells but stop at map edges
        let qi = 0;
        while (qi < queue.length) {
            const idx = queue[qi++];
            const cx = idx % GRID_RES;
            const cy = (idx - cx) / GRID_RES;
            for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
                const nx = cx + dx, ny = cy + dy;
                if (nx < 0 || nx >= GRID_RES || ny < 0 || ny >= GRID_RES) continue;
                const ni = ny * GRID_RES + nx;
                if (visited[ni]) continue;
                // Can only expand into cells that are bounded by the trail
                // Don't expand past boundary unless we're already inside
                if (!boundary[ni]) {
                    // Check if this cell is "inside" - only expand if bounded
                    // We'll do this differently below
                }
                visited[ni] = 1;
                queue.push(ni);
            }
        }

        // That approach floods everything. Instead, use the CORRECT Paper.io method:
        // The trail + territory forms a closed boundary. Everything INSIDE (smaller area)
        // that is enclosed between trail and territory gets claimed.
        // 
        // Correct method: flood from map edges, blocked by territory AND trail.
        // Everything unreachable from edges = enclosed = claimed.

        const outside = new Uint8Array(GRID_RES * GRID_RES);
        const q2 = [];

        // Seed all edge cells that aren't territory or trail
        for (let x = 0; x < GRID_RES; x++) {
            const ti = x, bi = (GRID_RES - 1) * GRID_RES + x;
            if (this.grid[0][x] !== playerId && !boundary[ti]) { outside[ti] = 1; q2.push(ti); }
            if (this.grid[GRID_RES-1][x] !== playerId && !boundary[bi]) { outside[bi] = 1; q2.push(bi); }
        }
        for (let y = 1; y < GRID_RES - 1; y++) {
            const li = y * GRID_RES, ri = y * GRID_RES + GRID_RES - 1;
            if (this.grid[y][0] !== playerId && !boundary[li]) { outside[li] = 1; q2.push(li); }
            if (this.grid[y][GRID_RES-1] !== playerId && !boundary[ri]) { outside[ri] = 1; q2.push(ri); }
        }

        // BFS from edges - blocked by territory and trail
        let qi2 = 0;
        while (qi2 < q2.length) {
            const idx = q2[qi2++];
            const cx = idx % GRID_RES;
            const cy = (idx - cx) / GRID_RES;
            for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
                const nx = cx + dx, ny = cy + dy;
                if (nx < 0 || nx >= GRID_RES || ny < 0 || ny >= GRID_RES) continue;
                const ni = ny * GRID_RES + nx;
                if (outside[ni]) continue;
                if (this.grid[ny][nx] === playerId) continue; // blocked by territory
                if (boundary[ni]) continue; // blocked by trail
                outside[ni] = 1;
                q2.push(ni);
            }
        }

        // Everything NOT outside and NOT already owned = enclosed = claim it
        let filled = 0;
        for (let y = 0; y < GRID_RES; y++) {
            for (let x = 0; x < GRID_RES; x++) {
                const idx = y * GRID_RES + x;
                if (!outside[idx] && this.grid[y][x] !== playerId) {
                    this.grid[y][x] = playerId;
                    filled++;
                }
            }
        }
        return filled;
    }

    /**
     * Rasterize a line onto a boundary map (4-connected, no diagonal gaps).
     */
    _rasterLineOnMap(x0, y0, x1, y1, map) {
        const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        while (true) {
            if (x0 >= 0 && x0 < GRID_RES && y0 >= 0 && y0 < GRID_RES) {
                map[y0 * GRID_RES + x0] = 1;
                this.grid[y0][x0] = arguments[4] !== undefined ? arguments[4] : this.grid[y0][x0]; // don't overwrite grid here
            }
            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy && e2 < dx) {
                err -= dy; x0 += sx;
                if (x0 >= 0 && x0 < GRID_RES && y0 >= 0 && y0 < GRID_RES) map[y0 * GRID_RES + x0] = 1;
                err += dx; y0 += sy;
            } else if (e2 > -dy) {
                err -= dy; x0 += sx;
            } else {
                err += dx; y0 += sy;
            }
        }
    }

    clearTerritory(playerId) {
        for (let y = 0; y < GRID_RES; y++)
            for (let x = 0; x < GRID_RES; x++)
                if (this.grid[y][x] === playerId) this.grid[y][x] = -1;
    }

    countTerritory(playerId) {
        let c = 0;
        for (let y = 0; y < GRID_RES; y++)
            for (let x = 0; x < GRID_RES; x++)
                if (this.grid[y][x] === playerId) c++;
        return c;
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
        const dt = Math.min((now - this._lastTime) / 1000, 0.05);
        this._lastTime = now;
        this.gameTime += dt;
        if (this.gameTime >= GAME_DURATION) { this.running = false; if (this.onGameEnd) this.onGameEnd(); return; }
        try {
            if (this.onUpdate) this.onUpdate(dt);
            if (this.onRender) this.onRender(dt);
        } catch (e) {
            console.error("Loop error:", e);
            if (typeof dbg === "function") dbg("LOOP ERR:" + e.message);
            this.running = false;
            return;
        }
        if (!this._frameCount) this._frameCount = 0;
        this._frameCount++;
        if (this._frameCount === 1 && typeof dbg === "function") dbg("frame1 OK");
        this.animFrameId = requestAnimationFrame(() => this._loop());
    }
}
