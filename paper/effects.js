/**
 * Effects - Visual polish: particles, screen shake, trail glow, capture wave.
 */

class Effects {
    constructor() {
        this.particles = [];
        this.shakeIntensity = 0;
        this.shakeDecay = 0.9;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.captureWaves = []; // { x, y, radius, maxRadius, alpha, color }
        this.trailGlows = []; // { x, y, alpha, color }
    }

    /**
     * Trigger screen shake.
     */
    shake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }

    /**
     * Spawn particles at a grid position.
     */
    spawnParticles(screenX, screenY, color, count, type) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = 40 + Math.random() * 80;
            const life = 0.5 + Math.random() * 0.5;
            this.particles.push({
                x: screenX,
                y: screenY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (type === "up" ? 60 : 0),
                life: life,
                maxLife: life,
                color: color,
                size: 2 + Math.random() * 3,
                type: type || "burst",
                gravity: type === "up" ? 120 : 40,
            });
        }
    }

    /**
     * Add a capture wave effect at grid position.
     */
    addCaptureWave(screenX, screenY, color, radius) {
        this.captureWaves.push({
            x: screenX,
            y: screenY,
            radius: 0,
            maxRadius: radius || 60,
            alpha: 0.7,
            color: color,
        });
    }

    /**
     * Add trail glow at a position.
     */
    addTrailGlow(screenX, screenY, color) {
        this.trailGlows.push({
            x: screenX,
            y: screenY,
            alpha: 0.8,
            color: color,
        });
    }

    /**
     * Update all effects.
     */
    update(dt) {
        // Screen shake
        if (this.shakeIntensity > 0.1) {
            this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeIntensity *= this.shakeDecay;
        } else {
            this.shakeIntensity = 0;
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            p.vx *= 0.98;
        }

        // Capture waves
        for (let i = this.captureWaves.length - 1; i >= 0; i--) {
            const w = this.captureWaves[i];
            w.radius += 120 * dt;
            w.alpha -= 1.2 * dt;
            if (w.alpha <= 0 || w.radius >= w.maxRadius) {
                this.captureWaves.splice(i, 1);
            }
        }

        // Trail glows
        for (let i = this.trailGlows.length - 1; i >= 0; i--) {
            const g = this.trailGlows[i];
            g.alpha -= 2.5 * dt;
            if (g.alpha <= 0) {
                this.trailGlows.splice(i, 1);
            }
        }
    }

    /**
     * Render all effects.
     */
    render(ctx) {
        // Capture waves
        for (const w of this.captureWaves) {
            ctx.beginPath();
            ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
            ctx.strokeStyle = w.color;
            ctx.globalAlpha = w.alpha;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Trail glows
        for (const g of this.trailGlows) {
            ctx.beginPath();
            ctx.arc(g.x, g.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = g.color;
            ctx.globalAlpha = g.alpha * 0.5;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Particles
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            if (p.type === "sparkle") {
                // Diamond shape
                const s = p.size * alpha;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y - s);
                ctx.lineTo(p.x + s * 0.6, p.y);
                ctx.lineTo(p.x, p.y + s);
                ctx.lineTo(p.x - s * 0.6, p.y);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    /**
     * Trigger haptic feedback if available.
     */
    vibrate(ms) {
        if (navigator.vibrate) navigator.vibrate(ms || 20);
    }
}
