/**
 * Player - Handles movement, trail, territory claiming, and death.
 */

// Directions: 0=up, 1=right, 2=down, 3=left
const DIR_DX = [0, 1, 0, -1];
const DIR_DY = [-1, 0, 1, 0];

class Player {
    constructor(id, name, color, spawnX, spawnY) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.territoryColor = this.lighten(color, 0.3);
        this.trailColor = this.lighten(color, 0.6);
        this.x = spawnX;
        this.y = spawnY;
        this.direction = 2; // start moving down
        this.nextDirection = 2;
        this.alive = true;
        this.isInOwnTerritory = true;
        this.trail = []; // [{x, y}, ...] current trail cells
        this.kills = 0;
        this.deathTimer = 0;
    }

    /**
     * Set initial territory (3x3 around spawn).
     */
    spawnTerritory(engine) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                engine.setOwner(this.x + dx, this.y + dy, this.id);
            }
        }
    }

    /**
     * Change direction (no 180° turns allowed).
     */
    setDirection(newDir) {
        if (newDir < 0 || newDir > 3) return;
        // Can't reverse
        if (Math.abs(newDir - this.direction) === 2) return;
        this.nextDirection = newDir;
    }

    /**
     * Game tick - move one cell in current direction.
     * Returns event: null, "trail", "fill", "died", "kill"
     */
    tick(engine, allPlayers) {
        if (!this.alive) {
            this.deathTimer--;
            if (this.deathTimer <= 0) {
                this.respawn(engine);
            }
            return null;
        }

        // Apply queued direction
        this.direction = this.nextDirection;

        // Calculate next position
        const nx = this.x + DIR_DX[this.direction];
        const ny = this.y + DIR_DY[this.direction];

        // Boundary check - die at walls (like Paper.io)
        if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) {
            this.die(engine);
            return "died";
        }

        // Move
        this.x = nx;
        this.y = ny;

        const cell = engine.getCell(nx, ny);
        if (!cell) return null;

        // Check if we hit our own trail (suicide) - check BEFORE kill check
        if (cell.trail === this.id) {
            this.die(engine);
            return "died";
        }

        // Check if we hit someone else's trail (kill them)
        if (cell.trail !== null && cell.trail !== this.id) {
            const victim = allPlayers.find(p => p.id === cell.trail);
            if (victim && victim.alive) {
                victim.die(engine);
                this.kills++;
            }
            // After kill, the cell is now clear - continue our movement normally
            // Don't return early, process territory logic below
        }

        // Are we in our own territory?
        const inOwn = cell.owner === this.id;

        if (inOwn && !this.isInOwnTerritory && this.trail.length > 0) {
            // Returned home - fill territory!
            engine.fillTerritory(this.id);
            this.trail = [];
            this.isInOwnTerritory = true;
            return "fill";
        } else if (inOwn) {
            this.isInOwnTerritory = true;
            return null;
        } else {
            // Outside own territory - leave trail
            this.isInOwnTerritory = false;
            engine.setTrail(nx, ny, this.id);
            this.trail.push({ x: nx, y: ny });
            return "trail";
        }
    }

    /**
     * Kill this player.
     */
    die(engine) {
        this.alive = false;
        this.deathTimer = TICK_RATE; // 1 second respawn delay

        // Clear trail
        engine.clearTrail(this.id);
        this.trail = [];

        // Lose 50% of territory (random cells)
        const owned = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (engine.grid[y][x].owner === this.id) owned.push({ x, y });
            }
        }
        const toRemove = Math.floor(owned.length * 0.5);
        // Shuffle and remove
        for (let i = owned.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [owned[i], owned[j]] = [owned[j], owned[i]];
        }
        for (let i = 0; i < toRemove; i++) {
            engine.grid[owned[i].y][owned[i].x].owner = null;
        }
    }

    /**
     * Respawn in a random empty area.
     */
    respawn(engine) {
        // Find a random empty spot
        let attempts = 0;
        while (attempts < 100) {
            const rx = Math.floor(Math.random() * (GRID_SIZE - 6)) + 3;
            const ry = Math.floor(Math.random() * (GRID_SIZE - 6)) + 3;
            const cell = engine.getCell(rx, ry);
            if (cell && cell.owner === null && cell.trail === null) {
                this.x = rx;
                this.y = ry;
                this.alive = true;
                this.isInOwnTerritory = true;
                this.trail = [];
                this.direction = Math.floor(Math.random() * 4);
                this.nextDirection = this.direction;
                this.spawnTerritory(engine);
                return;
            }
            attempts++;
        }
        // Fallback: just spawn somewhere
        this.x = Math.floor(Math.random() * GRID_SIZE);
        this.y = Math.floor(Math.random() * GRID_SIZE);
        this.alive = true;
        this.isInOwnTerritory = true;
        this.trail = [];
        this.spawnTerritory(engine);
    }

    /**
     * Lighten a hex color.
     */
    lighten(hex, amount) {
        const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + Math.floor(255 * amount));
        const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + Math.floor(255 * amount));
        const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + Math.floor(255 * amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
