/**
 * AI - Bot behavior for Paper Conquest.
 * 
 * AI types:
 * - cautious: makes small rectangles close to home
 * - expansive: makes bigger loops, more risk
 * - aggressive: targets player trails to kill them
 */

const AI_TYPES = ["cautious", "expansive", "aggressive"];

class AIController {
    constructor(player, type) {
        this.player = player;
        this.type = type || AI_TYPES[Math.floor(Math.random() * AI_TYPES.length)];
        this.targetTrailLength = this.getTargetLength();
        this.turnCooldown = 0;
        this.stuckCounter = 0;
        this.lastX = -1;
        this.lastY = -1;
    }

    getTargetLength() {
        switch (this.type) {
            case "cautious": return 4 + Math.floor(Math.random() * 4); // 4-7
            case "expansive": return 8 + Math.floor(Math.random() * 8); // 8-15
            case "aggressive": return 5 + Math.floor(Math.random() * 5); // 5-9
            default: return 6;
        }
    }

    /**
     * Called each game tick. Decides direction for the AI player.
     */
    tick(engine, allPlayers) {
        if (!this.player.alive) return;

        this.turnCooldown--;

        // Detect if stuck (same position as last tick = bounced off wall)
        if (this.player.x === this.lastX && this.player.y === this.lastY) {
            this.stuckCounter++;
            if (this.stuckCounter > 2) {
                this.randomTurn();
                this.stuckCounter = 0;
            }
        } else {
            this.stuckCounter = 0;
        }
        this.lastX = this.player.x;
        this.lastY = this.player.y;

        // Core behavior
        if (this.player.isInOwnTerritory) {
            this.behaviorInTerritory(engine, allPlayers);
        } else {
            this.behaviorOutside(engine, allPlayers);
        }
    }

    behaviorInTerritory(engine, allPlayers) {
        // If in own territory and no trail, head outward
        if (this.turnCooldown > 0) return;

        // Pick a direction toward the nearest edge of own territory
        const dir = this.findDirectionToEdge(engine);
        if (dir !== null) {
            this.player.setDirection(dir);
            this.turnCooldown = 2 + Math.floor(Math.random() * 3);
        }
    }

    behaviorOutside(engine, allPlayers) {
        // If trail is long enough, try to return home
        if (this.player.trail.length >= this.targetTrailLength) {
            const homeDir = this.findDirectionHome(engine);
            if (homeDir !== null) {
                this.player.setDirection(homeDir);
                return;
            }
        }

        // Aggressive: try to intercept player trails
        if (this.type === "aggressive" && Math.random() < 0.3) {
            const killDir = this.findKillOpportunity(engine, allPlayers);
            if (killDir !== null) {
                this.player.setDirection(killDir);
                return;
            }
        }

        // Avoid danger (walls, own trail, other trails that could kill us)
        if (this.isNextCellDangerous(engine)) {
            this.avoidDanger(engine);
            return;
        }

        // Random turns to make path interesting
        if (this.turnCooldown <= 0 && Math.random() < 0.2) {
            this.randomTurn();
            this.turnCooldown = 3;
        }
    }

    findDirectionToEdge(engine) {
        // Find direction that leads out of own territory
        const dirs = [0, 1, 2, 3];
        // Shuffle
        for (let i = dirs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
        }
        for (const d of dirs) {
            const nx = this.player.x + DIR_DX[d] * 3;
            const ny = this.player.y + DIR_DY[d] * 3;
            const cell = engine.getCell(nx, ny);
            if (cell && cell.owner !== this.player.id) {
                // Don't reverse
                if (Math.abs(d - this.player.direction) !== 2) return d;
            }
        }
        return null;
    }

    findDirectionHome(engine) {
        // Find direction that moves toward owned territory
        const dirs = [0, 1, 2, 3];
        let bestDir = null;
        let bestDist = Infinity;

        for (const d of dirs) {
            if (Math.abs(d - this.player.direction) === 2) continue; // no reverse
            const nx = this.player.x + DIR_DX[d];
            const ny = this.player.y + DIR_DY[d];
            const cell = engine.getCell(nx, ny);
            if (!cell) continue;
            if (cell.trail === this.player.id) continue; // don't walk own trail

            // Check if this cell is owned by us
            if (cell.owner === this.player.id) return d;

            // Otherwise measure distance to nearest own cell
            const dist = this.distToOwnTerritory(engine, nx, ny);
            if (dist < bestDist) { bestDist = dist; bestDir = d; }
        }
        return bestDir;
    }

    distToOwnTerritory(engine, fromX, fromY) {
        // Simple heuristic: check in a small radius
        for (let r = 1; r <= 10; r++) {
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    if (Math.abs(dx) + Math.abs(dy) !== r) continue;
                    const cell = engine.getCell(fromX + dx, fromY + dy);
                    if (cell && cell.owner === this.player.id) return r;
                }
            }
        }
        return 99;
    }

    findKillOpportunity(engine, allPlayers) {
        // Look for nearby player trails to intercept
        const dirs = [0, 1, 2, 3];
        for (const d of dirs) {
            if (Math.abs(d - this.player.direction) === 2) continue;
            for (let dist = 1; dist <= 3; dist++) {
                const nx = this.player.x + DIR_DX[d] * dist;
                const ny = this.player.y + DIR_DY[d] * dist;
                const cell = engine.getCell(nx, ny);
                if (cell && cell.trail !== null && cell.trail !== this.player.id) {
                    return d;
                }
            }
        }
        return null;
    }

    isNextCellDangerous(engine) {
        const nx = this.player.x + DIR_DX[this.player.direction];
        const ny = this.player.y + DIR_DY[this.player.direction];
        const cell = engine.getCell(nx, ny);
        if (!cell) return true; // wall
        if (cell.trail === this.player.id) return true; // own trail
        return false;
    }

    avoidDanger(engine) {
        // Try turning left or right
        const dirs = [(this.player.direction + 1) % 4, (this.player.direction + 3) % 4];
        for (const d of dirs) {
            const nx = this.player.x + DIR_DX[d];
            const ny = this.player.y + DIR_DY[d];
            const cell = engine.getCell(nx, ny);
            if (cell && cell.trail !== this.player.id) {
                this.player.setDirection(d);
                return;
            }
        }
        // Last resort: reverse (shouldn't happen often)
        this.player.setDirection((this.player.direction + 2) % 4);
    }

    randomTurn() {
        const options = [(this.player.direction + 1) % 4, (this.player.direction + 3) % 4];
        this.player.setDirection(options[Math.floor(Math.random() * options.length)]);
    }
}
