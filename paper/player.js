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
        this.trailCooldown = 0; // minimum distance between trail points
    }

    spawnTerritory(engine) {
        engine.setTerritoryCircle(this.x, this.y, 60, this.id);
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
        // Normalize to -PI..PI
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        const turnSpeed = 5.0; // radians/sec
        this.angle += angleDiff * Math.min(1, turnSpeed * dt);

        // Move
        const dx = Math.cos(this.angle) * this.speed * dt;
        const dy = Math.sin(this.angle) * this.speed * dt;
        const nx = this.x + dx;
        const ny = this.y + dy;

        // Boundary check - die at walls
        if (nx < PLAYER_RADIUS || nx > WORLD_SIZE - PLAYER_RADIUS ||
            ny < PLAYER_RADIUS || ny > WORLD_SIZE - PLAYER_RADIUS) {
            this.die(engine);
            return "died";
        }

        this.x = nx;
        this.y = ny;

        // Check if we crossed another player's trail
        for (const other of allPlayers) {
            if (other.id === this.id || !other.alive) continue;
            if (other.trail.length < 2) continue;
            if (this.crossesTrail(other.trail)) {
                other.die(engine);
                this.kills++;
            }
        }

        // Check if we crossed our own trail
        if (this.trail.length > 10 && this.crossesOwnTrail()) {
            this.die(engine);
            return "died";
        }

        // Territory logic
        const inOwn = engine.isInTerritory(this.x, this.y, this.id);

        if (inOwn && !this.isInOwnTerritory && this.trail.length > 3) {
            // Returned home - fill!
            engine.fillTerritory(this.id, this.trail);
            this.trail = [];
            this.isInOwnTerritory = true;
            return "fill";
        } else if (inOwn) {
            this.isInOwnTerritory = true;
            return null;
        } else {
            // Outside territory - add to trail
            this.isInOwnTerritory = false;
            this.trailCooldown -= dt;
            if (this.trailCooldown <= 0) {
                this.trail.push({ x: this.x, y: this.y });
                this.trailCooldown = 0.05; // add point every 50ms
            }
            return "trail";
        }
    }

    /**
     * Check if our current position crosses another player's trail.
     */
    crossesTrail(trail) {
        const threshold = PLAYER_RADIUS + 4;
        // Only check recent trail points (last 50 for performance)
        const start = Math.max(0, trail.length - 50);
        for (let i = start; i < trail.length - 1; i++) {
            const dist = this.distToSegment(
                this.x, this.y,
                trail[i].x, trail[i].y,
                trail[i + 1].x, trail[i + 1].y
            );
            if (dist < threshold) return true;
        }
        return false;
    }

    /**
     * Check if we crossed our own trail (skip recent points).
     */
    crossesOwnTrail() {
        if (this.trail.length < 15) return false;
        const threshold = PLAYER_RADIUS + 2;
        // Skip the last 10 points (too close to current position)
        for (let i = 0; i < this.trail.length - 12; i++) {
            const dx = this.x - this.trail[i].x;
            const dy = this.y - this.trail[i].y;
            if (dx * dx + dy * dy < threshold * threshold) return true;
        }
        return false;
    }

    /**
     * Distance from point to line segment.
     */
    distToSegment(px, py, ax, ay, bx, by) {
        const abx = bx - ax, aby = by - ay;
        const apx = px - ax, apy = py - ay;
        const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / (abx * abx + aby * aby + 0.001)));
        const cx = ax + t * abx, cy = ay + t * aby;
        const ddx = px - cx, ddy = py - cy;
        return Math.sqrt(ddx * ddx + ddy * ddy);
    }

    die(engine) {
        this.alive = false;
        this.deathTimer = 1.5;
        this.trail = [];
        // Clear ALL territory on death
        engine.clearTerritory(this.id);
    }

    respawn(engine) {
        this.x = 100 + Math.random() * (WORLD_SIZE - 200);
        this.y = 100 + Math.random() * (WORLD_SIZE - 200);
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
