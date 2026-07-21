/**
 * AI - Continuous 360° movement bot controller.
 * 
 * Behaviors:
 * - Avoid walls (steer away when close)
 * - Avoid own trail (never cross it)
 * - Hunt enemy trails (steer toward them)
 * - Return home when trail is long
 * - Wander with smooth curves when exploring
 */

class AIController {
    constructor(player, type) {
        this.player = player;
        this.type = type || ["cautious", "aggressive", "expansive"][Math.floor(Math.random() * 3)];
        this.maxTrailTime = this.type === "cautious" ? 3 : this.type === "expansive" ? 6 : 4;
        this.wanderAngle = 0;
        this.wanderTimer = 0;
        this.trailTime = 0; // how long we've been outside territory
    }

    update(engine, allPlayers, dt) {
        if (!this.player.alive) return;

        const p = this.player;
        let steerAngle = p.angle;

        // Track time outside territory
        if (!p.isInOwnTerritory) {
            this.trailTime += dt;
        } else {
            this.trailTime = 0;
        }

        // Priority 1: Avoid walls
        const wallSteer = this.avoidWalls(p);
        if (wallSteer !== null) {
            p.setTargetAngle(wallSteer);
            return;
        }

        // Priority 2: Return home if trail is too long
        if (this.trailTime > this.maxTrailTime && !p.isInOwnTerritory) {
            const homeAngle = this.angleToOwnTerritory(engine, p);
            if (homeAngle !== null) {
                p.setTargetAngle(homeAngle);
                return;
            }
        }

        // Priority 3: Hunt enemy trails (all bots try to kill player)
        const huntAngle = this.findEnemyTrail(allPlayers, p);
        if (huntAngle !== null) {
            p.setTargetAngle(huntAngle);
            return;
        }

        // Priority 4: Wander with smooth curves
        this.wanderTimer -= dt;
        if (this.wanderTimer <= 0) {
            this.wanderAngle = p.angle + (Math.random() - 0.5) * 1.2;
            this.wanderTimer = 0.5 + Math.random() * 1.5;
        }
        p.setTargetAngle(this.wanderAngle);
    }

    avoidWalls(p) {
        const margin = 200;
        let steerX = 0, steerY = 0;
        if (p.x < margin) steerX += 1;
        if (p.x > WORLD_SIZE - margin) steerX -= 1;
        if (p.y < margin) steerY += 1;
        if (p.y > WORLD_SIZE - margin) steerY -= 1;
        if (steerX !== 0 || steerY !== 0) {
            return Math.atan2(steerY, steerX);
        }
        return null;
    }

    angleToOwnTerritory(engine, p) {
        // Scan in 8 directions for own territory
        let bestAngle = null;
        let bestDist = Infinity;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            for (let dist = 60; dist < 1000; dist += 40) {
                const tx = p.x + Math.cos(a) * dist;
                const ty = p.y + Math.sin(a) * dist;
                if (engine.isInTerritory(tx, ty, p.id)) {
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestAngle = a;
                    }
                    break;
                }
            }
        }
        return bestAngle;
    }

    findEnemyTrail(allPlayers, p) {
        let bestAngle = null;
        let bestDist = Infinity;
        const range = this.type === "aggressive" ? 1200 : 800;

        // Prioritize human player (id=0)
        const sorted = [...allPlayers].sort((a, b) => (a.id === 0 ? -1 : 1));

        for (const other of sorted) {
            if (other.id === p.id || !other.alive || other.trail.length < 2) continue;
            for (let i = 0; i < other.trail.length; i += 2) {
                const dx = other.trail[i].x - p.x;
                const dy = other.trail[i].y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < range && dist < bestDist) {
                    bestDist = dist;
                    bestAngle = Math.atan2(dy, dx);
                }
            }
            if (bestAngle !== null) break; // Found closest trail, go for it
        }
        return bestAngle;
    }
}
