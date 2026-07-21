/**
 * AI - Smarter bot behavior.
 * 
 * Key behaviors:
 * 1. ALWAYS avoid own trail and walls (survival priority)
 * 2. When outside territory, actively hunt nearby enemy trails
 * 3. Return home before trail gets too long
 * 4. When in territory, head toward nearest enemy trail to intercept
 */

const AI_TYPES = ["cautious", "expansive", "aggressive"];

class AIController {
    constructor(player, type) {
        this.player = player;
        this.type = type || AI_TYPES[Math.floor(Math.random() * AI_TYPES.length)];
        this.maxTrailLength = this.getMaxTrail();
        this.decisionCooldown = 0;
    }

    getMaxTrail() {
        switch (this.type) {
            case "cautious": return 10 + Math.floor(Math.random() * 8);
            case "expansive": return 20 + Math.floor(Math.random() * 15);
            case "aggressive": return 12 + Math.floor(Math.random() * 8);
            default: return 15;
        }
    }

    tick(engine, allPlayers) {
        if (!this.player.alive) return;
        this.decisionCooldown--;

        const p = this.player;
        const curDir = p.direction;

        // Priority 1: NEVER walk into death (own trail, wall, immediate danger)
        if (this.isDeadAhead(engine, curDir)) {
            const safeDir = this.findSafeDirection(engine);
            if (safeDir !== null) p.setDirection(safeDir);
            return;
        }

        // Priority 2: If trail is long, go home
        if (!p.isInOwnTerritory && p.trail.length >= this.maxTrailLength) {
            const homeDir = this.directionToward(engine, p, true);
            if (homeDir !== null && !this.isDeadAhead(engine, homeDir)) {
                p.setDirection(homeDir);
                return;
            }
        }

        // Priority 3: Aggressive AI hunts enemy trails
        if (this.type === "aggressive" || (this.type === "expansive" && Math.random() < 0.4)) {
            const huntDir = this.findNearbyEnemyTrail(engine, allPlayers);
            if (huntDir !== null && !this.isDeadAhead(engine, huntDir)) {
                p.setDirection(huntDir);
                return;
            }
        }

        // Priority 4: If in own territory, head outward
        if (p.isInOwnTerritory && this.decisionCooldown <= 0) {
            const outDir = this.findDirectionOutOfTerritory(engine);
            if (outDir !== null && !this.isDeadAhead(engine, outDir)) {
                p.setDirection(outDir);
                this.decisionCooldown = 3 + Math.floor(Math.random() * 4);
                return;
            }
        }

        // Priority 5: Random turn to avoid straight lines
        if (this.decisionCooldown <= 0 && Math.random() < 0.15) {
            const turn = this.randomSafeTurn(engine);
            if (turn !== null) p.setDirection(turn);
            this.decisionCooldown = 2 + Math.floor(Math.random() * 3);
        }
    }

    /**
     * Check if moving in direction `dir` would kill us.
     */
    isDeadAhead(engine, dir) {
        const nx = this.player.x + DIR_DX[dir];
        const ny = this.player.y + DIR_DY[dir];
        // Wall
        if (nx < 1 || nx >= GRID_SIZE - 1 || ny < 1 || ny >= GRID_SIZE - 1) return true;
        const cell = engine.getCell(nx, ny);
        if (!cell) return true;
        // Own trail
        if (cell.trail === this.player.id) return true;
        return false;
    }

    /**
     * Check if a direction is safe for 2 cells ahead.
     */
    isSafe(engine, dir) {
        if (this.isDeadAhead(engine, dir)) return false;
        // Check 2 cells ahead
        const nx = this.player.x + DIR_DX[dir] * 2;
        const ny = this.player.y + DIR_DY[dir] * 2;
        if (nx < 1 || nx >= GRID_SIZE - 1 || ny < 1 || ny >= GRID_SIZE - 1) return false;
        const cell = engine.getCell(nx, ny);
        if (cell && cell.trail === this.player.id) return false;
        return true;
    }

    /**
     * Find any safe direction (prefer forward, then sides).
     */
    findSafeDirection(engine) {
        const cur = this.player.direction;
        // Try sides first, then forward variants
        const options = [
            (cur + 1) % 4,
            (cur + 3) % 4,
            cur,
            (cur + 2) % 4, // reverse as last resort
        ];
        for (const d of options) {
            if (Math.abs(d - cur) === 2 && options.indexOf(d) < 3) continue; // skip reverse unless last
            if (!this.isDeadAhead(engine, d)) return d;
        }
        // Truly stuck - reverse
        return (cur + 2) % 4;
    }

    /**
     * Find direction toward own territory (BFS limited).
     */
    directionToward(engine, player, toHome) {
        const dirs = [0, 1, 2, 3];
        let bestDir = null;
        let bestDist = Infinity;

        for (const d of dirs) {
            if (Math.abs(d - player.direction) === 2) continue;
            // Check cells in this direction
            for (let dist = 1; dist <= 8; dist++) {
                const nx = player.x + DIR_DX[d] * dist;
                const ny = player.y + DIR_DY[d] * dist;
                const cell = engine.getCell(nx, ny);
                if (!cell) break;
                if (cell.trail === player.id) break; // Can't cross own trail
                if (toHome && cell.owner === player.id) {
                    if (dist < bestDist) { bestDist = dist; bestDir = d; }
                    break;
                }
            }
        }
        return bestDir;
    }

    /**
     * Scan nearby cells for enemy trails to intercept.
     */
    findNearbyEnemyTrail(engine, allPlayers) {
        const scanRange = this.type === "aggressive" ? 8 : 5;
        let bestDir = null;
        let bestDist = Infinity;

        for (const d of [0, 1, 2, 3]) {
            if (Math.abs(d - this.player.direction) === 2) continue;
            for (let dist = 1; dist <= scanRange; dist++) {
                const nx = this.player.x + DIR_DX[d] * dist;
                const ny = this.player.y + DIR_DY[d] * dist;
                const cell = engine.getCell(nx, ny);
                if (!cell) break;
                if (cell.trail === this.player.id) break; // blocked by own trail
                if (cell.trail !== null && cell.trail !== this.player.id) {
                    // Found enemy trail!
                    if (dist < bestDist) { bestDist = dist; bestDir = d; }
                    break;
                }
            }
        }
        return bestDir;
    }

    /**
     * Find direction that leads out of own territory.
     */
    findDirectionOutOfTerritory(engine) {
        const dirs = [0, 1, 2, 3];
        // Shuffle
        for (let i = dirs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
        }
        for (const d of dirs) {
            if (Math.abs(d - this.player.direction) === 2) continue;
            const nx = this.player.x + DIR_DX[d] * 3;
            const ny = this.player.y + DIR_DY[d] * 3;
            const cell = engine.getCell(nx, ny);
            if (cell && cell.owner !== this.player.id) return d;
        }
        return null;
    }

    /**
     * Pick a random safe turn (left or right).
     */
    randomSafeTurn(engine) {
        const cur = this.player.direction;
        const options = [(cur + 1) % 4, (cur + 3) % 4];
        // Shuffle
        if (Math.random() < 0.5) options.reverse();
        for (const d of options) {
            if (this.isSafe(engine, d)) return d;
        }
        return null;
    }
}
