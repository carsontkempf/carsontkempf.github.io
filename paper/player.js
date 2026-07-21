/**
 * Player - Continuous 360° movement, smooth trail, territory claiming.
 */

class Player {
    constructor(id, name, color, x, y) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.territoryColor = this.adjustColor(color, 0.4, 0.6);
        this.trailColor = this.adjustColor(color, 0.7, 0.9);
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2; // current heading (radians)
        this.targetAngle = this.angle;
        this.speed = PLAYER_SPEED;
        this.alive = true;
        this.isInOwnTerritory = true;
        this.trail = []; // [{x, y}, ...] smooth path points
        this.kills = 0;
        this.deathTimer = 0;
        this.trailCooldown = 0;
        this.hearts = 0; // respawn lives (0-3)
    }

    spawnTerritory(engine) {
        engine.setTerritoryCircle(this.x, this.y, 250, this.id);
    }

    /**
     * Set target angle (0 to 2PI). Player smoothly turns toward it.
     */
    setTargetAngle(angle) {
        this.targetAngle = angle;
    }

    /**
     * Update player position. dt = seconds since last frame.
     * Returns event: null, "trail", "fill", "died"
     */
    update(engine, allPlayers, dt) {
        if (!this.alive) {
            this.deathTimer -= dt;
            if (this.deathTimer <= 0) this.respawn(engine);
            return null;
        }

        // Smooth turning
        let angleDiff = this.targetAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        const turnSpeed = 5.0;
        this.angle += angleDiff * Math.min(1, turnSpeed * dt);

        // Move
        const prevX = this.x, prevY = this.y;
        const dx = Math.cos(this.angle) * this.speed * dt;
        const dy = Math.sin(this.angle) * this.speed * dt;
        this.x += dx;
        this.y += dy;

        // Boundary check - die at walls
        if (this.x < PLAYER_RADIUS || this.x > WORLD_SIZE - PLAYER_RADIUS ||
            this.y < PLAYER_RADIUS || this.y > WORLD_SIZE - PLAYER_RADIUS) {
            this.die(engine);
            return "died";
        }

        // Check if we crossed another player's trail (using line intersection)
        for (const other of allPlayers) {
            if (other.id === this.id || !other.alive) continue;
            if (other.trail.length < 2) continue;
            if (this.crossesTrailSegment(prevX, prevY, this.x, this.y, other.trail)) {
                other.die(engine);
                this.kills++;
            }
        }

        // Check if we crossed our own trail
        if (this.trail.length > 5 && this.crossesOwnTrail(prevX, prevY)) {
            this.die(engine);
            return "died";
        }

        // Territory logic
        const inOwn = engine.isInTerritory(this.x, this.y, this.id);

        if (inOwn && !this.isInOwnTerritory && this.trail.length > 3) {
            engine.fillTerritory(this.id, this.trail);
            this.trail = [];
            this.isInOwnTerritory = true;
            return "fill";
        } else if (inOwn) {
            this.isInOwnTerritory = true;
            return null;
        } else {
            this.isInOwnTerritory = false;
            this.trailCooldown -= dt;
            if (this.trailCooldown <= 0) {
                this.trail.push({ x: this.x, y: this.y });
                this.trailCooldown = 0.04;
            }
            return "trail";
        }
    }

    /**
     * Check if movement segment (prevX,prevY)→(x,y) crosses any segment of a trail.
     * Uses line-segment intersection - can't pass through.
     */
    crossesTrailSegment(px, py, cx, cy, trail) {
        for (let i = 0; i < trail.length - 1; i++) {
            if (this.segmentsIntersect(px, py, cx, cy, trail[i].x, trail[i].y, trail[i + 1].x, trail[i + 1].y)) {
                return true;
            }
        }
        // Also check proximity (for slow movement that might not cross but graze)
        const threshold = PLAYER_RADIUS;
        for (let i = 0; i < trail.length; i++) {
            const ddx = cx - trail[i].x;
            const ddy = cy - trail[i].y;
            if (ddx * ddx + ddy * ddy < threshold * threshold) return true;
        }
        return false;
    }

    /**
     * Check if we crossed our own trail.
     */
    crossesOwnTrail(prevX, prevY) {
        if (this.trail.length < 8) return false;
        // Check against all but the most recent 5 points
        const end = this.trail.length - 5;
        for (let i = 0; i < end - 1; i++) {
            if (this.segmentsIntersect(prevX, prevY, this.x, this.y,
                this.trail[i].x, this.trail[i].y, this.trail[i + 1].x, this.trail[i + 1].y)) {
                return true;
            }
        }
        // Proximity check
        const threshold = PLAYER_RADIUS * 0.8;
        for (let i = 0; i < end; i++) {
            const ddx = this.x - this.trail[i].x;
            const ddy = this.y - this.trail[i].y;
            if (ddx * ddx + ddy * ddy < threshold * threshold) return true;
        }
        return false;
    }

    /**
     * Line segment intersection test.
     * Returns true if segment (ax,ay)-(bx,by) intersects segment (cx,cy)-(dx,dy).
     */
    segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
        const d1 = this.cross(cx, cy, dx, dy, ax, ay);
        const d2 = this.cross(cx, cy, dx, dy, bx, by);
        const d3 = this.cross(ax, ay, bx, by, cx, cy);
        const d4 = this.cross(ax, ay, bx, by, dx, dy);
        if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
            ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
            return true;
        }
        return false;
    }

    cross(ax, ay, bx, by, cx, cy) {
        return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    }

    die(engine) {
        // If player has hearts, use one instead of dying
        if (this.hearts > 0) {
            this.hearts--;
            this.trail = [];
            // Don't clear territory - just reset trail and keep going
            this.isInOwnTerritory = true;
            // Teleport back to own territory
            this._returnToTerritory(engine);
            return;
        }
        this.alive = false;
        this.deathTimer = 1.5;
        this.trail = [];
        engine.clearTerritory(this.id);
    }

    _returnToTerritory(engine) {
        // Find a cell we own and teleport there
        for (let gy = 0; gy < GRID_RES; gy++) {
            for (let gx = 0; gx < GRID_RES; gx++) {
                if (engine.grid[gy][gx] === this.id) {
                    this.x = (gx + 0.5) * CELL_SIZE;
                    this.y = (gy + 0.5) * CELL_SIZE;
                    return;
                }
            }
        }
        // No territory found - just stay in place
    }

    respawn(engine) {
        this.x = 1000 + Math.random() * (WORLD_SIZE - 2000);
        this.y = 1000 + Math.random() * (WORLD_SIZE - 2000);
        this.alive = true;
        this.isInOwnTerritory = true;
        this.trail = [];
        this.angle = Math.random() * Math.PI * 2;
        this.targetAngle = this.angle;
        this.spawnTerritory(engine);
    }

    adjustColor(hex, satMult, lightMult) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const nr = Math.min(255, Math.floor(r * lightMult + 60 * satMult));
        const ng = Math.min(255, Math.floor(g * lightMult + 60 * satMult));
        const nb = Math.min(255, Math.floor(b * lightMult + 60 * satMult));
        return `rgb(${nr},${ng},${nb})`;
    }
}
