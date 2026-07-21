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

    setTerritoryCircle(wx, wy, radius, playerId) {
        const { gx: cx, gy: cy } = this.worldToGrid(wx, wy);
        const gr = Math.ceil(radius / CELL_SIZE);
        for (let dy = -gr; dy <= gr; dy++) {
            for (let dx = -gr; dx <= gr; dx++) {
                const x = cx + dx, y = cy + dy;
                if (x >= 0 && x < GRID_RES && y >= 0 && y < GRID_RES && dx * dx + dy * dy <= gr * gr) {
                    this.grid[y][x] = playerId;
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
     * Fill territory. Rasterizes trail as connected Bresenham lines then flood-fills.
     */
    fillTerritory(playerId, trail) {
        if (trail.length < 3) return 0;

        // Rasterize trail as connected line segments (gap-free)
        for (let i = 0; i < trail.length - 1; i++) {
            const g0 = this.worldToGrid(trail[i].x, trail[i].y);
            const g1 = this.worldToGrid(trail[i + 1].x, trail[i + 1].y);
            this._rasterLine(g0.gx, g0.gy, g1.gx, g1.gy, playerId);
        }

        // Bounding box
        let minX = GRID_RES, maxX = 0, minY = GRID_RES, maxY = 0;
        for (const pt of trail) {
            const g = this.worldToGrid(pt.x, pt.y);
            if (g.gx < minX) minX = g.gx; if (g.gx > maxX) maxX = g.gx;
            if (g.gy < minY) minY = g.gy; if (g.gy > maxY) maxY = g.gy;
        }
        minX = Math.max(0, minX - 2); maxX = Math.min(GRID_RES - 1, maxX + 2);
        minY = Math.max(0, minY - 2); maxY = Math.min(GRID_RES - 1, maxY + 2);

        // Flood fill from edges - unvisited = enclosed
        const w = maxX - minX + 1, h = maxY - minY + 1;
        const vis = new Uint8Array(w * h);
        const q = [];

        for (let x = minX; x <= maxX; x++) {
            const ti = x - minX, bi = (h - 1) * w + x - minX;
            if (this.grid[minY][x] !== playerId && !vis[ti]) { vis[ti] = 1; q.push(ti); }
            if (this.grid[maxY][x] !== playerId && !vis[bi]) { vis[bi] = 1; q.push(bi); }
        }
        for (let y = minY; y <= maxY; y++) {
            const li = (y - minY) * w, ri = (y - minY) * w + w - 1;
            if (this.grid[y][minX] !== playerId && !vis[li]) { vis[li] = 1; q.push(li); }
            if (this.grid[y][maxX] !== playerId && !vis[ri]) { vis[ri] = 1; q.push(ri); }
        }

        let qi = 0;
        while (qi < q.length) {
            const idx = q[qi++];
            const lx = idx % w, ly = (idx - lx) / w;
            for (const [dx, dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
                const nx = lx + dx, ny = ly + dy;
                if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
                const ni = ny * w + nx;
                if (vis[ni]) continue;
                if (this.grid[ny + minY][nx + minX] === playerId) continue;
                vis[ni] = 1;
                q.push(ni);
            }
        }

        let filled = 0;
        for (let ly = 0; ly < h; ly++) {
            for (let lx = 0; lx < w; lx++) {
                if (!vis[ly * w + lx]) {
                    const gx = lx + minX, gy = ly + minY;
                    if (this.grid[gy][gx] !== playerId) { this.grid[gy][gx] = playerId; filled++; }
                }
            }
        }
        return filled;
    }

    _rasterLine(x0, y0, x1, y1, pid) {
        const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        while (true) {
            if (x0 >= 0 && x0 < GRID_RES && y0 >= 0 && y0 < GRID_RES) this.grid[y0][x0] = pid;
            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
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
        if (this.onUpdate) this.onUpdate(dt);
        if (this.onRender) this.onRender(dt);
        this.animFrameId = requestAnimationFrame(() => this._loop());
    }
}
