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
        this.maxTrailTime = this.type === "cautious" ? 1.5 : this.type === "expansive" ? 3.5 : 2.5;
        this.maxTrailLength = this.type === "cautious" ? 15 : this.type === "expansive" ? 35 : 25;
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

        // Priority 2: Return home if trail is too long OR too much time outside
        const shouldReturn = (this.trailTime > this.maxTrailTime || p.trail.length > this.maxTrailLength) && !p.isInOwnTerritory;
        if (shouldReturn) {
            const homeAngle = this.angleToOwnTerritory(engine, p);
            if (homeAngle !== null) {
                p.setTargetAngle(homeAngle);
                return;
            }
        }

        // Priority 3: Hunt enemy trails (all bots try to kill player)
        // Only hunt if we're not too far from home
        if (this.trailTime < this.maxTrailTime * 0.6) {
            const huntAngle = this.findEnemyTrail(allPlayers, p);
            if (huntAngle !== null) {
                p.setTargetAngle(huntAngle);
                return;
            }
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
        // Circular arena boundary avoidance
        const cx = WORLD_SIZE / 2, cy = WORLD_SIZE / 2;
        const dx = p.x - cx, dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = p.arenaRadius || WORLD_SIZE / 2;
        const margin = 600;
        if (dist > radius - margin) {
            // Steer toward center
            return Math.atan2(cy - p.y, cx - p.x);
        }
        return null;
    }

    angleToOwnTerritory(engine, p) {
        // Scan in 16 directions for own territory (longer range)
        let bestAngle = null;
        let bestDist = Infinity;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
            for (let dist = 80; dist < 5000; dist += 60) {
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
        const range = this.type === "aggressive" ? 3000 : 2000;

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
