/**
 * Tokens - Wandering collectible tokens with small trails.
 * Move at 0.8x player speed. Collecting them earns jackpot spins.
 */

const TOKEN_SPEED = PLAYER_SPEED * 0.8;
const TOKEN_RADIUS = 20;
const TOKEN_TRAIL_MAX = 15; // max trail points
const TOKEN_COLORS = ["#ffd700", "#ff69b4", "#00ffcc"];
const TOKEN_SYMBOLS = ["⭐", "💎", "🔥"];

class Token {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 0, 1, 2
        this.color = TOKEN_COLORS[type];
        this.symbol = TOKEN_SYMBOLS[type];
        this.angle = Math.random() * Math.PI * 2;
        this.alive = true;
        this.trail = [];
        this.trailTimer = 0;
        this.turnTimer = 0;
    }

    update(dt) {
        if (!this.alive) return;

        // Wander - change direction occasionally
        this.turnTimer -= dt;
        if (this.turnTimer <= 0) {
            this.angle += (Math.random() - 0.5) * 1.5;
            this.turnTimer = 1 + Math.random() * 2;
        }

        // Move
        this.x += Math.cos(this.angle) * TOKEN_SPEED * dt;
        this.y += Math.sin(this.angle) * TOKEN_SPEED * dt;

        // Bounce off walls
        if (this.x < 500) { this.x = 500; this.angle = Math.PI - this.angle; }
        if (this.x > WORLD_SIZE - 500) { this.x = WORLD_SIZE - 500; this.angle = Math.PI - this.angle; }
        if (this.y < 500) { this.y = 500; this.angle = -this.angle; }
        if (this.y > WORLD_SIZE - 500) { this.y = WORLD_SIZE - 500; this.angle = -this.angle; }

        // Trail
        this.trailTimer -= dt;
        if (this.trailTimer <= 0) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > TOKEN_TRAIL_MAX) this.trail.shift();
            this.trailTimer = 0.1;
        }
    }

    /**
     * Check if a player is close enough to collect this token.
     */
    checkCollect(player) {
        if (!this.alive || !player.alive) return false;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        return (dx * dx + dy * dy) < (TOKEN_RADIUS + PLAYER_RADIUS) * (TOKEN_RADIUS + PLAYER_RADIUS);
    }
}

class TokenManager {
    constructor() {
        this.tokens = [];
        this.maxTokens = 8;
        this.spawnTimer = 0;
        this.collected = []; // types collected this game (for jackpot)
    }

    reset() {
        this.tokens = [];
        this.collected = [];
        this.spawnTimer = 0;
        // Spawn initial tokens
        for (let i = 0; i < this.maxTokens; i++) {
            this.spawnToken();
        }
    }

    spawnToken() {
        const x = 1000 + Math.random() * (WORLD_SIZE - 2000);
        const y = 1000 + Math.random() * (WORLD_SIZE - 2000);
        const type = Math.floor(Math.random() * 3);
        this.tokens.push(new Token(x, y, type));
    }

    update(dt, players) {
        // Update existing tokens
        for (const t of this.tokens) t.update(dt);

        // Check collection by human player (id=0)
        const human = players.find(p => p.id === 0);
        if (human && human.alive) {
            for (const t of this.tokens) {
                if (t.alive && t.checkCollect(human)) {
                    t.alive = false;
                    this.collected.push(t.type);
                }
            }
        }

        // Remove dead tokens and respawn
        this.tokens = this.tokens.filter(t => t.alive);
        this.spawnTimer -= dt;
        if (this.tokens.length < this.maxTokens && this.spawnTimer <= 0) {
            this.spawnToken();
            this.spawnTimer = 3 + Math.random() * 5;
        }
    }

    /**
     * Render tokens.
     */
    render(ctx, renderer) {
        for (const t of this.tokens) {
            if (!t.alive) continue;

            // Token trail
            if (t.trail.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = t.color;
                ctx.globalAlpha = 0.3;
                ctx.lineWidth = 2;
                ctx.lineCap = "round";
                const first = renderer.worldToScreen(t.trail[0].x, t.trail[0].y);
                ctx.moveTo(first.x, first.y);
                for (let i = 1; i < t.trail.length; i++) {
                    const pt = renderer.worldToScreen(t.trail[i].x, t.trail[i].y);
                    ctx.lineTo(pt.x, pt.y);
                }
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // Token body
            const { x, y } = renderer.worldToScreen(t.x, t.y);
            const r = TOKEN_RADIUS * renderer.scale;

            // Glow
            ctx.beginPath();
            ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = t.color;
            ctx.globalAlpha = 0.15;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Body
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = t.color;
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Symbol
            ctx.font = `${r * 1.2}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(t.symbol, x, y);
        }
    }
}
